import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.js", "tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{js,ts}"],
      exclude: [
        "legacy/**",
        "dist/**",
        "examples/**",
        "scripts/**",
        "tests/**",
        "**/*.config.{js,ts}",
        "**/*.d.ts",
        "node_modules/**",
      ],
      // Faz 4'te thresholds yükseltilecek (presets + ui + i18n + geo testleri eklenince → %80)
      // Şu anki başlangıç eşiği (97 test ile): regresyonu engellemeye yetecek minimum.
      thresholds: {
        lines: 55,
        functions: 55,
        branches: 55,
        statements: 55,
      },
    },
  },
});
