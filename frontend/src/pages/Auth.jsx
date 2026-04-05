import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    console.log("submit fired", form); // add this
    if (!form.email || !form.password)
      return setError("Please fill in all fields.");
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password);
      }
      navigate("/");
    } catch (err) {
      console.error("login error", err); // add this
      setError(
        err.response?.data?.error || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setForm({ email: "demo@healthtrack.app", password: "Demo1234" });
    setLoading(true);
    setError("");
    try {
      await login("demo@healthtrack.app", "Demo1234");
      navigate("/");
    } catch {
      setError("Demo account not found. Run node seed.js first.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-dark-canvas flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col w-1/2 bg-gradient-to-br from-primary-600 via-primary to-sleep p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart size={20} className="text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-bold text-white">
              HealthTrack
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Your health
            <br />
            journey starts here
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Track your daily metrics, get AI-powered insights from Baymax, and
            build healthy streaks that last.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { emoji: "📊", label: "Health Score", desc: "Daily 0–100 score" },
              { emoji: "🔥", label: "Streaks", desc: "6 goal metrics" },
              { emoji: "🤖", label: "Baymax AI", desc: "Personal coach" },
              { emoji: "📈", label: "Trends", desc: "30-day history" },
            ].map((f) => (
              <div
                key={f.label}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"
              >
                <div className="text-2xl mb-1">{f.emoji}</div>
                <p className="font-display font-semibold text-white text-sm">
                  {f.label}
                </p>
                <p className="text-white/60 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Heart size={16} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-ink-900 dark:text-ink-100">
              HealthTrack
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100 mb-1">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-ink-400 text-sm mb-8">
            {isLogin
              ? "Sign in to your dashboard"
              : "Start tracking your health today"}
          </p>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-heart/10 border border-heart/20 text-heart text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
                />
                <input
                  type="email"
                  className="input-field pl-9"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
                />
                <input
                  type={showPw ? "text" : "password"}
                  className="input-field pl-9 pr-9"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>

            <div className="relative flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-border dark:bg-dark-border" />
              <span className="text-xs text-ink-300">or</span>
              <div className="flex-1 h-px bg-border dark:bg-dark-border" />
            </div>

            <button
              onClick={demoLogin}
              disabled={loading}
              className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2"
            >
              🎯 Try Demo Account
            </button>
          </div>

          <p className="text-center text-sm text-ink-400 mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin((l) => !l);
                setError("");
              }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
