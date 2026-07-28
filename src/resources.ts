/**
 * The resource clients.
 *
 * Every type here comes from `generated/schema.ts`, which is generated from
 * the API's own `openapi.json`. Nothing in this file restates a field name or
 * a nullability: if the API changes, regenerating changes these types, and
 * anything that no longer lines up fails to compile. That is the whole point -
 * the previous version of this SDK drifted 2.5 years behind precisely because
 * its types were hand-copied.
 *
 * Method names deliberately mirror `datamaker-py` (`list`, `get`, `create`,
 * `update`, `delete`, `save`), so the two SDKs read the same way and one set
 * of docs covers both.
 */
import type { HttpClient } from "./core.js";
import type { components } from "./generated/schema.js";

type Schemas = components["schemas"];

export type Project = Schemas["Project"];
export type Template = Schemas["Template"];
export type Set = Schemas["Set"];
export type SetDetail = Schemas["SetDetail"];
export type MaskingPolicy = Schemas["MaskingPolicy"];
export type Plan = Schemas["Plan"];
export type KeyMapSummary = Schemas["KeyMapSummary"];
export type KeyMapEntry = Schemas["KeyMapEntry"];
export type KeyMapEntriesPage = Schemas["KeyMapEntriesPage"];
export type KeyMapLookupResult = Schemas["KeyMapLookupResult"];
export type KeyMapUpsertResult = Schemas["KeyMapUpsertResult"];
export type DeletedResult = Schemas["DeletedResult"];

/** Scope a list call to one project. Most keys already imply one. */
export interface ListOptions {
  projectId?: string;
}

export class ProjectsClient {
  constructor(private readonly http: HttpClient) {}

  list() {
    return this.http.get<Project[]>("/projects");
  }
  get(id: string) {
    return this.http.get<Project>(`/projects/${encodeURIComponent(id)}`);
  }
  create(body: { name: string; description?: string; avatar?: string }) {
    return this.http.post<Project>("/projects", body);
  }
  update(id: string, body: Partial<{ name: string; description: string; avatar: string }>) {
    return this.http.put<Project>(`/projects/${encodeURIComponent(id)}`, body);
  }
  delete(id: string) {
    return this.http.delete<DeletedResult>(`/projects/${encodeURIComponent(id)}`);
  }
}

export class TemplatesClient {
  constructor(private readonly http: HttpClient) {}

  list(options: ListOptions = {}) {
    return this.http.get<Template[]>("/templates", { query: { ...options } });
  }
  get(id: string) {
    return this.http.get<Template>(`/templates/${encodeURIComponent(id)}`);
  }
  create(body: { name: string; fields: unknown; projectId?: string }) {
    return this.http.post<Template>("/templates", body);
  }
  update(id: string, body: Partial<{ name: string; fields: unknown }>) {
    return this.http.put<Template>(`/templates/${encodeURIComponent(id)}`, body);
  }
  delete(id: string) {
    return this.http.delete<DeletedResult>(`/templates/${encodeURIComponent(id)}`);
  }
}

export class SetsClient {
  constructor(private readonly http: HttpClient) {}

  list(options: ListOptions = {}) {
    return this.http.get<Set[]>("/sets", { query: { ...options } });
  }
  /**
   * Returns the detail shape, which carries `createdByName` on top of the row
   * the list returns. Typed distinctly so that field is not silently assumed
   * to exist on a list result.
   */
  get(id: string) {
    return this.http.get<SetDetail>(`/sets/${encodeURIComponent(id)}`);
  }
  /**
   * Sets are stored inline and capped by the API at 10,000 rows / 5 MB of
   * JSON. Larger payloads belong in blob storage or a KeyMap; the API answers
   * 400 with the cap in the message rather than truncating.
   */
  create(body: {
    name: string;
    data?: unknown;
    description?: string;
    rowCount?: number;
    locked?: boolean;
    projectId?: string;
  }) {
    return this.http.post<Set>("/sets", body);
  }
  update(
    id: string,
    body: Partial<{
      name: string;
      description: string | null;
      data: unknown;
      rowCount: number;
      /** Locking is always allowed; other edits are rejected while locked. */
      locked: boolean;
    }>,
  ) {
    return this.http.patch<Set>(`/sets/${encodeURIComponent(id)}`, body);
  }
  delete(id: string) {
    return this.http.delete<DeletedResult>(`/sets/${encodeURIComponent(id)}`);
  }
  /** Alias for {@link create}, matching datamaker-py's `save_set`. */
  save(body: Parameters<SetsClient["create"]>[0]) {
    return this.create(body);
  }
}

