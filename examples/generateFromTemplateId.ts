// First set your Datamaker api key as DATAMAKER_API_KEY environment variable
import { DataMaker } from "../src/index";

const datamaker = new DataMaker({});  

const generateData = async () => {
    const quantity = 2;
    const data = await datamaker.generateFromTemplateId("templateIDFromYourAccount", quantity);
    const result = await data.json();
  
    console.log(result);    
};

generateData();