import { DefaultQuery, Fetch } from "./core";
import { AccountTemplate, Fields, Template, Endpoint, CustomEndpoint } from "./template";
import * as Errors from "./error";
import { readEnv } from "./utils";
import { fetchDatamaker } from "./utils";

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
  };
  /**
   * Generate data from custom template.
   * @param template 
   * @returns 
   */
  async generate(template: any) {
    if (!template) {
      throw new Errors.DataMakerError(
        "You must provide a template to generate data."
      );
    };

    if (!template.quantity) {
      template.quantity = 1;
    };   
    return (await fetchDatamaker(this.options.baseURL, this.headers, template)).json(); 
  };
  /**
   * Generate data using template from you Datamaker account. As arguments provide ID of a template from your account and a number of entries to be generated.
   * Requires Datamaker api key to be defined in your project.
   * @param templateId 
   * @param quantity 
   * @returns 
   */
  async generateFromTemplateId(templateId: string, quantity: number = 1) {        
    const url = `${this.options.baseURL}/templates`;

    const fetchTemplate = await fetch(url, {
      method: "GET",
        headers: this.headers
    });

    const templateData = await fetchTemplate.json();
    let template = templateData.find((temp: AccountTemplate) => temp.id === templateId);
  
    if (!templateData) {
      throw new Errors.DataMakerError(
        "No templates found in your account."
      );
    };
    
    if (!template) {
      throw new Errors.DataMakerError(
        "You must provide ID of a template from your account."
      );
    };
  
    template.quantity = quantity;
    return (await fetchDatamaker(this.options.baseURL, this.headers, template)).json();  
  };
  /**
   * Send data to an endpoint. In parameters provide with endpoint compatible data as array of objects
   * and with API endpoint either as ID of an endpoint from your account or as an object.
   * @param api 
   * @param data 
   * @returns 
   */
  async exportToApi(api: string | CustomEndpoint, data: object[]) {  
    const url = `${this.options.baseURL}/endpoints`;
    let targetEndpoint: Endpoint | CustomEndpoint;
    let result: Array<{}> = [];
    let headers: any = this.headers;  

    if (typeof api == "string") {
      const fetchEnpoints = await fetch(url, {
        method: "GET",
        headers: this.headers
      });
  
      const endpointData = await fetchEnpoints.json();
      const endpoint = endpointData.find((endpoint: Endpoint) => endpoint.id === api);
      targetEndpoint = endpoint;

      if (Object.keys(endpoint.headers).length > 0) {
        headers = endpoint.headers;
      };    

    } else {
      targetEndpoint = api;
      if(api.headers) {
        headers = api.headers;
      };      
    };
        
    for (const entry of data) {
      const apiCall = await fetch(targetEndpoint.url, {
        method: targetEndpoint.method,
        headers,
        body: JSON.stringify(entry)
      });

      const callData = await apiCall.json();
      result.push(callData);
    };
   
    if (result) return result; 
   
    throw new Errors.DataMakerError(
      "Something went wrong."
    );      
  };
};

export { DataMaker, ClientOptions, Fields, Template, CustomEndpoint };
