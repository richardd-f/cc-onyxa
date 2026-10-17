import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the file-tracing root to this project. Without it, Next.js infers the
  // workspace root from the nearest lockfile and, if a stray lockfile exists in
  // a parent folder, nests the standalone output under a subdirectory.
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "@prisma/adapter-pg", // Include this since you use the pool adapter
  ],
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/.pnpm/@prisma+client@*/**/*",
      "./node_modules/.pnpm/@prisma+adapter-pg@*/**/*",
      "./node_modules/.pnpm/@prisma+driver-adapter-utils@*/**/*",
      "./node_modules/.pnpm/@prisma+client-runtime-utils@*/**/*",
      "./node_modules/.pnpm/pg*/**/*",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', }
    ],
  },
  output: "standalone"
};

export default nextConfig;
