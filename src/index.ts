import { DefaultQuery, Fetch } from "./core";
import {
  AccountTemplate,
  Fields,
  Template,
  Endpoint,
  CustomEndpoint,
  Data,
  DBQuery,
} from "./template";
import * as Errors from "./error";
import { readEnv } from "./utils";
import { fetchDatamaker } from "./utils";

interface ClientOptions {
  /**
   * Defaults to process.env['DATAMAKER_API_KEY'].
   */
  apiKey?: string;

  /**
   * Override the default base URL for the API, e.g., "https://Core.example.com/v2/"
   */
  baseURL?: string;

  /**
   * The maximum amount of time (in milliseconds) that the client should wait for a response
   * from the server before timing out a single request.
   *
   * Note that request timeouts are retried by default, so in a worst-case scenario you may wait
   * much longer than this timeout before the promise succeeds or fails.
   */
  timeout?: number;

  /**
   * Specify a custom `fetch` function implementation.
   *
   * If not provided, we use `node-fetch` on Node.js and otherwise expect that `fetch` is
   * defined globally.
   */
  fetch?: Fetch | undefined;

  /**
   * The maximum number of times that the client will retry a request in case of a
   * temporary failure, like a network error or a 5XX error from the server.
   *
   * @default 2
   */
  maxRetries?: number;

  /**
   * Default headers to include with every request to the Core.
   *
   * These can be removed in individual requests by explicitly setting the
   * header to `undefined` or `null` in request options.
   */
  defaultHeaders?: HeadersInit;

  /**
   * Default query parameters to include with every request to the Core.
   *
   * These can be removed in individual requests by explicitly setting the
   * param to `undefined` in request options.
   */
  defaultQuery?: DefaultQuery;
}

// create datamaker class object
class DataMaker {
  readonly apiKey: string;
  headers: HeadersInit;
  options: ClientOptions;

