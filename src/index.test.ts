import { describe, expect, it, vi } from "vitest";

import { DataMaker, DataMakerError, MissingApiKeyError } from "./index.js";

/**
 * A fetch stub that records what the SDK sent and answers what the test
 * scripted. The assertions are as much about the REQUEST as the response: the
 * entire job of this layer is turning a method call into the right HTTP call,
 * so that is what has to be pinned.
 */
function stubFetch(response: { status?: number; body?: unknown } = {}): {
  fetch: typeof globalThis.fetch;
  calls: { url: string; init: RequestInit }[];
} {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetch = vi.fn(
    async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init: init ?? {} });
      return new Response(JSON.stringify(response.body ?? {}), {
        status: response.status ?? 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  );
  return { fetch: fetch as unknown as typeof globalThis.fetch, calls };
}


/**
 * The first request the SDK made. Throws rather than returning undefined so a
 * test that made no request fails saying that, instead of failing later on a
 * confusing property access.
 */
function firstCall(stub: { calls: { url: string; init: RequestInit }[] }) {
  const call = stub.calls[0];
  if (!call) throw new Error("the SDK made no request");
  return call;
}

const client = (over: Record<string, unknown> = {}, stub = stubFetch()) =>
  new DataMaker({
    apiKey: "dm-test-key",
    baseURL: "https://api.example.test",
    fetch: stub.fetch,
    ...over,
  });

describe("authentication", () => {
  it("sends the key as X-API-Key, matching datamaker-py", async () => {
    const stub = stubFetch({ body: [] });
    await client({}, stub).sets.list();

    const headers = firstCall(stub).init.headers as Record<string, string>;
    expect(headers["X-API-Key"]).toBe("dm-test-key");
  });

  it("refuses to construct without a key rather than failing at the first call", () => {
    // A client that constructs cleanly and then 401s on every call reports the
    // problem far from its cause.
    expect(
      () => new DataMaker({ apiKey: undefined, fetch: stubFetch().fetch }),
    ).toThrow(MissingApiKeyError);
  });

  it("sends team and project scope only when given", async () => {
    const bare = stubFetch({ body: [] });
    await client({}, bare).sets.list();
    expect(firstCall(bare).init.headers).not.toHaveProperty("X-Team-Id");

    const scoped = stubFetch({ body: [] });
    await client({ teamId: "t1", projectId: "p1" }, scoped).sets.list();
    const headers = firstCall(scoped).init.headers as Record<string, string>;
    expect(headers["X-Team-Id"]).toBe("t1");
    expect(headers["X-Project-Id"]).toBe("p1");
  });
});

describe("request building", () => {
  it("drops undefined query params instead of sending the string 'undefined'", async () => {
    const stub = stubFetch({ body: [] });
    await client({}, stub).templates.list({ projectId: undefined });
    expect(firstCall(stub).url).toBe("https://api.example.test/templates");
  });

  it("encodes path parameters", async () => {
    const stub = stubFetch({ body: {} });
    await client({}, stub).keymaps.entries("sap/material migration");
    expect(firstCall(stub).url).toContain(
      "/keymaps/sap%2Fmaterial%20migration/entries",
    );
  });

  it("does not send a body on GET", async () => {
    const stub = stubFetch({ body: [] });
    await client({}, stub).projects.list();
    expect(firstCall(stub).init.body).toBeUndefined();
  });

  it("trims a trailing slash off the base URL so paths do not double up", async () => {
    const stub = stubFetch({ body: [] });
    await client({ baseURL: "https://api.example.test/" }, stub).projects.list();
    expect(firstCall(stub).url).toBe("https://api.example.test/projects");
  });
});

describe("errors", () => {
  it("carries the status and the server's own message", async () => {
    const stub = stubFetch({
      status: 409,
      body: { error: "Set is locked - unlock it before deleting." },
    });
    const dm = client({}, stub);

    await expect(dm.sets.delete("s1")).rejects.toThrow(DataMakerError);
    await expect(dm.sets.delete("s1")).rejects.toMatchObject({
      status: 409,
      message: "Set is locked - unlock it before deleting.",
    });
  });

  it("still reports the status when the body is not JSON", async () => {
    // A proxy timeout answers HTML. The status is the useful part and must not
    // be replaced by a JSON parse error.
    const fetch = vi.fn(
      async () => new Response("<html>504 Gateway Timeout</html>", { status: 504 }),
    ) as unknown as typeof globalThis.fetch;

    const dm = new DataMaker({ apiKey: "k", baseURL: "https://x.test", fetch });
    await expect(dm.sets.list()).rejects.toMatchObject({ status: 504 });
  });
});

describe("resource surface", () => {
  it("save is an alias for create, matching datamaker-py's save_set", async () => {
    const stub = stubFetch({ body: { id: "s1" } });
    await client({}, stub).sets.save({ name: "golden", data: [{ a: 1 }] });

    expect(firstCall(stub).init.method).toBe("POST");
    expect(firstCall(stub).url).toBe("https://api.example.test/sets");
    expect(JSON.parse(String(firstCall(stub).init.body))).toEqual({
      name: "golden",
      data: [{ a: 1 }],
    });
  });

  it("keymap lookup posts, because oldKeys can be large", async () => {
    const stub = stubFetch({ body: { mappings: {}, missing: [] } });
    await client({}, stub).keymaps.lookup({
      mapName: "m",
      object: "Material",
      oldKeys: ["A", "B"],
    });
    expect(firstCall(stub).init.method).toBe("POST");
    expect(firstCall(stub).url).toBe("https://api.example.test/keymaps/lookup");
  });
});
