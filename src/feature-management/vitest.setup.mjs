// Vitest setup file to provide Mocha-compatible APIs
import { beforeAll, afterAll } from "vitest";

// Make Mocha-style hooks available globally
globalThis.before = beforeAll;
globalThis.after = afterAll;
