import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "MEMBER"
};

export default function AuthPage() {
  const { token, login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const redirectTo = useMemo(() => location.state?.from?.pathname ?? "/dashboard", [location]);

  if (token) {
    return <Navigate replace to={redirectTo} />;
  }

  const isSignup = mode === "signup";

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isSignup) {
        await signup(form);
      } else {
        await login({
          email: form.email,
          password: form.password
        });
      }

      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel hidden overflow-hidden p-10 shadow-glow lg:block">
          <div className="max-w-xl">
            <div className="badge bg-skyline/15 text-sky-100">RBAC project manager</div>
            <h1 className="mt-6 text-5xl font-semibold leading-tight text-white">
              Build projects fast, then prove the admin/member rules actually work.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              This starter includes JWT auth, project ownership, team assignments, task status
              updates, and a dashboard designed for a quick demo or assessment submission.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Admin</div>
                <div className="mt-3 text-white">Create projects, add members, assign tasks.</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Member</div>
                <div className="mt-3 text-white">View assigned work and update task status.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel p-8 sm:p-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.28em] text-sky-200/70">Welcome</div>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                {isSignup ? "Create your account" : "Sign in"}
              </h2>
            </div>
            <button
              className="button-secondary"
              onClick={() => {
                setMode(isSignup ? "login" : "signup");
                setError("");
              }}
              type="button"
            >
              {isSignup ? "Use login" : "Create account"}
            </button>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {isSignup ? (
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Full name</span>
                <input
                  className="input"
                  name="name"
                  onChange={updateField}
                  placeholder="Sagar Rawat"
                  required
                  value={form.name}
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <input
                className="input"
                name="email"
                onChange={updateField}
                placeholder="you@example.com"
                required
                type="email"
                value={form.email}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Password</span>
              <input
                className="input"
                name="password"
                onChange={updateField}
                placeholder="Minimum 6 characters"
                required
                type="password"
                value={form.password}
              />
            </label>

            {isSignup ? (
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Role</span>
                <select className="input" name="role" onChange={updateField} value={form.role}>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
                {error}
              </div>
            ) : null}

            <button className="button-primary w-full" disabled={submitting} type="submit">
              {submitting ? "Working..." : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
