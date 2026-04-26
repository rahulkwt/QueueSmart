import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["backend/src/**/*.integration.test.js"],
    globalSetup: ["./backend/src/test/integrationSetup.js"],
    env: {
      DB_NAME: "queue_smart_test_db",
    },
    fileParallelism: false,
    pool: "forks",
    forks: { singleFork: true },
    hookTimeout: 30000,
    testTimeout: 15000,
    coverage: {
      provider: "v8",
      include: ["backend/src/controllers/**/*.js"],
      exclude: ["backend/src/controllers/**/*.test.js"],
      reporter: ["text", "html"],
    },
  },
});
