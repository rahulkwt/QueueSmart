import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/controllers/**/*.js"],
      exclude: ["src/controllers/**/*.test.js"],
    },
  },
});
