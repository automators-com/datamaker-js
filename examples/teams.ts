import { DataMaker } from "../src/index";

const datamaker = new DataMaker({});

const getAllTeams = async () => {
  const teams = await datamaker.getTeams();
  console.log("Teams:", teams);
};

getAllTeams();

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

const deleteTeam = async () => {
  const teamId = "team_12345";

  const deletedTeam = await datamaker.deleteTeam(teamId);

  console.log("Deleted Team:", deletedTeam);
};

deleteTeam();
