import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/layout/Sidebar";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Wellness from "./pages/Wellness";
import Goals from "./pages/Goals";
import Records from "./pages/Records";
import Insights from "./pages/Insights";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-canvas dark:bg-dark-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-ink-400 text-sm">Loading HealthTrack...</p>
        </div>
      </div>
    );
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <div className="flex h-screen bg-canvas dark:bg-dark-canvas overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/records" element={<Records />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
