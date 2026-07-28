/**
 * Fail when `src/generated/schema.ts` no longer matches `spec/openapi.json`.
 *
 * The types in this package are GENERATED. A hand-edit, or a spec update with
 * no regeneration, puts the SDK back exactly where it was before this rewrite:
 * describing an API that has moved on. CI runs this so that cannot happen
 * quietly.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const out = join(mkdtempSync(join(tmpdir(), "dm-sdk-")), "schema.ts");
execFileSync("npx", ["openapi-typescript", "spec/openapi.json", "-o", out], {
  stdio: "inherit",
});

const fresh = readFileSync(out, "utf8");
const committed = readFileSync("src/generated/schema.ts", "utf8");

if (fresh !== committed) {
  console.error(
    "\nsrc/generated/schema.ts is stale or hand-edited.\n" +
      "Run `pnpm generate` and commit the result.\n" +
      "These types are generated from spec/openapi.json - editing them by hand\n" +
      "is how this package fell 2.5 years behind the API.\n",
  );
  process.exit(1);
}
console.log("generated types match the spec");
