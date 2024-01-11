import { DataMaker } from "./index";
import { expect, test } from "vitest";
import { CustomEndpoint, Data } from "./template";

const baseUrl = "https://public.datamaker.app/api/";

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
    .generateFromTemplateId("clr0ddsrk0001jr09r5kxkt4a", quantity); 
    
  expect(result.length).toBe(quantity);
  expect(result[0]["First Name"]).toBeDefined();
  expect(result[0]["Last Name"]).toBeDefined();
  expect(result[0]["Age"]).toBeDefined();
  expect(result[0]["Street"]).toBeDefined();  
});

test('Send multiple generated data to API endpoint in account', async () => {
  const datamaker = new DataMaker({});
  const headers: any = {
    "Authorization": process.env["DATAMAKER_API_KEY"],
    "Content-type": "application/json",  
    "Credentials": "omit"   
  };
  const data = await datamaker.generateFromTemplateId("clr8yxrcy0001l808m70stapk", 3);
  const result: Data[] = await datamaker.exportToApi(data, "clr8uh27l0001l108cr92wxjo");

  expect(result[0]?.name).toBeDefined();
  expect(result[0]?.name).equal(data[0].name);
  expect(result[0]?.connectionString).toBeDefined();
  expect(result[0]?.connectionString).equal(data[0].connectionString);
  expect(result[0]?.createdBy).toBeDefined();
  expect(result[0]?.createdBy).equal(data[0].createdBy);
  
  for (const entry of result) {
    const deleteResult = await fetch(`${baseUrl}connections/${entry.id}`, {
      method: "DELETE",
      headers: headers
    });
    const deleteData = await deleteResult.json();    
    expect(deleteData.id).equal(entry.id);
  };
});

test('Send generated data to API endpoint defined in code', async () => {
  const datamaker = new DataMaker({});
  const headers: any = {
    "Authorization": process.env["DATAMAKER_API_KEY"],
    "Content-type": "application/json",  
    "Credentials": "omit"   
  };
  const endpoint: CustomEndpoint = {
    method: "POST",
    url: `${baseUrl}connections`,
    headers: headers
  };

  const data = await datamaker.generateFromTemplateId("clr8yxrcy0001l808m70stapk", 4);
  const result: Data[] = await datamaker.exportToApi(data, endpoint);

  expect(result[0]?.name).toBeDefined();
  expect(result[0]?.name).equal(data[0].name);
  expect(result[0]?.connectionString).toBeDefined();
  expect(result[0]?.connectionString).equal(data[0].connectionString);
  expect(result[0]?.createdBy).toBeDefined();
  expect(result[0]?.createdBy).equal(data[0].createdBy);
  
  for (const entry of result) {
    const deleteResult = await fetch(`${baseUrl}connections/${entry.id}`, {
      method: "DELETE",
      headers: headers
    });
    const deleteData = await deleteResult.json();    
    expect(deleteData.id).equal(entry.id);
  };
});