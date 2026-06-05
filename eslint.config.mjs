import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // French text with apostrophes is idiomatic — downgrade from error to warn
      "react/no-unescaped-entities": "warn",
      // Pervasive in form/data components — downgrade from error to warn
      "@typescript-eslint/no-explicit-any": "warn",
      // Tailwind config uses require() — exception for config files
      "@typescript-eslint/no-require-imports": ["error", { allow: ["tailwindcss/.*"] }],
    },
  },
]);

export default eslintConfig;
