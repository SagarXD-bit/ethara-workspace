import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProjectPage from "./pages/ProjectPage.jsx";

function HomeRedirect() {
  const { token } = useAuth();
  return <Navigate replace to={token ? "/dashboard" : "/login"} />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<HomeRedirect />} path="/" />
      <Route element={<AuthPage />} path="/login" />
      <Route
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
        path="/dashboard"
      />
      <Route
        element={
          <ProtectedRoute>
            <AppShell>
              <ProjectPage />
            </AppShell>
          </ProtectedRoute>
        }
        path="/projects/:projectId"
      />
      <Route element={<HomeRedirect />} path="*" />
    </Routes>
  );
}
