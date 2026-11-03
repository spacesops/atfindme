import "server-only";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

function parseStdout(stdout: string): Record<string, unknown> | null {
  const trimmed = stdout.trim();
  if (!trimmed || trimmed === "null") return null;
  const start = trimmed.indexOf("{");
  const json = start >= 0 ? trimmed.slice(start) : trimmed;
  return JSON.parse(json) as Record<string, unknown>;
}

export async function resolveZoneJson(handle: string): Promise<Record<string, unknown> | null> {
  const script = path.join(process.cwd(), "scripts/resolve-handle.mjs");
  const env: NodeJS.ProcessEnv = { ...process.env };
  try {
    const { stdout } = await execFileAsync(process.execPath, [script, handle], {
      env,
      timeout: 45_000,
      maxBuffer: 12 * 1024 * 1024,
    });
    return parseStdout(stdout);
  } catch (err) {
    const stdout = err && typeof err === "object" && "stdout" in err ? String((err as { stdout?: string }).stdout ?? "") : "";
    if (stdout.trim()) {
      try {
        return parseStdout(stdout);
      } catch {
        /* fall through */
      }
    }
    throw err;
  }
}
