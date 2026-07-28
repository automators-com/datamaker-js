/**
 * The official TypeScript client for the DataMaker API.
 *
 * ```ts
 * import { DataMaker } from "@automators/datamaker";
 *
 * const dm = new DataMaker({ apiKey: process.env.DATAMAKER_API_KEY });
 *
 * const sets = await dm.sets.list();
 * const set = await dm.sets.save({ name: "golden customers", data: rows });
 * const { mappings, missing } = await dm.keymaps.lookup({
 *   mapName: "sap-material-migration",
 *   object: "Material",
 *   oldKeys: ["OLD-1", "OLD-2"],
 * });
 * ```
 *
 * Types come from the API's own OpenAPI document, generated into
 * `src/generated/schema.ts`. They are not hand-maintained, which is the fix
 * for how this package fell 2.5 years behind the API.
 */
import { HttpClient, type ClientOptions } from "./core.js";
import {
  KeyMapsClient,
  MaskingPoliciesClient,
  PlansClient,
  ProjectsClient,
  SetsClient,
  TemplatesClient,
} from "./resources.js";

export class DataMaker {
  /** The transport, exposed for endpoints the typed resources do not cover yet. */
  readonly http: HttpClient;

  readonly projects: ProjectsClient;
  readonly templates: TemplatesClient;
  readonly sets: SetsClient;
  readonly keymaps: KeyMapsClient;
  readonly maskingPolicies: MaskingPoliciesClient;
  readonly plans: PlansClient;

  constructor(options: ClientOptions = {}) {
    this.http = new HttpClient(options);
    this.projects = new ProjectsClient(this.http);
    this.templates = new TemplatesClient(this.http);
    this.sets = new SetsClient(this.http);
    this.keymaps = new KeyMapsClient(this.http);
    this.maskingPolicies = new MaskingPoliciesClient(this.http);
    this.plans = new PlansClient(this.http);
  }
}

export {
  HttpClient,
  DataMakerError,
  MissingApiKeyError,
  DEFAULT_BASE_URL,
} from "./core.js";
export type { ClientOptions, RequestOptions, ApiErrorBody } from "./core.js";
export * from "./resources.js";
export type { components, paths } from "./generated/schema.js";

export default DataMaker;
