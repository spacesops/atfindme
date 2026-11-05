import { execSync, spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const requested = process.argv[2] ?? "serve";
const mode = requested === "dev" ? "dev" : requested === "start" || requested === "serve" ? requested : "serve";

const loadedFiles = [];

function loadEnvFile(name) {
  const file = path.join(root, name);
  if (!existsSync(file)) return;
  loadedFiles.push(name);
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

if (mode === "dev") {
  loadEnvFile(".env");
  loadEnvFile(".env.local");
} else {
  loadEnvFile(".env");
  loadEnvFile(".env.production");
  loadEnvFile(".env.production.local");
  loadEnvFile(".env.local");
}

const host = (process.env.HOST || process.env.HOST_IP || process.env.HOSTNAME || "127.0.0.1").trim();
const port = (process.env.PORT || process.env.HOST_PORT || "3000").trim();
const env = { ...process.env, HOST: host, HOSTNAME: host, PORT: port, NODE_ENV: mode === "dev" ? process.env.NODE_ENV : "production" };

function redact(key, value) {
  if (value == null || value === "") return value === "" ? "(empty)" : "(unset)";
  if (/password|secret|token|_key$/i.test(key)) return "****";
  return value;
}

function echoUsedEnv() {
  const keys = [
    "NODE_ENV",
    "HOST",
    "PORT",
    "NEXT_PUBLIC_SITE_NAME",
    "FABRIC_SEEDS",
    "FABRIC_DEV_MODE",
    "SPACED_ENABLED",
    "SPACED_RPC_URL",
    "SPACED_RPC_USER",
    "SPACED_RPC_PASSWORD",
    "SPACED_CHAIN",
  ];
  console.log(`atfindme env files: ${loadedFiles.length ? loadedFiles.join(", ") : "(none)"}`);
  for (const key of keys) {
    const raw = env[key];
    const display = raw === undefined || raw === "" ? (raw === "" ? "(empty)" : "(unset)") : redact(key, raw);
    console.log(`  ${key}=${display}`);
  }
}

function pidsOnPort(p) {
  try {
    const out = execSync(`lsof -nP -iTCP:${Number(p)} -sTCP:LISTEN -t`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out ? [...new Set(out.split(/\s+/).map(Number).filter(Boolean))] : [];
  } catch {
    return [];
  }
}

function projectNextPids() {
  const self = process.pid;
  const found = new Set();
  try {
    const ps = execSync("ps -ax -o pid=,command=", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    for (const line of ps.split("\n")) {
      const m = line.trim().match(/^(\d+)\s+(.*)$/);
      if (!m) continue;
      const pid = Number(m[1]);
      const cmd = m[2];
      if (!pid || pid === self) continue;
      if (!cmd.includes(root)) continue;
      if (!/next\/dist\/bin\/next|scripts\/listen\.mjs/.test(cmd)) continue;
      found.add(pid);
    }
  } catch {
    /* ps unavailable */
  }
  return [...found];
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function killPid(pid, signal) {
  try {
    process.kill(pid, signal);
  } catch {
    /* already gone */
  }
}

function freeExisting() {
  const targets = new Set([...pidsOnPort(port), ...projectNextPids()]);
  for (const pid of targets) killPid(pid, "SIGTERM");
  const deadline = Date.now() + 2500;
  while (Date.now() < deadline) {
    const left = [...pidsOnPort(port), ...projectNextPids()];
    if (!left.length) return;
    sleep(150);
  }
  for (const pid of [...pidsOnPort(port), ...projectNextPids()]) killPid(pid, "SIGKILL");
}

echoUsedEnv();

const nextBin = path.join(root, "node_modules/next/dist/bin/next");
if (!existsSync(nextBin)) {
  console.error("next is not installed. Run npm ci (or npm install) in this directory.");
  process.exit(1);
}

freeExisting();

let nextMode = mode === "dev" ? "dev" : "start";
if (mode === "serve") {
  console.log("Building production bundle…");
  const build = spawnSync(process.execPath, [nextBin, "build"], { cwd: root, stdio: "inherit", env });
  if (build.status) process.exit(build.status ?? 1);
  nextMode = "start";
}

if (nextMode === "start" && !existsSync(path.join(root, ".next", "BUILD_ID"))) {
  console.error("No production build. Run npm run build, or use npm run serve / npm run dev.");
  process.exit(1);
}

console.log(`atfindme listening on http://${host}:${port} (${nextMode})`);
const child = spawn(process.execPath, [nextBin, nextMode, "--hostname", host, "--port", port], {
  cwd: root,
  stdio: "inherit",
  env,
});
child.on("exit", (code, signal) => {
  if (signal) {
    try {
      process.kill(process.pid, signal);
    } catch {
      process.exit(1);
    }
    return;
  }
  process.exit(code ?? 1);
});
