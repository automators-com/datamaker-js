import { DataMaker } from "../src/index";
import { CreateConnectionRequest } from "../src/template";

const datamaker = new DataMaker({});

// ----------------------
// Create a new connection
// ----------------------
const createConnection = async () => {
  const newConnectionData = {
    name: "Analytics DB",
    type: "postgresql", // Database type "db2" | "postgresql" | "mysql" | "mssql" | "mongodb" | "oracle";
    connectionString: "postgresql://user:pass@host:5432/dbname",
    createdBy: "cme1bbe8m000er5dp2y6f1lla",
    projectId: "cme2sniao0012r5a83wl4rasm",
    teamId: "cme1bbe8k000cr5dp62cd5lab",
    readOnly: true, // Optional: restrict connection to read-only queries
    endpointFolderId: null, // Optional: no folder assigned for now
  } satisfies CreateConnectionRequest;

  const project = await datamaker.createConnection(newConnectionData);

  console.log("Created Connection:", project);
};

createConnection();
