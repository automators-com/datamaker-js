import { DataMaker } from "../src/index";

const datamaker = new DataMaker({});

// ----------------------
// Fetch all templates
// ----------------------
const fetchTemplates = async () => {
  const templates = await datamaker.getTemplates();
  console.log("All Templates:", templates);
};

fetchTemplates();

// ----------------------
// Fetch existing template by ID
// ----------------------
const fetchTemplateById = async () => {
  const templateID = "template_12345";
  const template = await datamaker.getTemplateById(templateID);

  console.log("Template by ID:", template);
};

fetchTemplateById()

// ----------------------
// Delete existing template by ID
// ----------------------
const deleteTemplateById = async () => {
  const templateID = "template_12345";
  const template = await datamaker.deleteTemplate(templateID);

  console.log("Template by ID:", template);
};

deleteTemplateById()


