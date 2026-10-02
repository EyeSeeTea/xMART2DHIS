import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";

// ESLint 9 flat config, converted from .eslintrc.js. eslint-config-react-app
// is gone; the react and react-hooks plugins it brought are declared here.
export default tseslint.config(
    {
        ignores: ["build/**", "node_modules/**", "coverage/**", "src/locales/**", "**/*.d.ts"],
    },

    js.configs.recommended,
    ...tseslint.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat["jsx-runtime"],
    reactHooks.configs.flat.recommended,

    {
        languageOptions: {
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        settings: {
            react: { version: "detect" },
        },
        plugins: {
            "unused-imports": unusedImports,
        },
        rules: {
            // TypeScript already resolves identifiers; core no-undef duplicates it
            // and does not know about DOM or Node globals here.
            "no-undef": "off",

            "no-console": ["warn", { allow: ["debug", "warn", "error"] }],
            "no-debugger": "warn",
            "no-unused-expressions": "off",
            "no-useless-concat": "off",
            "no-useless-constructor": "off",
            "no-unexpected-multiline": "off",
            "no-useless-escape": "warn",
            "no-use-before-define": "off",
            "no-extra-semi": "off",
            "no-mixed-spaces-and-tabs": "off",
            "default-case": "off",

            "unused-imports/no-unused-imports": "warn",

            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-var-requires": "off",
            // typescript-eslint v8 split ban-types, which the previous config
            // turned off, into these three rules.
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
            "@typescript-eslint/no-wrapper-object-types": "off",

            "react/prop-types": "off",
            "react/display-name": "off",
            "react/react-in-jsx-scope": "off",

            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            // TODO: Enable `react-hooks/set-state-in-effect` (new in react-hooks 7).
            "react-hooks/set-state-in-effect": "off",
        },
    }
);
