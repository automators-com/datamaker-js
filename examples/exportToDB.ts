// First set your Datamaker api key as DATAMAKER_API_KEY environment variable and save database connection in DB Bridge section of your Datamaker account
import { DataMaker } from "../src/index";

const datamaker = new DataMaker({});  

// Generate data and export them to database
const exportToDB = async () => {
    const quantity = 2; 

    // Define data to be exported to database. You can use Datamaker to generate such data or define your data in code.
    const data = await datamaker.generateFromTemplateId("templateIDFromYourAccount", quantity);  

    // Call export method with connectionID, table name and your data as arguments.
    await datamaker.exportToDB("connectionIDFromYourAccount", "DBTableName", data);   
};

exportToDB();