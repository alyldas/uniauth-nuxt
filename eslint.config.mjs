import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

// noinspection JSUnusedGlobalSymbols -- ESLint consumes the default export as flat config.
export default [
  {
    ignores: [
      "dist/**",
      ".nuxt/**",
      ".output/**",
      "node_modules/**",
      ".npm-cache/**",
      "build.config.ts",
      "eslint.config.mjs",
      "vitest.config.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["scripts/**/*.mjs"],
    rules: {
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["scripts/*.mjs"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  prettier,
];
