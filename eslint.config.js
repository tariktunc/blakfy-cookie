// blakfy-cookie/eslint.config.js — flat config (ESLint v9+)
// Covers: vanilla JS (src/, scripts/), TypeScript (cookie-next), tests, examples

import js from "@eslint/js";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import promisePlugin from "eslint-plugin-promise";
import nPlugin from "eslint-plugin-n";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierConfig from "eslint-config-prettier";

const sharedRules = {
  // Hata yakalama
  "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
  "no-console": "off", // widget runtime'da console.warn yapabilir
  "no-debugger": "error",
  "no-empty": ["error", { allowEmptyCatch: true }], // try {...} catch {} pattern
  "no-useless-assignment": "off", // birden çok yerde kasıtlı kullanımlar var
  "prefer-const": "warn",
  "no-var": "error",

  // Import düzeni
  "import/order": [
    "warn",
    {
      groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always",
      alphabetize: { order: "asc", caseInsensitive: true },
    },
  ],
  "import/no-duplicates": "error",
};

export default [
  // 1. Genel ignore
  {
    ignores: [
      "dist/**",
      "packages/*/dist/**",
      "node_modules/**",
      "legacy/**",
      "coverage/**",
      ".vitest/**",
      "examples/nextjs/.next/**",
      "examples/nextjs/next-env.d.ts",
      "*.min.js",
      "package-lock.json",
    ],
  },

  // 2. JS recommended baseline
  js.configs.recommended,

  // 3. Vanilla JS (src/, scripts/, tests/) — tarayıcı + Node global'leri
  {
    files: ["src/**/*.js", "scripts/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      import: importPlugin,
      promise: promisePlugin,
      n: nPlugin,
    },
    rules: {
      ...sharedRules,
    },
  },

  // 4. Test dosyaları — vitest globalleri
  {
    files: ["tests/**/*.{js,ts,tsx}"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // 5. cookie-next TypeScript + React
  {
    files: ["packages/cookie-next/src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
        JSX: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...sharedRules,
      "no-unused-vars": "off", // TS handles
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",

      // React
      "react/jsx-uses-react": "off", // React 17+ JSX transform
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off", // TS does this
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // a11y (kritik — banner kullanıcı UI'ı)
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/no-redundant-roles": "warn",
    },
  },

  // 6. Examples Next.js (App Router)
  {
    files: ["examples/nextjs/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
        JSX: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: { react: { version: "detect" } },
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },

  // 7. Prettier — son sırada (diğer kuralları override eder)
  prettierConfig,
];
