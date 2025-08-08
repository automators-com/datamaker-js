import { DataMaker } from "../src/index";

const datamaker = new DataMaker({});

// ----------------------
// Fetch all projects
// ----------------------
const fetchProjects = async () => {
 
  const projects = await datamaker.getProjects();

  console.log("All Projects:", projects);
};

fetchProjects();

// ----------------------
// Create a new project
// ----------------------
const createNewProject = async () => {

  // Define the new project data with teamID
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

// ----------------------
// Fetch a single project by ID
// ----------------------
const fetchProjectById = async () => {
  
  const projectId = "project_abc123";
  const project = await datamaker.getProjectById(projectId);

  console.log("Project by ID:", project);
};

fetchProjectById();

// ----------------------
// Update an existing project
// ----------------------
const updateExistingProject = async () => {
  
  const projectId = "project_abc123";

  // Define the fields to update
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

// ----------------------
// Delete a project
// ----------------------
const removeProject = async () => {

  const projectId = "project_abc123";
  const result = await datamaker.deleteProject(projectId);

  console.log("Delete Result:", result);
};

removeProject();
