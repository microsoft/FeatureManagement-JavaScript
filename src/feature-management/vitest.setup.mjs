// Vitest setup file to provide Mocha-compatible APIs
import { beforeAll, afterAll } from "vitest";

// Make Mocha-style hooks available globally
// Note: beforeEach and afterEach are already available as globals in Vitest
globalThis.before = beforeAll;
globalThis.after = afterAll;
