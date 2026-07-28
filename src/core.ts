/**
 * The transport every resource client sits on.
 *
 * Deliberately thin: build a URL, attach auth, send JSON, parse JSON, turn a
 * non-2xx into a typed error. Everything above this file is types and
 * ergonomics. There is no retry policy, no caching and no client-side
 * validation, because the API is the authority on all three and a clever SDK
 * that disagrees with its server is worse than a dull one that does not.
 */
import type { components } from "./generated/schema.js";

/** The error body the API returns on a non-2xx. */
export type ApiErrorBody = components["schemas"]["ApiError"];

/** Where the API lives when the caller does not say. Matches datamaker-py. */
export const DEFAULT_BASE_URL = "https://api.datamaker.automators.com";

export interface ClientOptions {
  /**
   * A DataMaker API key. Falls back to `DATAMAKER_API_KEY`, the same variable
   * datamaker-py reads, so a machine configured for one SDK works with the
   * other.
   */
  apiKey?: string;
  /** Falls back to `DATAMAKER_API_URL`, then {@link DEFAULT_BASE_URL}. */
  baseURL?: string;
  /**
   * Team and project scope, sent as `X-Team-Id` / `X-Project-Id`, which is how
   * the API scopes reads and writes. Most keys are already project-scoped, so
   * these are only needed when a key spans more than one.
   */
  teamId?: string;
  projectId?: string;
  /** Extra headers merged into every request. */
  headers?: Record<string, string>;
  /**
   * Injected `fetch`, for tests and for runtimes that supply their own. The
   * SDK uses the global otherwise, so it runs unmodified on Node 18+, Deno,
   * Bun, browsers and edge runtimes - one of the reasons this is not a native
   * module.
   */
  fetch?: typeof globalThis.fetch;
}

/**
 * A non-2xx response.
 *
 * Carries the status and the parsed body rather than a flattened string,
 * because callers branch on both: 401 means the key is wrong, 403 means the
 * key is right and lacks a permission, 409 means the resource is locked.
 */
export class DataMakerError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | undefined;
  readonly url: string;

  constructor(status: number, url: string, body: ApiErrorBody | undefined) {
    // The server's own message first: it is written for this exact failure,
    // and a generic wrapper sentence would bury it.
    super(body?.error ?? `DataMaker API request failed with ${status}`);
    this.name = "DataMakerError";
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

/** Thrown at construction when no key is available from anywhere. */
export class MissingApiKeyError extends Error {
  constructor() {
    super(
      "No DataMaker API key. Pass `apiKey` to the client or set DATAMAKER_API_KEY.",
    );
    this.name = "MissingApiKeyError";
  }
}

export interface RequestOptions {
  /** Query parameters. `undefined` values are dropped rather than sent as "undefined". */
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Read an env var without assuming `process` exists: the SDK is meant to run
 * in browsers and edge runtimes too, where touching it directly throws.
 */
function fromEnv(name: string): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, string> } })
    .process?.env;
  return env?.[name];
}

export class HttpClient {
  private readonly baseURL: string;
  private readonly headers: Record<string, string>;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(options: ClientOptions = {}) {
    const apiKey = options.apiKey ?? fromEnv("DATAMAKER_API_KEY");
    if (!apiKey) throw new MissingApiKeyError();

    this.baseURL = (
      options.baseURL ??
      fromEnv("DATAMAKER_API_URL") ??
      DEFAULT_BASE_URL
    ).replace(/\/+$/, "");

    this.headers = {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      ...(options.teamId ? { "X-Team-Id": options.teamId } : {}),
      ...(options.projectId ? { "X-Project-Id": options.projectId } : {}),
      ...options.headers,
    };

    const impl = options.fetch ?? globalThis.fetch;
    if (!impl) {
      throw new Error(
        "No fetch implementation. Use Node 18+, or pass `fetch` in the client options.",
      );
    }
    // Bound because an unbound global fetch throws "Illegal invocation" in
    // browsers when it is called as a method of something else.
    this.fetchImpl = impl.bind(globalThis);
  }

  async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = new URL(`${this.baseURL}${path}`);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const response = await this.fetchImpl(url.toString(), {
      method,
      headers: this.headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });

    if (!response.ok) {
      // A failing endpoint does not always answer JSON - a proxy timeout or a
      // crash returns HTML or nothing. Parsing is best-effort so the status
      // survives instead of being replaced by a parse error.
      let body: ApiErrorBody | undefined;
      try {
        body = (await response.json()) as ApiErrorBody;
      } catch {
        body = undefined;
      }
      throw new DataMakerError(response.status, url.toString(), body);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>("GET", path, options);
  }
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("POST", path, { ...options, body });
  }
  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PUT", path, { ...options, body });
  }
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PATCH", path, { ...options, body });
  }
  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, options);
  }
}
