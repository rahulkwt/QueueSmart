import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.js"],
    exclude: ["**/*.integration.test.js", "**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      include: ["backend/src/controllers/**/*.js"],
      exclude: ["backend/src/controllers/**/*.test.js"],
      reporter: ["text", "html"],
    },
  },
});
