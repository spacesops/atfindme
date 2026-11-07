import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
  outputFileTracingRoot: dir,
  devIndicators: false,
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: [
    "@spacesprotocol/fabric-web",
    "@spacesprotocol/fabric-core",
    "@spacesprotocol/libveritas",
  ],
};

export default nextConfig;