export class MaskingPoliciesClient {
  constructor(private readonly http: HttpClient) {}

  list(options: ListOptions = {}) {
    return this.http.get<MaskingPolicy[]>("/masking-policies", {
      query: { ...options },
    });
  }
  get(id: string) {
    return this.http.get<MaskingPolicy>(
      `/masking-policies/${encodeURIComponent(id)}`,
    );
  }
  create(body: {
    name: string;
    fields: unknown;
    description?: string;
    consistent?: boolean;
    /** Reversible policies mint their mappings into the named KeyMap. */
    reversible?: boolean;
    keyMapName?: string;
    projectId?: string;
  }) {
    return this.http.post<MaskingPolicy>("/masking-policies", body);
  }
  update(id: string, body: Record<string, unknown>) {
    return this.http.patch<MaskingPolicy>(
      `/masking-policies/${encodeURIComponent(id)}`,
      body,
    );
  }
  delete(id: string) {
    return this.http.delete<DeletedResult>(
      `/masking-policies/${encodeURIComponent(id)}`,
    );
  }
}

export class PlansClient {
  constructor(private readonly http: HttpClient) {}

  list() {
    return this.http.get<Plan[]>("/plans");
  }
  get(id: string) {
    return this.http.get<Plan>(`/plans/${encodeURIComponent(id)}`);
  }
  update(planId: string, body: Record<string, unknown>) {
    return this.http.patch<Plan>(`/plans/${encodeURIComponent(planId)}`, body);
  }
  /** Answers `{ success: true }`, not the `{ message }` the other resources use. */
  delete(planId: string) {
    return this.http.delete<{ success: boolean }>(
      `/plans/${encodeURIComponent(planId)}`,
    );
  }
}

/**
 * KeyMaps translate source-system keys to the keys minted in a target system.
 *
 * Every method here returns a PROJECTION, never a stored row: a grouped
 * summary, an upsert count, a lookup result, a page of entries. The API has no
 * endpoint that returns the raw KeyMap record, so the SDK does not pretend one
 * exists.
 */
export class KeyMapsClient {
  constructor(private readonly http: HttpClient) {}

  /** One row per (mapName, object), with entry counts and last update. */
  list() {
    return this.http.get<KeyMapSummary[]>("/keymaps");
  }

  /** Batch upsert. Last write wins for `newKey` on the same `oldKey`. */
  put(body: {
    mapName: string;
    object: string;
    entries: { oldKey: string; newKey: string; runId?: string }[];
  }) {
    return this.http.post<KeyMapUpsertResult>("/keymaps/entries", body);
  }

  /**
   * Batch translate. Returns the resolved mappings AND the keys that have no
   * mapping yet, so a caller can tell "not found" from "not asked for".
   *
   * POST rather than GET because `oldKeys` can be large.
   */
  lookup(body: { mapName: string; object: string; oldKeys: string[] }) {
    return this.http.post<KeyMapLookupResult>("/keymaps/lookup", body);
  }

  /** Paginated entries. `page` is 1-based; `total` counts the whole filter. */
  entries(
    mapName: string,
    options: { object?: string; page?: number; pageSize?: number } = {},
  ) {
    return this.http.get<KeyMapEntriesPage>(
      `/keymaps/${encodeURIComponent(mapName)}/entries`,
      { query: { ...options } },
    );
  }

  /** Drop a map, optionally only one object type within it. */
  delete(mapName: string, options: { object?: string } = {}) {
    return this.http.delete<{ message: string; deleted: number }>(
      `/keymaps/${encodeURIComponent(mapName)}`,
      { query: { ...options } },
    );
  }
}
