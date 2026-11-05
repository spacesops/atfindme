import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2] === "dev" ? "dev" : "start";

function loadEnvFile(name) {
  const file = path.join(root, name);
  if (!existsSync(file)) return;
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

const nextBin = path.join(root, "node_modules/next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, mode, "--hostname", host, "--port", port], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, HOST: host, HOSTNAME: host, PORT: port },
});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
