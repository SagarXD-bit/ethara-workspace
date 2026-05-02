import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";

const initialProjectForm = {
  name: "",
  description: ""
};

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState(initialProjectForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardResponse, projectsResponse] = await Promise.all([
        api.getDashboard(token),
        api.getProjects(token)
      ]);

      setDashboard(dashboardResponse.stats);
      setProjects(projectsResponse.projects);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError("");

    try {
      await api.createProject(token, projectForm);
      setProjectForm(initialProjectForm);
      await loadData();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="panel p-8 text-slate-300">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Projects" tone="sky" value={dashboard?.projects ?? 0} />
        <StatCard label="Total Tasks" tone="slate" value={dashboard?.totalTasks ?? 0} />
        <StatCard label="Completed" tone="teal" value={dashboard?.completed ?? 0} />
        <StatCard label="In Progress" tone="sky" value={dashboard?.inProgress ?? 0} />
        <StatCard label="Overdue" tone="orange" value={dashboard?.overdue ?? 0} />
      </section>

      {error ? (
        <div className="rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.26em] text-slate-400">Projects</div>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {user.role === "ADMIN" ? "Projects you own" : "Projects assigned to you"}
              </h2>
            </div>
            <div className="badge bg-white/10 text-white">{projects.length} visible</div>
          </div>

          <div className="mt-6 grid gap-4">
            {projects.length ? (
              projects.map((project) => (
                <ProjectCard isAdmin={user.role === "ADMIN"} key={project.id} project={project} />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 p-8 text-sm text-slate-300">
                No projects yet. {user.role === "ADMIN"
                  ? "Create one using the panel on the right."
                  : "Ask an admin to add you to a project."}
              </div>
            )}
          </div>
        </div>

        <div className="panel p-6">
          <div className="text-sm uppercase tracking-[0.26em] text-slate-400">Quick actions</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {user.role === "ADMIN" ? "Create a new project" : "Your role permissions"}
          </h2>

          {user.role === "ADMIN" ? (
            <form className="mt-6 space-y-4" onSubmit={handleCreateProject}>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Project name</span>
                <input
                  className="input"
                  name="name"
                  onChange={(event) =>
                    setProjectForm((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  placeholder="Q3 Marketing Sprint"
                  required
                  value={projectForm.name}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Description</span>
                <textarea
                  className="input min-h-32"
                  name="description"
                  onChange={(event) =>
                    setProjectForm((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                  placeholder="Outline the goal, scope, and team expectations."
                  value={projectForm.description}
                />
              </label>

              <button className="button-primary w-full" disabled={creating} type="submit">
                {creating ? "Creating project..." : "Create project"}
              </button>
            </form>
          ) : (
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                Members can open assigned projects and update the status of their own tasks.
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                Project creation, team assignment, and task assignment stay restricted to admins.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
