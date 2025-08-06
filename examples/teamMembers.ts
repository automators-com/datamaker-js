import { DataMaker } from "../src/index";

const datamaker = new DataMaker({});

const getAllTeamMembers = async () => {
  try {
    const teamMembers = await datamaker.getTeamMembers();
    console.log("Team Members:", teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
  }
};

getAllTeamMembers();

const createTeamMember = async () => {
  try {
    const newMember = await datamaker.createTeamMember({
      userId: "user_123",
      teamId: "team_456",
      role: "MEMBER",
    });
    console.log("Created Team Member:", newMember);
  } catch (error) {
    console.error("Error creating team member:", error);
  }
};

createTeamMember();

const updateTeamMember = async () => {
  try {
    const updated = await datamaker.updateTeamMember("teamMember_789", {
      userId: "user_123",
      teamId: "team_456",
      role: "OWNER",
    });
    console.log("Updated Team Member:", updated);
  } catch (error) {
    console.error("Error updating team member:", error);
  }
};

updateTeamMember();

const deleteTeamMember = async () => {
  try {
    const result = await datamaker.deleteTeamMember("teamMember_789");
    console.log("Deleted Team Member:", result);
  } catch (error) {
    console.error("Error deleting team member:", error);
  }
};

deleteTeamMember();

const inviteTeamMember = async () => {
  try {
    const invitation = await datamaker.inviteTeamMember({
      email: "new.member@example.com",
      teamId: "team_456",
      role: "MEMBER", // Optional, defaults to MEMBER
    });
    console.log("Invitation Sent:", invitation);
  } catch (error) {
    console.error("Error inviting team member:", error);
  }
};

inviteTeamMember();
