import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      headless: true,
      instances: [
        { browser: "chromium" },
      ],
    },
    include: ["out/esm/test/**/*.test.js"],
    testTimeout: 100_000,
    hookTimeout: 100_000,
    reporters: "default",
    globals: true,
    // Provide Mocha-style hooks as globals
    setupFiles: ["./vitest.setup.mjs"],
  },
});
