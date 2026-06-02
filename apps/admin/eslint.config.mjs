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
      "@typescript-eslint/no-explicit-any": "off",
      // Relaxed for the legacy admin code (stylistic / non-blocking, not logic).
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@next/next/no-html-link-for-pages": "off",
      // React Compiler advisory diagnostics on existing patterns — kept visible
      // as warnings (they do not block the build).
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn"
    }
  }
]);

export default eslintConfig;
