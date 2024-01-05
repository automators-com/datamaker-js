import { DataMaker } from "./index";
import { expect, test } from "vitest";

test("Test creating an instance ", () => {
  const datamaker = new DataMaker({
    apiKey: "DATAMAKER_API_KEY",
  });

  expect(datamaker).toBeInstanceOf(DataMaker);
});

test("Test creating an instance with no api key", () => {
  // save the environment variable, if any
  const originalEnv = process.env["DATAMAKER_API_KEY"];
  // set the environment variable to test
  process.env["DATAMAKER_API_KEY"] = "test";
  // instantiate the client
  const datamaker = new DataMaker({});
  // test the instance
  expect(datamaker).toBeInstanceOf(DataMaker);
  expect(datamaker.apiKey).toBe("test");
  // restore the environment variable
  process.env["DATAMAKER_API_KEY"] = originalEnv;
});

test("Test creating an instance with no api key", () => {
  // save the environment variable
  const originalEnv = process.env["DATAMAKER_API_KEY"];
  // delete the environment variable
  delete process.env["DATAMAKER_API_KEY"];

  expect(() => {
    new DataMaker({});
  }).toThrow(/DATAMAKER_API_KEY environment variable is missing/);

  // restore the environment variable
  process.env["DATAMAKER_API_KEY"] = originalEnv;
});

test("Test setting options", () => {
  const datamaker = new DataMaker({
    apiKey: "DATAMAKER_API_KEY",
    timeout: 1000,
    maxRetries: 3,
    defaultHeaders: { "Content-Type": "application/gzip" },
    defaultQuery: { engine: "davinci" },
  });

  expect(datamaker.options.apiKey).toBe("DATAMAKER_API_KEY");
  expect(datamaker.options.timeout).toBe(1000);
  expect(datamaker.options.maxRetries).toBe(3);
  expect(datamaker.options.defaultHeaders).toEqual({
    "Content-Type": "application/gzip",
  });
  expect(datamaker.options.defaultQuery).toEqual({ engine: "davinci" });

  // check instance properties
  expect(datamaker.apiKey).toBe("DATAMAKER_API_KEY");
  expect(Object.values(datamaker.headers)).toContain("application/gzip");
  expect(Object.keys(datamaker.headers)).toContain("Authorization");
  expect(Object.values(datamaker.headers)).toContain("DATAMAKER_API_KEY");
});

test("Setting apikey from environment variable", () => {
  const datamaker = new DataMaker({});
  expect(datamaker.apiKey.slice(0, 3)).toEqual("dm-");
});

test("Basic data generation", async () => {
  const datamaker = new DataMaker({});
  const res = await datamaker
    .generate({
      quantity: 1,
      fields: [
        {
          name: "first_name",
          type: "First Name",
        },
        {
          name: "last_name",
          type: "Last Name",
        },
        {
          name: "email",
          type: "Derived",
          options: {
            value: "{{first_name}}@automators.com",
          },
        },
      ],
    });

  expect(res.length).toBe(1);
  expect(res[0].first_name).toBeDefined();
  expect(res[0].last_name).toBeDefined();
  expect(res[0].email).toBeDefined();
  expect(res[0].email).toContain(res[0].first_name);
});

test('Generate data from template in account', async () => {
  const quantity = 2;
  const datamaker = new DataMaker({});
  const result = await datamaker
    .generateFromTemplate("clr0ddsrk0001jr09r5kxkt4a", quantity); 
    
  expect(result.length).toBe(quantity);
  expect(result[0]["First Name"]).toBeDefined();
  expect(result[0]["Last Name"]).toBeDefined();
  expect(result[0]["Age"]).toBeDefined();
  expect(result[0]["Street"]).toBeDefined();
});