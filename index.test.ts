import { init } from "./index";
import { expect, test } from "vitest";

test("Checks init response", () => {
  expect(init()).toBe("Hello from datamaker!");
});
