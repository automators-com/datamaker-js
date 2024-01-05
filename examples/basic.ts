import { DataMaker } from "../src/index";
import { Template } from "../src/template";

const datamaker = new DataMaker({});

const generateData = async () => {
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
  
  const data = await datamaker.generate(template);
  const result = await data.json();
  console.log(result);   
};

generateData();