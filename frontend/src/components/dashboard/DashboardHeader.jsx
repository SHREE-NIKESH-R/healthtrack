import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Bot, RefreshCw, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import AISidebar from "../layout/AISidebar";

export default function DashboardHeader({
  onRefresh,
  onLogToday,
  todayLogged,
}) {
  const { profile } = useAuth();
  const { dark, toggle } = useTheme();
  const [baymaxOpen, setBaymaxOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = async () => {
    setSpinning(true);
    await onRefresh?.();
    setTimeout(() => setSpinning(false), 800);
  };

  const firstName = profile?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <div className="flex items-center justify-between px-6 py-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm text-ink-400 font-body">{greeting} 👋</p>
          <h1 className="text-2xl font-display font-bold text-ink-900 dark:text-ink-100">
            Hi, <span className="text-gradient">{firstName}</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-2"
        >
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="btn-ghost p-2.5 rounded-xl"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? (
              <Sun size={17} className="text-ink-500" />
            ) : (
              <Moon size={17} className="text-ink-500" />
            )}
          </button>

          {/* Baymax button - replace existing one */}
          <button
            onClick={() => setBaymaxOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl 
    bg-ink-900 hover:bg-ink-700 text-white
    dark:bg-white dark:hover:bg-ink-100 dark:text-ink-900
    transition-all duration-150 active:scale-95"
          >
            <Bot size={16} />
            <span className="text-sm font-medium">Baymax</span>
            <span className="w-1.5 h-1.5 rounded-full bg-activity animate-pulse-slow" />
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="btn-ghost p-2.5"
            title="Refresh data"
          >
            <RefreshCw
              size={16}
              className={`text-ink-400 ${spinning ? "animate-spin" : ""}`}
            />
          </button>

          {/* Log today */}
          <button
            onClick={onLogToday}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95
              ${
                todayLogged
                  ? "bg-activity/10 text-activity hover:bg-activity/20"
                  : "btn-primary"
              }`}
          >
            <Plus size={15} />
            {todayLogged ? "Update Today" : "Log Today"}
          </button>
        </motion.div>
      </div>

      <AISidebar open={baymaxOpen} onClose={() => setBaymaxOpen(false)} />
    </>
  );
}
