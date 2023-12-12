# DataMaker

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## What is it?

The official Node.js / Typescript library for the datamaker API. Datamaker assists with generating realistic relational data for testing and development purposes.

## Installation

```sh
npm install @automators/datamaker
```

## Quick start

Basic example:

```ts
import { DataMaker, Template } from "@automators/datamaker";

const datamaker = new DataMaker({
  apiKey: `YOUR_API_KEY`,
});

const template = {
  name: "basic template",
  quantity: 2,
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
        value: "{{first_name}}.{{last_name}}@automators.com",
      },
    },
  ],
} satisfies Template;

datamaker
  .generate(template)
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    console.log(data);
  });
```

## Development & Contibutions

See the [contributing.md](/CONTRIBUTING.md) guide for details on how to contribute to this project.

## License

[MIT](https://github.com/automator-com/datamaker-core/blob/main/LICENSE)
