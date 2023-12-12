import { DataMaker } from "../src/index";
import { Template } from "../src/template";

const datamaker = new DataMaker({});

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
