import type { SipRecord } from "./types";

const HANDLE_RE = /^[a-z0-9._-]+@[a-z0-9._-]+$/i;
const SPACE_RE = /^@[a-z0-9._-]+$/i;

export function normalizeQuery(raw: string): string {
  return decodeURIComponent(raw).trim().toLowerCase();
}

export function isValidHandle(q: string): boolean {
  return HANDLE_RE.test(q) || SPACE_RE.test(q);
}

export function initials(handle: string): string {
  const label = handle.split(/[@#]/)[0] || handle;
  return label.slice(0, 2).toLowerCase();
}

export function avatarGradient(handle: string): string {
  let h = 0;
  for (let i = 0; i < handle.length; i++) h = (h * 33 + handle.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `linear-gradient(145deg, hsl(${hue} 20% 46%), hsl(${hue} 26% 26%))`;
}

export function parseRecords(raw: unknown): SipRecord[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => recordFromItem(item));
  }
  if (typeof raw === "object") {
    const rec = raw as Record<string, unknown>;
    const out: SipRecord[] = [];
    for (const kind of ["txt", "addr"] as const) {
      const bag = rec[kind];
      if (bag && typeof bag === "object" && !Array.isArray(bag)) {
        for (const [key, value] of Object.entries(bag as Record<string, unknown>)) {
          const vals = Array.isArray(value) ? value.map(String) : [String(value)];
          out.push({ type: kind, key, value: vals });
        }
      }
    }
    if (Array.isArray(rec.records)) {
      out.push(...rec.records.flatMap((item) => recordFromItem(item)));
    }
    return out;
  }
  return [];
}

function recordFromItem(item: unknown): SipRecord[] {
  if (!item || typeof item !== "object") return [];
  const obj = item as Record<string, unknown>;
  const type = String(obj.type ?? "txt").toLowerCase();
  if (type === "seq" || type === "sig" || type === "malformed" || type === "unknown") {
    return [];
  }
  const key = obj.key;
  if (typeof key !== "string" || !key) return [];
  let value = obj.value;
  if (typeof value === "string") value = [value];
  if (!Array.isArray(value)) return [];
  return [{ type, key, value: value.map(String) }];
}

export function toHex(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") {
    const s = value.startsWith("0x") ? value.slice(2) : value;
    return s.length ? s : undefined;
  }
  if (Array.isArray(value) && value.every((n) => typeof n === "number")) {
    return Buffer.from(value).toString("hex");
  }
  if (value instanceof Uint8Array) {
    return Buffer.from(value).toString("hex");
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.hex === "string") return toHex(obj.hex);
    if (Array.isArray(obj.data)) return toHex(obj.data);
  }
  return undefined;
}

export function extractAnchor(json: Record<string, unknown>): number | undefined {
  const direct = json.anchor;
  if (typeof direct === "number") return direct;
  if (typeof direct === "string" && /^\d+$/.test(direct)) return Number(direct);
  const commitment = json.commitment;
  if (commitment && typeof commitment === "object") {
    const c = commitment as Record<string, unknown>;
    if (typeof c.block_height === "number") return c.block_height;
    const onchain = c.onchain;
    if (onchain && typeof onchain === "object") {
      const o = onchain as Record<string, unknown>;
      if (typeof o.block_height === "number") return o.block_height;
    }
    if (typeof c.block === "number") return c.block;
  }
  return undefined;
}

export function formatAnchor(height?: number): string | undefined {
  if (height == null) return undefined;
  return `block ${height.toLocaleString("en-US")}`;
}

export function shorten(value: string, head = 20): string {
  if (value.length <= head + 1) return value;
  return `${value.slice(0, head)}…`;
}
