// vitest.config.ts
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

// load env vars from .env
dotenv.config();

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
