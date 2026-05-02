import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TaskTable from "../components/TaskTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";

const initialMemberForm = {
  email: ""
};

const initialTaskForm = {
  title: "",
  description: "",
  dueDate: "",
  assignedToId: ""
};

function formatDateTime(date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}

export default function ProjectPage() {
  const { projectId } = useParams();
  const { token, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [memberForm, setMemberForm] = useState(initialMemberForm);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [loading, setLoading] = useState(true);
  const [savingMember, setSavingMember] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user.role === "ADMIN";

  const loadProject = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectResponse, taskResponse] = await Promise.all([
        api.getProject(token, projectId),
        api.getProjectTasks(token, projectId)
      ]);

      setProject(projectResponse.project);
      setTasks(taskResponse.tasks);
      setTaskForm((current) => ({
        ...current,
        assignedToId:
          current.assignedToId || projectResponse.project.members[0]?.id || projectResponse.project.owner.id
      }));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId, token]);

  const members = useMemo(() => project?.members ?? [], [project]);

  const handleAddMember = async (event) => {
    event.preventDefault();
    setSavingMember(true);
    setError("");

    try {
      await api.addProjectMember(token, projectId, memberForm);
      setMemberForm(initialMemberForm);
      await loadProject();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSavingMember(false);
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setSavingTask(true);
    setError("");

    try {
      await api.createTask(token, projectId, {
        ...taskForm,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : ""
      });

      setTaskForm({
        ...initialTaskForm,
        assignedToId: members[0]?.id ?? project?.owner.id ?? ""
      });
      await loadProject();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSavingTask(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    setUpdatingTask(true);
    setError("");

    try {
      await api.updateTaskStatus(token, taskId, { status });
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? { ...task, status } : task))
      );
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setUpdatingTask(false);
    }
  };

  if (loading) {
    return <div className="panel p-8 text-slate-300">Loading project workspace...</div>;
  }

  if (!project) {
    return (
      <div className="panel p-8">
        <p className="text-slate-300">Project not found.</p>
        <Link className="button-secondary mt-4" to="/dashboard">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link className="text-sm text-sky-200 hover:text-white" to="/dashboard">
              Back to dashboard
            </Link>
            <h2 className="mt-3 text-3xl font-semibold text-white">{project.name}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              {project.description || "No project description added yet."}
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-slate-500">Owner</div>
              <div className="mt-1 font-semibold text-white">{project.owner.name}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-slate-500">Members</div>
              <div className="mt-1 font-semibold text-white">{project.members.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-slate-500">Created</div>
              <div className="mt-1 font-semibold text-white">{formatDateTime(project.createdAt)}</div>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Tasks</div>
                <h3 className="mt-2 text-2xl font-semibold text-white">Project board</h3>
              </div>
              <div className="badge bg-white/10 text-white">{tasks.length} total</div>
            </div>
            <TaskTable
              currentUser={user}
              isUpdating={updatingTask}
              onStatusChange={handleStatusChange}
              tasks={tasks}
            />
          </div>

          <div className="panel p-6">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Team</div>
            <h3 className="mt-2 text-2xl font-semibold text-white">Project members</h3>
            <div className="mt-6 grid gap-3">
              {members.map((member) => (
                <div
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  key={member.id}
                >
                  <div>
                    <div className="font-semibold text-white">{member.name}</div>
                    <div className="text-sm text-slate-400">{member.email}</div>
                  </div>
                  <span
                    className={`badge ${
                      member.role === "ADMIN"
                        ? "bg-skyline/15 text-sky-100"
                        : "bg-teal-400/15 text-teal-100"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isAdmin ? (
            <>
              <div className="panel p-6">
                <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Admin action</div>
                <h3 className="mt-2 text-2xl font-semibold text-white">Add a team member</h3>
                <form className="mt-6 space-y-4" onSubmit={handleAddMember}>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Member email</span>
                    <input
                      className="input"
                      onChange={(event) => setMemberForm({ email: event.target.value })}
                      placeholder="member@example.com"
                      required
                      type="email"
                      value={memberForm.email}
                    />
                  </label>
                  <button className="button-primary w-full" disabled={savingMember} type="submit">
                    {savingMember ? "Adding member..." : "Add member"}
                  </button>
                </form>
              </div>

              <div className="panel p-6">
                <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Admin action</div>
                <h3 className="mt-2 text-2xl font-semibold text-white">Assign a new task</h3>
                <form className="mt-6 space-y-4" onSubmit={handleCreateTask}>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Task title</span>
                    <input
                      className="input"
                      onChange={(event) =>
                        setTaskForm((current) => ({ ...current, title: event.target.value }))
                      }
                      placeholder="Draft onboarding guide"
                      required
                      value={taskForm.title}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Description</span>
                    <textarea
                      className="input min-h-28"
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          description: event.target.value
                        }))
                      }
                      placeholder="Give enough context for the assignee to start confidently."
                      value={taskForm.description}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Due date</span>
                    <input
                      className="input"
                      onChange={(event) =>
                        setTaskForm((current) => ({ ...current, dueDate: event.target.value }))
                      }
                      type="datetime-local"
                      value={taskForm.dueDate}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Assign to</span>
                    <select
                      className="input"
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          assignedToId: event.target.value
                        }))
                      }
                      required
                      value={taskForm.assignedToId}
                    >
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </label>

                  <button className="button-primary w-full" disabled={savingTask} type="submit">
                    {savingTask ? "Creating task..." : "Create task"}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="panel p-6 text-sm leading-7 text-slate-300">
              This workspace is read-only for project setup. You can still update the status of tasks
              assigned to you from the board on the left.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
