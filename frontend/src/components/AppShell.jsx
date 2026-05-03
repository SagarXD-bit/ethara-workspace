import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="panel flex flex-col gap-4 p-6 shadow-glow md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.32em] text-sky-200/70">Ethara Workflow RBAC</div>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {location.pathname === "/dashboard" ? "Team Dashboard" : "Project Workspace"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className="button-secondary" to="/dashboard">
              Dashboard
            </Link>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
              <div className="text-sm font-semibold text-white">{user?.name}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{user?.role}</div>
            </div>
            <button className="button-primary" onClick={handleLogout} type="button">
              Log out
            </button>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
