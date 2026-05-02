const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

async function request(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed.");
  }

  return data;
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  getDashboard: (token) => request("/dashboard", { token }),
  getProjects: (token) => request("/projects", { token }),
  getProject: (token, projectId) => request(`/projects/${projectId}`, { token }),
  createProject: (token, payload) => request("/projects", { method: "POST", token, body: payload }),
  addProjectMember: (token, projectId, payload) =>
    request(`/projects/${projectId}/members`, { method: "POST", token, body: payload }),
  getProjectTasks: (token, projectId) => request(`/projects/${projectId}/tasks`, { token }),
  createTask: (token, projectId, payload) =>
    request(`/projects/${projectId}/tasks`, { method: "POST", token, body: payload }),
  updateTaskStatus: (token, taskId, payload) =>
    request(`/tasks/${taskId}/status`, { method: "PUT", token, body: payload })
};
