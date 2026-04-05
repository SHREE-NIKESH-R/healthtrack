import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2, AlertCircle } from "lucide-react";
import { aiApi } from "../../services";

const SUGGESTIONS = [
  "How's my sleep looking? 😴",
  "Am I hitting my step goals? 🚶",
  "How's my hydration this week? 💧",
  "Give me a full health summary! 📊",
];

// Renders text with basic markdown: **bold**, bullet points, newlines
const MessageText = ({ content }) => {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        // Parse **bold** anywhere in line
        const parseBold = (text) => {
          const parts = text.split(/\*\*(.*?)\*\*/g);
          return parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold">
                {part}
              </strong>
            ) : (
              part
            ),
          );
        };

        // Bullet: lines starting with - or • or +
        if (/^[\-\•\+]\s+/.test(line.trim())) {
          const text = line.trim().replace(/^[\-\•\+]\s+/, "");
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="shrink-0 mt-0.5 text-primary">•</span>
              <span>{parseBold(text)}</span>
            </div>
          );
        }

        // Numbered list: 1. 2. etc
        if (/^\d+\.\s+/.test(line.trim())) {
          const num = line.trim().match(/^(\d+\.)/)[1];
          const text = line.trim().replace(/^\d+\.\s+/, "");
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="shrink-0 mt-0.5 text-primary font-mono text-xs">
                {num}
              </span>
              <span>{parseBold(text)}</span>
            </div>
          );
        }

        // Sub-bullets with indentation (+ or nested •)
        if (/^\s{2,}[\-\•\+]/.test(line)) {
          const text = line.trim().replace(/^[\-\•\+]\s+/, "");
          return (
            <div key={i} className="flex gap-2 items-start ml-4">
              <span className="shrink-0 mt-0.5 text-ink-400 text-xs">◦</span>
              <span className="text-ink-600 dark:text-ink-400">
                {parseBold(text)}
              </span>
            </div>
          );
        }

        // Normal paragraph
        return <p key={i}>{parseBold(line)}</p>;
      })}
    </div>
  );
};

export default function AISidebar({ open, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey! I'm Baymax, your personal health companion! 🤖💙\n\nI can help you understand your health data, spot trends, and give you tips to feel your best. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      aiApi
        .status()
        .then((r) => setConfigured(r.data.configured))
        .catch(() => setConfigured(false));
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const history = messages
      .slice(1)
      .map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await aiApi.chat(msg, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (err) {
      const errMsg =
        err.response?.data?.error || "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${errMsg}`, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-900/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-[480px] bg-surface dark:bg-dark-surface shadow-float z-50 flex flex-col border-l border-border dark:border-dark-border"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border dark:border-dark-border bg-gradient-to-r from-primary/5 to-sleep/5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
                <Bot size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100">
                  Baymax
                </h2>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${configured ? "bg-activity animate-pulse-slow" : "bg-ink-300"}`}
                  />
                  <span className="text-xs text-ink-400">
                    {configured
                      ? "Online · Your health companion"
                      : "Not configured"}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="btn-ghost p-2">
                <X size={16} />
              </button>
            </div>

            {!configured && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-screen/10 border border-screen/20 flex gap-2">
                <AlertCircle
                  size={15}
                  className="text-screen shrink-0 mt-0.5"
                />
                <p className="text-xs text-ink-600 dark:text-ink-400">
                  Add <strong>OPENROUTER_API_KEY</strong> to backend/.env to
                  enable Baymax.
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2`}
                >
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot size={14} className="text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                    ${
                      m.role === "user"
                        ? "bg-primary text-white rounded-tr-sm"
                        : m.isError
                          ? "bg-heart/10 text-heart border border-heart/20 rounded-tl-sm"
                          : "bg-ink-100 dark:bg-dark-card text-ink-800 dark:text-ink-200 rounded-tl-sm"
                    }`}
                  >
                    {m.role === "assistant" && !m.isError ? (
                      <MessageText content={m.content} />
                    ) : (
                      m.content
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot size={14} className="text-primary" />
                  </div>
                  <div className="bg-ink-100 dark:bg-dark-card px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-ink-400">
                      Baymax is thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-2 rounded-xl border border-primary/30 text-primary hover:bg-primary/5 transition-all duration-150 text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-4 border-t border-border dark:border-dark-border">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Ask Baymax anything about your health..."
                  className="input-field flex-1"
                  disabled={loading || !configured}
                />
                <button
                  onClick={() => send()}
                  disabled={loading || !input.trim() || !configured}
                  className="btn-primary px-3 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="text-xs text-ink-300 text-center mt-2">
                Powered by AI · Based on your health data
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
