import { DataMaker } from "../src/index";
import { CreateTemplateRequest } from "../src/template";

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
// Create a new template 
// ----------------------
const createTemplate = async () => {

  const templateData = {
    name: "New Template 1234",
    projectId: "cme1bb331000br5dpl7pelvul",
    teamId: "cme1akhyp0000r5dplpyugis7",
    fields: [
      {
        name: "username",
        active: true,
        type: "Words",
        options: { count: 2 },
      },
      {
        name: "userId",
        active: true,
        type: "UUID",
        options: { primaryKey: true },
      },
      {
        name: "age",
        active: true,
        type: "Number",
        options: { min: 18, max: 99 },
      },
      {
        name: "signupDate",
        active: true,
        type: "Date",
        options: { format: "YYYY-MM-DD" },
      },
      {
        name: "isActive",
        active: true,
        type: "Boolean",
        options: { truthy: true },
      },
      {
        name: "bio",
        active: true,
        type: "Lorem",
        options: { lineCount: 3 },
      },
      {
        name: "location",
        active: true,
        type: "Address",
        options: { useFullAddress: true },
      },
      {
        name: "profilePicture",
        active: true,
        type: "Avatar",
      },
      {
        name: "productCategory",
        type: "Mapped",
        active: true,
        options: {
          field: "department",
          map: { Electronics: "Tech", Shoes: "Fashion" },
        },
      },
    ],
  } satisfies CreateTemplateRequest;

  const template = await datamaker.createTemplate(templateData);

  console.log("Created Template", template);
};

createTemplate()



// ----------------------
// Delete existing template by ID
// ----------------------
const deleteTemplateById = async () => {
  const templateID = "template_12345";
  const template = await datamaker.deleteTemplate(templateID);

  console.log("Template by ID:", template);
};

deleteTemplateById()


