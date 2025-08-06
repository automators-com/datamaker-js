import { DataMaker } from "../src/index";

const datamaker = new DataMaker({});

const fetchProjects = async () => {
  const response = await datamaker.getProjects();
  const projects = await response.json();
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

  const response = await datamaker.createProject(newProject);
  const project = await response.json();
  console.log("Created Project:", project);
};

createNewProject();

const fetchProjectById = async () => {
  const projectId = "project_abc123";

  const response = await datamaker.getProjectById(projectId);
  const project = await response.json();
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

  const response = await datamaker.updateProject(projectId, updates);
  const updated = await response.json();
  console.log("Updated Project:", updated);
};

updateExistingProject();

const removeProject = async () => {
  const projectId = "project_abc123";

  const response = await datamaker.deleteProject(projectId);
  const result = await response.json();
  console.log("Delete Result:", result);
};

removeProject();