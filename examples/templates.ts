import { DataMaker } from "../src/index";

const datamaker = new DataMaker({});

const fetchTemplates = async () => {
  const templates = await datamaker.getTemplates();
  console.log("All Templates:", templates);
};

fetchTemplates();
