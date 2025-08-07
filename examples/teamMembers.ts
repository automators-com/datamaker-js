import { DataMaker } from "../src/index";

const datamaker = new DataMaker({});

const getAllTeamMembers = async () => {
  const teamMembers = await datamaker.getTeamMembers();
  console.log("Team Members:", teamMembers);
};

getAllTeamMembers();

const createTeamMember = async () => {
  const newMember = await datamaker.createTeamMember({
    userId: "user_123",
    teamId: "team_456",
    role: "MEMBER",
  });
  console.log("Created Team Member:", newMember);
};

createTeamMember();

const updateTeamMember = async () => {
  const updated = await datamaker.updateTeamMember("teamMember_789", {
    userId: "user_123",
    teamId: "team_456",
    role: "OWNER",
  });
  console.log("Updated Team Member:", updated);
};

updateTeamMember();

const deleteTeamMember = async () => {
  const result = await datamaker.deleteTeamMember("teamMember_789");
  console.log("Deleted Team Member:", result);
};

deleteTeamMember();

const inviteTeamMember = async () => {
  const invitation = await datamaker.inviteTeamMember({
    email: "new.member@example.com",
    teamId: "team_456",
    role: "MEMBER", // Optional, defaults to MEMBER
  });
  console.log("Invitation Sent:", invitation);
};

inviteTeamMember();
