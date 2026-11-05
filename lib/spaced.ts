import "server-only";

import { parseRecords } from "./parse";
import type { SipRecord } from "./types";

type JsonRpcResult = {
  result?: unknown;
  error?: { code?: number; message?: string };
};

function truthy(value: string | undefined): boolean | null {
  if (value === undefined) return null;
  const v = value.trim().toLowerCase();
  if (!v) return null;
  if (["0", "false", "off", "no"].includes(v)) return false;
  if (["1", "true", "on", "yes"].includes(v)) return true;
  return null;
}

/** On-chain spaced JSON-RPC. Off when SPACED_ENABLED is false, or when no SPACED_RPC_URL is set. */
export function spacedEnabled(): boolean {
  if (truthy(process.env.SPACED_ENABLED) === false) return false;
  return Boolean(rpcUrl());
}

function rpcUrl(): string | null {
  const url = process.env.SPACED_RPC_URL?.trim();
  if (!url) return null;
  return url.replace(/0\.0\.0\.0/g, "127.0.0.1");
}

function authHeader(): string | undefined {
  const user = process.env.SPACED_RPC_USER ?? "";
  const pass = process.env.SPACED_RPC_PASSWORD ?? "";
  if (!user && !pass) return undefined;
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

export async function spacedRpc<T>(method: string, params: unknown[] = []): Promise<T | null> {
  if (!spacedEnabled()) return null;
  const url = rpcUrl();
  if (!url) return null;
  const headers: Record<string, string> = { "content-type": "application/json" };
  const auth = authHeader();
  if (auth) headers.authorization = auth;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[spaced] ${method} HTTP ${res.status}`);
      return null;
    }
    const body = (await res.json()) as JsonRpcResult;
    if (body.error) {
      console.warn(`[spaced] ${method} ${body.error.message}`);
      return null;
    }
    return (body.result as T) ?? null;
  } catch (err) {
    console.warn(`[spaced] ${method} failed`, err);
    return null;
  }
}

export async function getServerTip(): Promise<number | undefined> {
  const info = await spacedRpc<{ tip?: { height?: number }; chain?: { headers?: number } }>(
    "getserverinfo",
  );
  return info?.tip?.height ?? info?.chain?.headers;
}

type GetNumResponse = {
  name?: string;
  script_pubkey?: string;
  num?: { name?: string; id?: string };
  records?: unknown;
};

export async function getNum(subject: string): Promise<{
  alias?: string;
  script_pubkey?: string;
  records: SipRecord[];
} | null> {
  const raw = await spacedRpc<GetNumResponse>("getnum", [subject]);
  if (!raw) return null;
  const alias = raw.name ?? raw.num?.name;
  const script_pubkey =
    typeof raw.script_pubkey === "string" ? raw.script_pubkey.replace(/^0x/, "") : undefined;
  return {
    alias: alias ? String(alias) : undefined,
    script_pubkey,
    records: parseRecords(raw.records),
  };
}

type FallbackResponse = {
  data?: string;
  records?: unknown;
};

export async function getFallback(subject: string): Promise<SipRecord[]> {
  const raw = await spacedRpc<FallbackResponse | Record<string, FallbackResponse>>(
    "getfallback",
    [subject],
  );
  if (!raw) return [];
  if (typeof raw === "object" && "records" in raw) {
    return parseRecords((raw as FallbackResponse).records);
  }
  if (typeof raw === "object") {
    const first = Object.values(raw as Record<string, FallbackResponse>)[0];
    return parseRecords(first?.records);
  }
  return [];
}
