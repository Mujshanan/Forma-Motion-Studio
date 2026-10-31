import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Electron loads the production renderer from file://, so generated asset
  // URLs must be relative to dist/index.html rather than the filesystem root.
  base: "./",
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"]
  }
});
