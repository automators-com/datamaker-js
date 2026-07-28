/**
 * KeyMaps: record the keys a migration minted, then translate in bulk.
 *
 * Run with: DATAMAKER_API_KEY=... npx tsx examples/keymaps.ts
 */
import { DataMaker } from "../src/index.js";

const dm = new DataMaker();
const mapName = "sap-material-migration";

await dm.keymaps.put({
  mapName,
  object: "Material",
  entries: [
    { oldKey: "OLD-1", newKey: "NEW-1" },
    { oldKey: "OLD-2", newKey: "NEW-2" },
  ],
});

// `missing` is the point: it separates "no mapping yet" from "not asked for",
// which a plain record of results could not express.
const { mappings, missing } = await dm.keymaps.lookup({
  mapName,
  object: "Material",
  oldKeys: ["OLD-1", "OLD-2", "OLD-3"],
});

console.log("resolved:", mappings);
console.log("not mapped yet:", missing);

const page = await dm.keymaps.entries(mapName, { page: 1, pageSize: 50 });
console.log(`${page.entries.length} of ${page.total} entries`);
