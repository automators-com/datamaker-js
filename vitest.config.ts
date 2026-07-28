import { defineConfig } from "vitest/config";

/**
 * No dotenv here on purpose. The tests never talk to a real API: they inject a
 * `fetch` stub and assert on the request the SDK builds. A test that reached
 * for ambient credentials would pass or fail depending on whose machine it ran
 * on, which is the opposite of what this suite is for.
 */
export default defineConfig({
  test: {
    coverage: { reporter: ["text", "json", "html"] },
  },
});