  /**
   * API Client for interfacing with the DataMaker Core.
   *
   * @param {string} [opts.apiKey==process.env['DATAMAKER_API_KEY'] ?? undefined]
   * @param {string} [opts.baseURL] - Override the default base URL for the Core.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {number} [opts.httpAgent] - An HTTP agent used to manage HTTP(s) connections.
   * @param {Core.Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {Core.Headers} opts.defaultHeaders - Default headers to include with every request to the Core.
   * @param {Core.DefaultQuery} opts.defaultQuery - Default query parameters to include with every request to the Core.
   */
  constructor({
    apiKey = readEnv("DATAMAKER_API_KEY"),
    ...opts
  }: ClientOptions = {}) {
    if (apiKey === undefined) {
      throw new Errors.DataMakerError(
        "The DATAMAKER_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new DataMaker({ apiKey: 'My API Key' })."
      );
    }
    const options: ClientOptions = {
      apiKey,
      ...opts,
      baseURL: opts.baseURL ?? `https://cloud.datamaker.app/api`,
    };

    this.apiKey = apiKey;
    this.options = options;
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `${this.apiKey}`,
      "X-API-KEY": `${this.apiKey}`,
      ...this.options.defaultHeaders,
    };
  }
  /**
   * Generate data from custom template.
   * @param template
   * @returns
   */
  async generate(template: Template) {
    if (!template) {
      throw new Errors.DataMakerError(
        "You must provide a template to generate data."
      );
    }

    if (!template.quantity) {
      template.quantity = 1;
    }
    return (
      await fetchDatamaker(this.options.baseURL, this.headers, template)
    ).json();
  }
  /**
   * Generate data using template from you Datamaker account. As arguments provide ID of a template from your account and a number of entries to be generated.
   * Requires Datamaker api key to be defined in your project.
   * @param templateId
   * @param quantity
   * @returns
   */
  async generateFromTemplateId(templateId: string, quantity: number = 1) {
    const url = `${this.options.baseURL}/templates`;

    const fetchTemplate = await fetch(url, {
      method: "GET",
      headers: this.headers,
    });

    const templateData = await fetchTemplate.json();
    let template = templateData.find(
      (temp: AccountTemplate) => temp.id === templateId
    );

    if (!templateData) {
      throw new Errors.DataMakerError("No templates found in your account.");
    }

    if (!template) {
      throw new Errors.DataMakerError(
        "You must provide ID of a template from your account."
      );
    }

    template.quantity = quantity;
    return (
      await fetchDatamaker(this.options.baseURL, this.headers, template)
    ).json();
  }
  /**
   * Send data to an endpoint. In parameters provide with endpoint compatible data as array of objects
   * and with API endpoint either as ID of an endpoint from your account or as an object.
   * @param api
   * @param data
   * @returns
   */
  async exportToApi(api: string | CustomEndpoint, data: object[]) {
    const url = `${this.options.baseURL}/endpoints`;
    let targetEndpoint: Endpoint | CustomEndpoint;
    let result: Array<{}> = [];
    let headers: any = this.headers;

    if (typeof api == "string") {
      const fetchEnpoints = await fetch(url, {
        method: "GET",
        headers: this.headers,
      });

      const endpointData = await fetchEnpoints.json();
      const endpoint = endpointData.find(
        (endpoint: Endpoint) => endpoint.id === api
      );
      targetEndpoint = endpoint;

      if (Object.keys(endpoint.headers).length > 0) {
        headers = endpoint.headers;
      }
    } else {
      targetEndpoint = api;
      if (api.headers) {
        headers = api.headers;
      }
    }

    for (const entry of data) {
      const apiCall = await fetch(targetEndpoint.url, {
        method: targetEndpoint.method,
        headers,
        body: JSON.stringify(entry),
      });

      const callData = await apiCall.json();
      result.push(callData);
    }

    if (result) return result;

    throw new Errors.DataMakerError("Something went wrong.");
  }

  /**
   * Export data to database saved in your Datamaker account. In parameters provide with DB Bridge connection ID,
   * name of database table to export data into and with data to be exported.
   * @param connectionId
   * @param tableName
   * @param data
   * @returns
   */
  async exportToDB(connectionId: string, tableName: string, data: object[]) {
    try {
      // Fetch connection details
      const fetchConnection = await fetch(
        `${this.options.baseURL}/connections`,
        {
          method: "GET",
          headers: this.headers,
        }
      );

      if (!fetchConnection.ok) {
        throw new Errors.DataMakerError("Failed to fetch connection details.");
      }

      const connectionsData = await fetchConnection.json();
      const connection = connectionsData.find(
        (db: Data) => db.id === connectionId
      );

      if (!connection) {
        throw new Errors.DataMakerError("Connection not found.");
      }

      // Test connection
      const testBody: { connectionString: string; type: string } = {
        connectionString: connection.connectionString,
        type: connection.type,
      };

      const testConnection = await fetch(
        `${this.options.baseURL}/connections/test`,
        {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify(testBody),
        }
      );

      if (testConnection.status !== 200) {
        throw new Errors.DataMakerError("Your connection is not working.");
      }

      // Loop through each entry in the data array and construct values to be pushed to DB
      let values: string[] = [];

      for (const entry of data) {
        const entryValues = Object.values(entry)
          .map((value) => `'${value}'`)
          .join(", ");
        values.push(`(${entryValues})`);
      }

      const body: DBQuery = {
        connectionId: connection.id,
        query: `INSERT INTO "${tableName}" (${Object.keys(data[0]!)
          .map((key) => `"${key}"`)
          .join(", ")}) VALUES ${values.join(", ")};`,
      };

      // Push to DB
      const push = await fetch(`${this.options.baseURL}/export/db`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(body),
      });

      if (!push.ok) {
        throw new Errors.DataMakerError("Failed to export data to DB.");
      }

      const pushData = await push.json();
      return pushData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // ==================== PROJECTS ENDPOINTS =========================

  /**
   * Get all projects.
   * @returns A list of all projects available to the authenticated user.
   */
  async getProjects() {
    const response = await fetch(`${this.options.baseURL}/projects`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Errors.DataMakerError(
        `Failed to fetch projects: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Create a new project.
   * @param project - Object containing project details (name and teamId are required).
   * @returns The newly created project.
   */
  async createProject(project: {
    name: string;
    teamId: string;
    id?: string;
    avatar?: string;
    description?: string;
  }) {
    const response = await fetch(`${this.options.baseURL}/projects`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(project),
    });

    if (!response.ok) {
      throw new Errors.DataMakerError(
        `Failed to create project: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Get a project by ID.
   * @param id - The ID of the project to fetch.
   * @returns The project with the specified ID.
   */
  async getProjectById(id: string) {
    if (!id) {
      throw new Errors.DataMakerError("Project ID is required.");
    }

    const response = await fetch(`${this.options.baseURL}/projects/${id}`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Errors.DataMakerError(
        `Failed to fetch project: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Update an existing project.
   * @param id - The ID of the project to update.
   * @param updates - Fields to update: name and teamId are required.
   * @returns The updated project.
   */
  async updateProject(
    id: string,
    updates: {
      name: string;
      teamId: string;
      avatar?: string;
      description?: string;
    }
  ) {
    if (!id) {
      throw new Errors.DataMakerError("Project ID is required to update.");
    }

    const response = await fetch(`${this.options.baseURL}/projects/${id}`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify({ ...updates, id }),
    });

    if (!response.ok) {
      throw new Errors.DataMakerError(
        `Failed to update project: ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Delete a project by its ID.
   * @param id - The ID of the project to delete.
   * @returns A success message or status.
   */
  async deleteProject(id: string) {
    if (!id) {
      throw new Errors.DataMakerError("Project ID is required to delete.");
    }

    const response = await fetch(`${this.options.baseURL}/projects/${id}`, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Errors.DataMakerError(
        `Failed to delete project: ${response.statusText}`
      );
    }

    return response.json();
  }

  // ==================== TEAMS ENDPOINTS =========================

  /**
   * Fetch a list of all teams.
   *
   * @returns A list of teams.
   */

  async getTeams() {
    const response = await fetch(`${this.options.baseURL}/teams`, {
      method: "GET",
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Errors.DataMakerError(
        `Failed to fetch teams: ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Create a new team.
   *
   * @param team - An object containing the team's information.
   * @param team.name - The name of the team (required).
   * @param team.avatar - Optional avatar URL for the team.
   * @param team.createdAt - Optional ISO date string.
   * @param team.updatedAt - Optional ISO date string.
   *
   * @returns
   */
  async createTeam(team: {
    name: string;
    avatar?: string;
    createdAt?: string;
    updatedAt?: string;
  }) {
    if (!team.name) {
      throw new Errors.DataMakerError("Team name is required.");
    }
    const response = await fetch(`${this.options.baseURL}/teams`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(team),
    });

    if (!response.ok) {
      throw new Errors.DataMakerError(
        `Failed to create team: ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Update an existing team by its ID.
   *
   * @param id - The ID of the team to update (required).
   * @param updates - An object containing the updated fields.
   * @param updates.name - The updated name of the team (required).
   * @param updates.avatar - Optional updated avatar URL.
   * @param updates.createdAt - Optional updated creation timestamp.
   * @param updates.updatedAt - Optional updated timestamp.
   *
   * @returns An object with the updated team data.
   */
  async updateTeam(
    id: string,
    updates: {
      name: string;
      avatar?: string;
      createdAt?: string;
      updatedAt?: string;
    }
  ) {
    if (!id || !updates.name) {
      throw new Errors.DataMakerError("Missing required team fields: id, name");
    }

    const response = await fetch(`${this.options.baseURL}/teams/${id}`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Errors.DataMakerError(`Failed to update team with ID:${id}`);
    }
    return response.json();
  }

  /**
   * Delete a team by its ID.
   *
   * @param id - The ID of the team to delete.
   *
   * @returns
   */
  async deleteTeam(id: string) {
    if (!id) {
      throw new Errors.DataMakerError("Team ID is required to delete.");
    }
    const response = await fetch(`${this.options.baseURL}/teams/${id}`, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Errors.DataMakerError(
        `Failed to delete team: ${response.statusText}`
      );
    }
    return response.json();
  }

  // ==================== TEAM MEMBERS ENDPOINTS =========================

  /**
   * Get all team members.
   * @returns A list of all team members.
   */
  async getTeamMembers() {
    const response = await fetch(`${this.options.baseURL}/teamMembers`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Errors.DataMakerError("Failed to fetch team members.");
    }

    return response.json();
  }

  /**
   * Create a new team member.
   * @param member - Object containing userId, teamId, and role.
   * @returns The newly created team member.
   */
  async createTeamMember(member: {
    userId: string;
    teamId: string;
    role: "MEMBER" | "OWNER";
  }) {
    const { userId, teamId, role } = member;

    if (!userId || !teamId || !role) {
      throw new Errors.DataMakerError(
        "Missing required fields: userId, teamId, or role."
      );
    }

    const response = await fetch(`${this.options.baseURL}/teamMembers`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(member),
    });

    if (!response.ok) {
      throw new Errors.DataMakerError("Failed to create team member.");
    }

    return response.json();
  }

  /**
   * Invite a team member by email.
   * @param invite - Object containing email, teamId, and optional role.
   * @returns The invitation result.
   */
  async inviteTeamMember(invite: {
    email: string;
    teamId: string;
    role?: "MEMBER" | "OWNER";
  }) {
    const { email, teamId } = invite;

    if (!email || !teamId) {
      throw new Errors.DataMakerError(
        "Missing required fields: email or teamId."
      );
    }

    const response = await fetch(`${this.options.baseURL}/teamMembers/invite`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(invite),
    });

    if (!response.ok) {
      throw new Errors.DataMakerError("Failed to invite team member.");
    }

    return response.json();
  }

  /**
   * Update a team member by ID.
   * @param id - The team member's ID.
   * @param updates - Object containing userId, teamId, and role.
   * @returns The updated team member.
   */
  async updateTeamMember(
    id: string,
    updates: {
      userId: string;
      teamId: string;
      role: "MEMBER" | "OWNER";
    }
  ) {
    if (!id) {
      throw new Errors.DataMakerError("Team member ID is required to update.");
    }

    if (!updates.userId || !updates.teamId || !updates.role) {
      throw new Errors.DataMakerError(
        "Missing required fields in team member update: userId, teamId, or role."
      );
    }

    const response = await fetch(`${this.options.baseURL}/teamMembers/${id}`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Errors.DataMakerError(
        `Failed to update team member with ID: ${id}`
      );
    }

    return response.json();
  }

  /**
   * Delete a team member by ID.
   * @param id - The ID of the team member to delete.
   * @returns A success message or status.
   */
  async deleteTeamMember(id: string) {
    if (!id) {
      throw new Errors.DataMakerError("Team member ID is required to delete.");
    }

    const response = await fetch(`${this.options.baseURL}/teamMembers/${id}`, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Errors.DataMakerError(
        `Failed to delete team member with ID: ${id}`
      );
    }

    return response.json();
  }
}

export { DataMaker, ClientOptions, Fields, Template, CustomEndpoint, Data };
