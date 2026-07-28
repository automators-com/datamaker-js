# @automators/datamaker

The official TypeScript / Node.js client for the [DataMaker](https://datamaker.automators.com) API.

> **Note on naming.** The unscoped `datamaker` package on npm is an unrelated project by another author. This package is the official one and is always **`@automators/datamaker`**.

```bash
npm install @automators/datamaker
```

Node 18+, and it also runs on Deno, Bun, browsers and edge runtimes. Zero runtime dependencies: it uses the platform `fetch`.

## Usage

```ts
import { DataMaker } from "@automators/datamaker";

const dm = new DataMaker({ apiKey: process.env.DATAMAKER_API_KEY });

const sets = await dm.sets.list();

const saved = await dm.sets.save({
  name: "golden customers",
  data: [{ id: 1, name: "Ada Lovelace" }],
});

const { mappings, missing } = await dm.keymaps.lookup({
  mapName: "sap-material-migration",
  object: "Material",
  oldKeys: ["OLD-1", "OLD-2"],
});
```

`apiKey` falls back to `DATAMAKER_API_KEY` and `baseURL` to `DATAMAKER_API_URL` - the same variables `datamaker-py` reads, so one configured machine works with both SDKs.

## Resources

| Client | Methods |
| --- | --- |
| `dm.projects` | `list` `get` `create` `update` `delete` |
| `dm.templates` | `list` `get` `create` `update` `delete` |
| `dm.sets` | `list` `get` `create` `update` `delete` `save` |
| `dm.keymaps` | `list` `put` `lookup` `entries` `delete` |
| `dm.maskingPolicies` | `list` `get` `create` `update` `delete` |
| `dm.plans` | `list` `get` `update` `delete` |

Method names mirror `datamaker-py`, so one set of docs covers both.

For anything not yet wrapped, `dm.http` is the typed transport:

```ts
const rows = await dm.http.get<MyShape>("/scenarios", { query: { projectId } });
```

## Errors

A non-2xx throws `DataMakerError`, carrying the status and the parsed body rather than a flattened string, because callers branch on both:

```ts
import { DataMakerError } from "@automators/datamaker";

try {
  await dm.sets.delete(id);
} catch (error) {
  if (error instanceof DataMakerError && error.status === 409) {
    // the set is locked - unlock it first
  }
}
```

`401` means the key is wrong, `403` that it is right but lacks a permission, `409` that the resource is locked.

## Types are generated, not written

Every type comes from the API's own OpenAPI document, generated into `src/generated/schema.ts`:

```bash
pnpm generate        # regenerate from spec/openapi.json
pnpm generate:check  # fail if the committed types are stale (CI runs this)
```

This is deliberate. The previous release of this package sat at v0.2.0 for two and a half years while the API moved on, because its types were hand-copied and nothing ever failed when they diverged. Do not hand-edit `src/generated/`.

## Development

```bash
pnpm install
pnpm test
pnpm lint
pnpm build
```

The tests never reach a real API: they inject a `fetch` stub and assert on the request the SDK builds.
