import { DataMaker } from "../src/index";

const datamaker = new DataMaker({});

// ----------------------
// Fetch all teams
// ----------------------
const getAllTeams = async () => {
  const teams = await datamaker.getTeams();
  console.log("Teams:", teams);
};

getAllTeams();


// ----------------------
// Create a new team
// ----------------------
const createTeam = async () => {
  const team = await datamaker.createTeam({
    name: "Automators AI Team",
    avatar: "https://example.com/avatar.png",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log("Created Team:", team);
};

createTeam();

// ----------------------
// Update existing team
// ----------------------
const updateTeam = async () => {
  const teamId = "team_12345";

  const updated = await datamaker.updateTeam(teamId, {
    name: "Updated Automators Team",
    avatar: "https://example.com/new-avatar.png",
    updatedAt: new Date().toISOString(),
  });

  console.log("Updated Team:", updated);
};

updateTeam();

// ----------------------
// Delete a team
// ----------------------
const deleteTeam = async () => {
  const teamId = "team_12345";

  const deletedTeam = await datamaker.deleteTeam(teamId);

  console.log("Deleted Team:", deletedTeam);
};

deleteTeam();
