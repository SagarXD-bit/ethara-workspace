const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "DONE"];

function formatDate(date) {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium"
  }).format(new Date(date));
}

export default function TaskTable({ tasks, currentUser, onStatusChange, isUpdating }) {
  if (!tasks.length) {
    return (
      <div className="panel p-6 text-sm text-slate-300">
        No tasks yet. Admins can create the first task for this project.
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.22em] text-slate-400">
            <tr>
              <th className="px-5 py-4">Task</th>
              <th className="px-5 py-4">Assignee</th>
              <th className="px-5 py-4">Due</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const canUpdate =
                currentUser.role === "ADMIN" || task.assignedTo?.id === currentUser.id;

              return (
                <tr className="border-b border-white/5 last:border-b-0" key={task.id}>
                  <td className="px-5 py-4 align-top">
                    <div className="font-semibold text-white">{task.title}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {task.description || "No details provided."}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-slate-200">
                    {task.assignedTo?.name}
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {task.assignedTo?.role}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-slate-300">
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <select
                      className="input max-w-[170px] py-2"
                      disabled={!canUpdate || isUpdating}
                      onChange={(event) => onStatusChange(task.id, event.target.value)}
                      value={task.status}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
