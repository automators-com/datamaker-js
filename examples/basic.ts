/**
 * The shortest useful thing: save a set, then read it back.
 *
 * Run with: DATAMAKER_API_KEY=... npx tsx examples/basic.ts
 */
import { DataMaker, DataMakerError } from "../src/index.js";

const dm = new DataMaker();

const saved = await dm.sets.save({
  name: `example-${Date.now()}`,
  description: "Written by examples/basic.ts",
  data: [
    { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
    { id: 2, name: "Alan Turing", email: "alan@example.com" },
  ],
});

console.log(`saved set ${saved.id} with ${saved.rowCount} rows`);

// The detail endpoint carries `createdByName`, which the list does not.
const detail = await dm.sets.get(saved.id);
console.log(`created by: ${detail.createdByName ?? "an API key, not a user"}`);

try {
  await dm.sets.delete(saved.id);
  console.log("cleaned up");
} catch (error) {
  if (error instanceof DataMakerError && error.status === 409) {
    console.log("the set is locked; unlock it before deleting");
  } else {
    throw error;
  }
}
