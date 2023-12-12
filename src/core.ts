export type Fetch = (url: RequestInfo, init?: RequestInit) => Promise<Response>;
export type HTTPMethod = "get" | "post" | "put" | "patch" | "delete";

export type RequestClient = { fetch: Fetch };
export type Headers = Record<string, string | null | undefined>;
export type DefaultQuery = Record<string, string | undefined>;

export type Agent = any;
