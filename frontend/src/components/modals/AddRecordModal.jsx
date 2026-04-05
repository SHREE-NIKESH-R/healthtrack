import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { recordsApi, wellnessApi, goalsApi } from "../../services";

const FIELDS = [
  {
    key: "heartRate",
    label: "Heart Rate",
    unit: "bpm",
    type: "number",
    placeholder: "72",
    min: 30,
    max: 220,
  },
  {
    key: "sleepHours",
    label: "Sleep Hours",
    unit: "hrs",
    type: "number",
    placeholder: "7.5",
    min: 0,
    max: 24,
    step: 0.5,
  },
  {
    key: "stepCount",
    label: "Step Count",
    unit: "steps",
    type: "number",
    placeholder: "8000",
    min: 0,
    max: 100000,
  },
  {
    key: "waterIntake",
    label: "Water Intake",
    unit: "L",
    type: "number",
    placeholder: "2.0",
    min: 0,
    max: 20,
    step: 0.1,
  },
  {
    key: "screenTime",
    label: "Screen Time",
    unit: "hrs",
    type: "number",
    placeholder: "5.0",
    min: 0,
    max: 24,
    step: 0.5,
  },
  {
    key: "exerciseDuration",
    label: "Exercise",
    unit: "min",
    type: "number",
    placeholder: "30",
    min: 0,
    max: 720,
  },
  {
    key: "sugarLevel",
    label: "Blood Sugar",
    unit: "mg/dL",
    type: "number",
    placeholder: "90",
    min: 40,
    max: 600,
  },
];

const MOODS = [
  { value: "great", label: "😄 Great" },
  { value: "good", label: "🙂 Good" },
  { value: "okay", label: "😐 Okay" },
  { value: "low", label: "😕 Low" },
  { value: "poor", label: "😞 Poor" },
];

export default function AddRecordModal({ open, onClose, existing }) {
  const [form, setForm] = useState({});
  const [bp, setBp] = useState({ systolic: "", diastolic: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (existing) {
      const f = {};
      FIELDS.forEach(({ key }) => {
        if (existing[key] != null) f[key] = existing[key];
      });
      if (existing.moodIndicator) f.moodIndicator = existing.moodIndicator;
      if (existing.notes) f.notes = existing.notes;
      setForm(f);
      if (existing.bloodPressure) {
        setBp({
          systolic: existing.bloodPressure.systolic || "",
          diastolic: existing.bloodPressure.diastolic || "",
        });
      }
    } else {
      setForm({});
      setBp({ systolic: "", diastolic: "" });
    }
    setError("");
  }, [existing, open]);

  const handleChange = (key, value) =>
    setForm((f) => ({ ...f, [key]: value === "" ? undefined : Number(value) }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (bp.systolic && bp.diastolic) {
        payload.bloodPressure = {
          systolic: Number(bp.systolic),
          diastolic: Number(bp.diastolic),
        };
      }
      await recordsApi.save(payload);
      // Auto-calculate score and check goals
      await Promise.allSettled([
        wellnessApi.calculateToday(),
        goalsApi.checkToday(),
      ]);
      onClose(true);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm"
            onClick={() => onClose(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-surface/90 dark:bg-dark-surface/90 backdrop-blur-md rounded-2xl shadow-float border border-border dark:border-dark-border overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-dark-border">
              <div>
                <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100">
                  {existing ? "Update" : "Log"} Today's Health
                </h2>
                <p className="text-xs text-ink-400 mt-0.5">
                  Fill in what you have — all fields optional
                </p>
              </div>
              <button onClick={() => onClose(false)} className="btn-ghost p-2">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-hide">
              {error && (
                <div className="p-3 rounded-xl bg-heart/10 border border-heart/20 text-heart text-sm">
                  {error}
                </div>
              )}

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                {FIELDS.map(
                  ({ key, label, unit, placeholder, min, max, step }) => (
                    <div key={key}>
                      <label className="label">
                        {label} <span className="text-ink-300">({unit})</span>
                      </label>
                      <input
                        type="number"
                        className="input-field"
                        placeholder={placeholder}
                        min={min}
                        max={max}
                        step={step || 1}
                        value={form[key] ?? ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    </div>
                  ),
                )}

                {/* Blood Pressure */}
                <div className="col-span-2">
                  <label className="label">Blood Pressure (mmHg)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Systolic (120)"
                      value={bp.systolic}
                      onChange={(e) =>
                        setBp((b) => ({ ...b, systolic: e.target.value }))
                      }
                    />
                    <span className="text-ink-400 font-mono">/</span>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Diastolic (80)"
                      value={bp.diastolic}
                      onChange={(e) =>
                        setBp((b) => ({ ...b, diastolic: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Mood */}
              {/* Mood */}
              <div>
                <label className="label">
                  How are you feeling today?{" "}
                  <span className="text-primary normal-case font-normal">
                    (affects health score)
                  </span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          moodIndicator:
                            f.moodIndicator === m.value ? undefined : m.value,
                        }))
                      }
                      className={`px-3 py-2 rounded-xl text-sm border transition-all duration-150 active:scale-95
          ${
            form.moodIndicator === m.value
              ? "bg-primary text-white border-primary shadow-card"
              : "border-border dark:border-dark-border text-ink-600 dark:text-ink-400 hover:border-primary/50"
          }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Any observations about today..."
                  value={form.notes || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border dark:border-dark-border flex gap-3 justify-end">
              <button onClick={() => onClose(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {saving ? "Saving..." : "Save Record"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
