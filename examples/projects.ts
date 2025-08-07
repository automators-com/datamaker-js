import { DataMaker } from "../src/index";

const datamaker = new DataMaker({});

const fetchProjects = async () => {
  const projects = await datamaker.getProjects();
  console.log("All Projects:", projects);
};

fetchProjects();

const createNewProject = async () => {
  const newProject = {
    name: "AI Templates Project",
    teamId: "team_123456",
    description: "Project for testing SDK integration",
    avatar: "https://example.com/avatar.png",
  };

  const project = await datamaker.createProject(newProject);
  console.log("Created Project:", project);
};

createNewProject();

const fetchProjectById = async () => {
  const projectId = "project_abc123";

  const project = await datamaker.getProjectById(projectId);
  console.log("Project by ID:", project);
};

fetchProjectById();

const updateExistingProject = async () => {
  const projectId = "project_abc123";
  const updates = {
    name: "Updated Project Name",
    teamId: "team_123456",
    avatar: "https://example.com/new-avatar.png",
    description: "Updated description via SDK",
  };

  const updated = await datamaker.updateProject(projectId, updates);
  console.log("Updated Project:", updated);
};

updateExistingProject();

const removeProject = async () => {
  const projectId = "project_abc123";

  const result = await datamaker.deleteProject(projectId);
  console.log("Delete Result:", result);
};

removeProject();