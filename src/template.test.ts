import type { Fields, Template } from "./template";
import { expectTypeOf, test } from "vitest";

test("Test types", () => {
  const myTemplate: Template = {
    name: "My Template",
    quantity: 5,
    fields: [
      {
        name: "Field1",
        type: "Words",
        options: {
          count: 5,
        },
      },
      {
        name: "Hello",
        type: "AI",
        options: {
          prompt: "F1 Drivers",
        },
      },
    ],
  };

  expectTypeOf(myTemplate).toMatchTypeOf<Template>();
  expectTypeOf(myTemplate.fields).toMatchTypeOf<Fields>();
});
