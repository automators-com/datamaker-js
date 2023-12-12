import { DefaultQuery, Fetch } from "./core";
import { Fields, Template } from "./template";
import * as Errors from "./error";
import { readEnv } from "./utils";

interface ClientOptions {
  /**
   * Defaults to process.env['DATAMAKER_API_KEY'].
   */
  apiKey?: string;

  /**
   * Override the default base URL for the API, e.g., "https://Core.example.com/v2/"
   */
  baseURL?: string;

  /**
   * The maximum amount of time (in milliseconds) that the client should wait for a response
   * from the server before timing out a single request.
   *
   * Note that request timeouts are retried by default, so in a worst-case scenario you may wait
   * much longer than this timeout before the promise succeeds or fails.
   */
  timeout?: number;

  /**
   * Specify a custom `fetch` function implementation.
   *
   * If not provided, we use `node-fetch` on Node.js and otherwise expect that `fetch` is
   * defined globally.
   */
  fetch?: Fetch | undefined;

  /**
   * The maximum number of times that the client will retry a request in case of a
   * temporary failure, like a network error or a 5XX error from the server.
   *
   * @default 2
   */
  maxRetries?: number;

  /**
   * Default headers to include with every request to the Core.
   *
   * These can be removed in individual requests by explicitly setting the
   * header to `undefined` or `null` in request options.
   */
  defaultHeaders?: HeadersInit;

  /**
   * Default query parameters to include with every request to the Core.
   *
   * These can be removed in individual requests by explicitly setting the
   * param to `undefined` in request options.
   */
  defaultQuery?: DefaultQuery;
}

// create datamaker class object
class DataMaker {
  readonly apiKey: string;
  headers: HeadersInit;
  options: ClientOptions;

  /**
   * API Client for interfacing with the DataMaker Core.
   *
   * @param {string} [opts.apiKey==process.env['DATAMAKER_API_KEY'] ?? undefined]
   * @param {string} [opts.baseURL] - Override the default base URL for the Core.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {number} [opts.httpAgent] - An HTTP agent used to manage HTTP(s) connections.
   * @param {Core.Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {Core.Headers} opts.defaultHeaders - Default headers to include with every request to the Core.
   * @param {Core.DefaultQuery} opts.defaultQuery - Default query parameters to include with every request to the Core.
   */
  constructor({
    apiKey = readEnv("DATAMAKER_API_KEY"),
    ...opts
  }: ClientOptions = {}) {
    if (apiKey === undefined) {
      throw new Errors.DataMakerError(
        "The DATAMAKER_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new DataMaker({ apiKey: 'My API Key' })."
      );
    }
    const options: ClientOptions = {
      apiKey,
      ...opts,
      baseURL: opts.baseURL ?? `https://public.datamaker.app/api`,
    };

    this.apiKey = apiKey;
    this.options = options;
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `${this.apiKey}`,
      ...this.options.defaultHeaders,
    };
  }

  async generate(template: Template) {
    if (!template) {
      throw new Errors.DataMakerError(
        "You must provide a template to generate data"
      );
    }

    if (!template.quantity) {
      template.quantity = 1;
    }

    return await fetch(`${this.options.baseURL}/datamaker`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(template),
    });
  }
}

export { DataMaker, ClientOptions, Fields, Template };
