import type { RecordGroup, SipRecord } from "./types";

export type RecordMeta = {
  label: string;
  icon: string;
  group: RecordGroup;
  description: string | null;
  href?: (value: string) => string | null;
  pay?: (value: string) => string;
  color: string;
  gradient?: string[];
};

const stripAt = (v: string) => v.replace(/^@+/, "").trim();
const asHttp = (v: string) => (/^https?:\/\//i.test(v) ? v : `https://${v}`);

const CATALOG: Record<string, RecordMeta> = {
  btc: {
    label: "Bitcoin address",
    icon: "bitcoin",
    group: "pay",
    description: "On-chain address",
    pay: (v) => `bitcoin:${v}`,
    color: "#E08A2E",
  },
  sp: {
    label: "Silent payment",
    icon: "eyeoff",
    group: "pay",
    description: "Silent payment address",
    pay: (v) => `bitcoin:${v}`,
    color: "#E08A2E",
  },
  ln: {
    label: "Lightning offer",
    icon: "zap",
    group: "pay",
    description: "BOLT12 offer",
    pay: (v) => `lightning:${v}`,
    color: "#8B5CF6",
  },
  liquid: {
    label: "Liquid",
    icon: "droplet",
    group: "pay",
    description: "Liquid address",
    color: "#5B9BD5",
  },
  ark: {
    label: "Ark",
    icon: "anchor",
    group: "pay",
    description: "Ark address",
    color: "#4BB77B",
  },
  nostr: {
    label: "Nostr",
    icon: "nostr",
    group: "link",
    description: "Nostr profile",
    href: (v) => `https://njump.me/${v}`,
    color: "#8E30EB",
    gradient: ["#7A2FE0", "#B54DFF"],
  },
  pgp: {
    label: "PGP fingerprint",
    icon: "key",
    group: "key",
    description: "PGP key",
    color: "#8A857E",
  },
  ssh: {
    label: "SSH key",
    icon: "terminal",
    group: "key",
    description: "SSH public key",
    color: "#8A857E",
  },
  age: {
    label: "age key",
    icon: "lock",
    group: "key",
    description: "Public encryption key",
    color: "#8A857E",
  },
  did: {
    label: "DID",
    icon: "key",
    group: "key",
    description: "Decentralised identifier",
    color: "#8A857E",
  },
  x: {
    label: "X",
    icon: "x",
    group: "link",
    description: "Formerly Twitter",
    href: (v) => `https://x.com/${stripAt(v)}`,
    color: "#000000",
    gradient: ["#000000", "#232427"],
  },
  twitter: {
    label: "X",
    icon: "x",
    group: "link",
    description: "Formerly Twitter",
    href: (v) => `https://x.com/${stripAt(v)}`,
    color: "#000000",
    gradient: ["#000000", "#232427"],
  },
  bluesky: {
    label: "Bluesky",
    icon: "bluesky",
    group: "link",
    description: "on Bluesky",
    href: (v) => `https://bsky.app/profile/${stripAt(v)}`,
    color: "#0085FF",
    gradient: ["#0074E4", "#48B0FF"],
  },
  instagram: {
    label: "Instagram",
    icon: "instagram",
    group: "link",
    description: "Photos",
    href: (v) => `https://instagram.com/${stripAt(v)}`,
    color: "#D62976",
    gradient: ["#FEDA75", "#FA7E1E", "#D62976", "#962FBF"],
  },
  mastodon: {
    label: "Mastodon",
    icon: "mastodon",
    group: "link",
    description: "on the Fediverse",
    href: (v) => {
      const m = stripAt(v).match(/^([^@]+)@(.+)$/);
      return m ? `https://${m[2]}/@${m[1]}` : asHttp(v);
    },
    color: "#6364FF",
    gradient: ["#5A4BDA", "#8A8CFF"],
  },
  telegram: {
    label: "Telegram",
    icon: "telegram",
    group: "link",
    description: "Direct message",
    href: (v) => `https://t.me/${stripAt(v)}`,
    color: "#229ED9",
    gradient: ["#1C93C4", "#2FB0F0"],
  },
  discord: {
    label: "Discord",
    icon: "discord",
    group: "link",
    description: "Chat",
    color: "#5865F2",
    gradient: ["#4752C4", "#7983F6"],
  },
  github: {
    label: "GitHub",
    icon: "github",
    group: "link",
    description: "Code & projects",
    href: (v) => `https://github.com/${stripAt(v)}`,
    color: "#181717",
    gradient: ["#181717", "#464646"],
  },
  email: {
    label: "Email",
    icon: "mail",
    group: "link",
    description: "Email address",
    href: (v) => `mailto:${v}`,
    color: "#5B9BD5",
    gradient: ["#4E86BE", "#7BB4E8"],
  },
  website: {
    label: "Website",
    icon: "globe",
    group: "link",
    description: "Homepage",
    href: (v) => asHttp(v),
    color: "#5B9BD5",
  },
  note: {
    label: "Note",
    icon: "file",
    group: "note",
    description: "Free-form note",
    color: "#8A857E",
  },
  notes: {
    label: "Notes",
    icon: "file",
    group: "note",
    description: "Free-form note",
    color: "#8A857E",
  },
  tor: {
    label: "Onion address",
    icon: "globe",
    group: "link",
    description: "Onion service",
    href: (v) => `http://${v}`,
    color: "#8A857E",
  },
  hyper: {
    label: "HyperDHT key",
    icon: "hash",
    group: "note",
    description: "HyperDHT key",
    color: "#8A857E",
  },
};

export function metaFor(record: SipRecord): RecordMeta {
  const key = record.key.toLowerCase();
  return (
    CATALOG[key] ?? {
      label: record.key,
      icon: "file",
      group: "note",
      description: null,
      color: "#8A857E",
    }
  );
}

export function iconBackground(meta: RecordMeta): string {
  const g = meta.gradient;
  if (g && g.length >= 2) {
    return `linear-gradient(135deg, ${g.join(", ")})`;
  }
  return `linear-gradient(135deg, ${meta.color}, ${meta.color})`;
}

export function truncateValue(value: string, max = 30): string {
  if (value.length <= max) return value;
  return `${value.slice(0, 20)}…${value.slice(-8)}`;
}

export function pickPay(records: SipRecord[]): {
  record: SipRecord;
  uri: string;
  label: string;
  isBolt12: boolean;
} | null {
  const order = ["ln", "btc", "sp", "liquid", "ark"];
  for (const key of order) {
    const rec = records.find((r) => r.key.toLowerCase() === key && r.value[0]);
    if (!rec) continue;
    const meta = metaFor(rec);
    const value = rec.value[0];
    const uri = meta.pay ? meta.pay(value) : value;
    return {
      record: rec,
      uri,
      label: meta.label,
      isBolt12: key === "ln",
    };
  }
  return null;
}

export const TAB_SECTIONS: { title: string; groups: RecordGroup[] }[] = [
  { title: "Payments and keys", groups: ["pay", "key"] },
  { title: "Links", groups: ["link"] },
  { title: "Note", groups: ["note"] },
];
