// eslint.config.mjs
import eslintReact from "@eslint-react/eslint-plugin";
import nextPlugin from "@next/eslint-plugin-next";
import prettierConfig from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  // TypeScript recommended rules (parser + base + recommended)
  ...tseslint.configs.recommended,

  // Next.js core-web-vitals rules — registers the @next/next plugin and its rules
  nextPlugin.configs["core-web-vitals"],

  // React + react-hooks + Prettier — applied to every JS/TS source file
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    extends: [eslintReact.configs.recommended],
    plugins: {
      "react-hooks": reactHooks,
      prettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "prettier/prettier": "error",
    },
  },

  // Disable stylistic ESLint rules that conflict with Prettier - must come last
  prettierConfig,

  // Keep the same global ignores as before (.next/**, out/**, build/**, next-env.d.ts)
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
