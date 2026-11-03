import "server-only";

import { resolveZoneJson } from "./fabric";
import { parseRecords } from "./parse";
import { randomCertrelay } from "./relays";
import type { SipRecord } from "./types";

export type DirectoryEntry = {
  handle: string;
  website: string | null;
  error: string | null;
};

type AddrsResponse = {
  address?: string;
  handles?: { handle?: string; rev?: string }[];
};

const CACHE_MS = 5 * 60 * 1000;
let cache: { at: number; entries: DirectoryEntry[]; relay: string } | null = null;

function websiteFromRecords(records: SipRecord[]): string | null {
  for (const rec of records) {
    if (rec.type !== "txt" || rec.key.toLowerCase() !== "website") continue;
    for (const value of rec.value) {
      if (/^https?:\/\//i.test(value.trim())) return value.trim();
    }
  }
  return null;
}

async function fetchDirectoryHandles(relay: string): Promise<string[]> {
  const url = `${relay}/addrs?${new URLSearchParams({ name: "service-type", addr: "directory" })}`;
  const res = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "atfindme" },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    throw new Error(`directory query failed (${res.status})`);
  }
  const body = (await res.json()) as AddrsResponse;
  const handles = (body.handles ?? [])
    .map((h) => (h.handle || h.rev || "").trim())
    .filter(Boolean);
  return [...new Set(handles)].slice(0, 25);
}

async function lookupWebsite(handle: string): Promise<DirectoryEntry> {
  try {
    const zone = await resolveZoneJson(handle);
    if (!zone) {
      return { handle, website: null, error: `${handle}: handle not found` };
    }
    const records = parseRecords(zone.records ?? zone);
    const website = websiteFromRecords(records);
    if (!website) {
      return { handle, website: null, error: `${handle}: no txt website=http(s)://… record` };
    }
    return { handle, website, error: null };
  } catch (err) {
    console.warn("[directory] resolve failed", handle, err);
    return { handle, website: null, error: `${handle}: lookup failed` };
  }
}

export async function listDirectory(): Promise<{ entries: DirectoryEntry[]; relay: string }> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return { entries: cache.entries, relay: cache.relay };
  }
  const relay = randomCertrelay();
  const handles = await fetchDirectoryHandles(relay);
  const entries = await Promise.all(handles.map(lookupWebsite));
  cache = { at: Date.now(), entries, relay };
  return { entries, relay };
}
