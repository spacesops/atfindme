import "server-only";

import QRCode from "qrcode";
import { resolveZoneJson } from "./fabric";
import { extractAnchor, isValidHandle, normalizeQuery, parseRecords, toHex } from "./parse";
import { pickPay } from "./records";
import { getFallback, getNum, spacedEnabled } from "./spaced";
import type { HandleProfile, SipRecord } from "./types";

export async function lookupHandle(raw: string): Promise<HandleProfile> {
  const handle = normalizeQuery(raw);
  if (!handle || !isValidHandle(handle)) {
    return { handle, found: false, valid: false, sovereign: false, records: [], fallback_records: [] };
  }

  let zoneJson: Record<string, unknown> | null = null;
  try {
    zoneJson = await resolveZoneJson(handle);
  } catch (err) {
    console.warn("[fabric] resolve failed", err);
    return {
      handle,
      found: false,
      valid: true,
      sovereign: false,
      records: [],
      fallback_records: [],
      error: "Relay lookup failed. Try again in a moment.",
    };
  }

  if (!zoneJson) {
    return { handle, found: false, valid: true, sovereign: false, records: [], fallback_records: [] };
  }

  const records = parseRecords(zoneJson.records ?? zoneJson);
  const sovereignty = String(zoneJson.sovereignty ?? "");
  const sovereign = sovereignty.toLowerCase() === "sovereign";
  const num_id =
    typeof zoneJson.num_id === "string"
      ? zoneJson.num_id
      : typeof zoneJson.numId === "string"
        ? zoneJson.numId
        : undefined;
  let alias = typeof zoneJson.alias === "string" ? zoneJson.alias : undefined;
  let script_pubkey = toHex(zoneJson.script_pubkey ?? zoneJson.scriptPubkey);
  const anchor = extractAnchor(zoneJson);

  const useSpaced = spacedEnabled();
  let fallback_records: SipRecord[] = useSpaced ? parseRecords(zoneJson.fallback_records) : [];
  if (useSpaced) {
    const subjects = [num_id, handle].filter((s): s is string => Boolean(s));
    for (const subject of subjects) {
      try {
        const num = await getNum(subject);
        if (num) {
          alias = alias || num.alias;
          script_pubkey = script_pubkey || num.script_pubkey;
          if (!fallback_records.length && num.records.length) fallback_records = num.records;
        }
        if (!fallback_records.length) {
          fallback_records = await getFallback(subject);
        }
        if (fallback_records.length) break;
      } catch (err) {
        console.warn("[spaced] enrich failed", err);
      }
    }
  }

  const profile: HandleProfile = {
    handle,
    found: true,
    valid: true,
    sovereign,
    sovereignty: sovereignty || undefined,
    records,
    fallback_records,
    num_id,
    alias,
    script_pubkey,
    anchor,
    spacedEnabled: useSpaced,
  };

  const pay = pickPay(records);
  if (pay) {
    profile.payUri = pay.uri;
    profile.payLabel = pay.label;
    profile.isBolt12 = pay.isBolt12;
    try {
      profile.payQr = await QRCode.toDataURL(pay.uri, {
        margin: 1,
        width: 220,
        color: { dark: "#0a0a0c", light: "#ffffff" },
      });
    } catch (err) {
      console.warn("[qr] failed", err);
    }
  }

  return profile;
}

export function toApiJson(profile: HandleProfile) {
  return {
    handle: profile.handle,
    found: profile.found,
    valid: profile.valid,
    sovereign: profile.sovereign,
    sovereignty: profile.sovereignty,
    records: profile.records,
    fallback_records: profile.fallback_records,
    num_id: profile.num_id,
    alias: profile.alias,
    script_pubkey: profile.script_pubkey,
    anchor: profile.anchor,
    error: profile.error,
    spaced_enabled: profile.spacedEnabled ?? false,
  };
}
