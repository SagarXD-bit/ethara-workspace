import { Link } from "react-router-dom";

export default function ProjectCard({ project, isAdmin }) {
  return (
    <Link
      className="panel block p-6 transition hover:-translate-y-1 hover:border-sky-400/40 hover:bg-white/10"
      to={`/projects/${project.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{project.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {project.description || "No description added yet."}
          </p>
        </div>
        <span className="badge bg-white/10 text-white">{isAdmin ? "Owner" : "Assigned"}</span>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
        <div>
          <div className="text-slate-500">Tasks</div>
          <div className="mt-1 text-lg font-semibold text-white">{project.tasksCount}</div>
        </div>
        <div>
          <div className="text-slate-500">Team</div>
          <div className="mt-1 text-lg font-semibold text-white">{project.membersCount + 1}</div>
        </div>
        <div>
          <div className="text-slate-500">Owner</div>
          <div className="mt-1 text-sm font-medium text-white">{project.owner.name}</div>
        </div>
      </div>
    </Link>
  );
}
