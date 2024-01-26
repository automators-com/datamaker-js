// First set your Datamaker api key as DATAMAKER_API_KEY environment variable
import { DataMaker, CustomEndpoint } from "../src/index";

const datamaker = new DataMaker({});  

// Generate data and send them to API endpoint saved in your Datamaker account (identified by ID)
const exportToPredefinedEndpoint = async () => {
    const quantity = 2;
    const generate = await datamaker.generateFromTemplateId("templateIDFromYourAccount", quantity);    
    const data = await generate.json();

    await datamaker.exportToApi("idOfEndpointInYourAccount", data);    
};

exportToPredefinedEndpoint();

// Generate data and send them to a custom API endpoint
const exportToCustomEndpoint = async () => {
    const quantity = 2;
    // Define endpoint that has obligatory url and method parameters and optional headers parameter
    const endpoint: CustomEndpoint = {
        url: "urlOfYourEndpoint",
        method: "POST",
        headers: {
            // optional headers object
        }
    };

    const generate = await datamaker.generateFromTemplateId("templateIDFromYourAccount", quantity);    
    const data = await generate.json();

    // Call export method with your defined endpoint instead of endpoint ID from your Datamaker account
    await datamaker.exportToApi(endpoint, data);
};

exportToCustomEndpoint();