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
      // Başlangıç eşiği (97 test ile): regresyonu engellemeye yetecek minimum.
      // CI/local farkı için 1-2 puan margin bırakıldı.
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
});
