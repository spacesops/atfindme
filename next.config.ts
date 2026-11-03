import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: dir,
  devIndicators: false,
  serverExternalPackages: [
    "@spacesprotocol/fabric-web",
    "@spacesprotocol/fabric-core",
    "@spacesprotocol/libveritas",
  ],
};

export default nextConfig;
