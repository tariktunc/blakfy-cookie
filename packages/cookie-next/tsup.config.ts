// blakfy-cookie/packages/cookie-next/tsup.config.ts — tsup build for ESM + CJS + .d.ts

import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2020",
  external: ["react", "react-dom", "next"],
  banner: { js: '"use client";' },
});
