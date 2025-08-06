import { DataMaker } from "../src/index";

const datamaker = new DataMaker({});

const getAllTeams = async () => {
  const response = await datamaker.getTeams();
  const teams = await response.json();
  console.log("Teams:", teams);
};

getAllTeams();

const createTeam = async () => {
  const response = await datamaker.createTeam({
    name: "Automators AI Team",
    avatar: "https://example.com/avatar.png",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const team = await response.json();
  console.log("Created Team:", team);
};

createTeam();

const updateTeam = async () => {
  const teamId = "team_12345";

  const response = await datamaker.updateTeam(teamId, {
    name: "Updated Automators Team",
    avatar: "https://example.com/new-avatar.png",
    updatedAt: new Date().toISOString(),
  });

  const updated = await response.json();
  console.log("Updated Team:", updated);
};

updateTeam();

const deleteTeam = async () => {
  const teamId = "team_12345";

  const response = await datamaker.deleteTeam(teamId);

  if (response.ok) {
    console.log(`Team with ID ${teamId} was deleted successfully.`);
  } else {
    console.error(`Failed to delete team with ID ${teamId}`);
  }
};

deleteTeam();
