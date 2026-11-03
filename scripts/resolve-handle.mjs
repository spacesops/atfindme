#!/usr/bin/env node
import { Fabric } from "@spacesprotocol/fabric-web";

const handle = process.argv[2];
if (!handle) {
  process.stderr.write("usage: resolve-handle.mjs <handle>\n");
  process.exit(2);
}

const seeds = process.env.FABRIC_SEEDS?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const fabric = new Fabric({
  seeds: seeds?.length ? seeds : undefined,
  devMode: process.env.FABRIC_DEV_MODE === "true",
});

const zone = await fabric.resolve(handle);
process.stdout.write(zone ? JSON.stringify(zone.toJson()) : "null");
