// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
      // NgModule architecture — standalone migration is a separate task
      "@angular-eslint/prefer-standalone": "off",
      // Constructor injection is fine for NgModule-based apps
      "@angular-eslint/prefer-inject": "off",
      // Codebase uses `any` extensively; type-tightening is a separate task
      "@typescript-eslint/no-explicit-any": "off",
      // Stylistic rules that don't affect correctness
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/consistent-generic-constructors": "off",
      "@angular-eslint/no-empty-lifecycle-method": "off",
      "@typescript-eslint/prefer-for-of": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      // templateAccessibility omitted: kiosk display, not a public web app
    ],
    rules: {
      // *ngIf/*ngFor → @if/@for migration is a separate task
      "@angular-eslint/template/prefer-control-flow": "off",
    },
  }
]);
