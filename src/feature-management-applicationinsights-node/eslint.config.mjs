import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "node_modules/**",
    "dist/**",
    "dist-esm/**",
    "types/**",
    "*.min.js",
    "coverage/**"
]), {
    extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.commonjs,
            ...globals.node,
            ...globals.mocha,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "commonjs",
    },

    rules: {
        "keyword-spacing": ["error", {
            before: true,
            after: true,
        }],

        quotes: ["error", "double", {
            avoidEscape: true,
        }],

        "@typescript-eslint/no-explicit-any": "off",
        "eol-last": ["error", "always"],
        "no-trailing-spaces": "error",
        "space-before-blocks": ["error", "always"],
        "no-multi-spaces": "error",

        "no-multiple-empty-lines": ["error", {
            max: 1,
        }],

        semi: ["error", "always"],
    },
}, {
    files: ["**/.eslintrc.{js,cjs}"],

    languageOptions: {
        globals: {
            ...globals.node,
        },

        ecmaVersion: 5,
        sourceType: "commonjs",
    },
}]);
