import "server-only";

const PUBLIC_RELAYS = [
  "https://relay-cosmos.spacesprotocol.org",
  "https://relay-atlas.spacesprotocol.org",
  "https://relay-orion.spacesprotocol.org",
  "https://relay-pulsar.spacesprotocol.org",
];

export function certrelaySeeds(): string[] {
  const raw = process.env.FABRIC_SEEDS;
  if (raw?.trim()) {
    const list = raw
      .split(",")
      .map((s) => s.trim().replace(/\/$/, ""))
      .filter(Boolean);
    if (list.length) return list;
  }
  return PUBLIC_RELAYS;
}

export function randomCertrelay(): string {
  const seeds = certrelaySeeds();
  return seeds[Math.floor(Math.random() * seeds.length)]!;
}

export function shuffledCertrelays(): string[] {
  const seeds = [...certrelaySeeds()];
  for (let i = seeds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [seeds[i], seeds[j]] = [seeds[j]!, seeds[i]!];
  }
  return seeds;
}
