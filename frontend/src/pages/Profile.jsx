import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, User } from 'lucide-react';
import { profileApi } from '../services';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { profile, refreshProfile, user } = useAuth();
  const [form, setForm] = useState({ name: '', age: '', gender: '', height: '', weight: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        name:   profile.name   || '',
        age:    profile.age    || '',
        gender: profile.gender || '',
        height: profile.height || '',
        weight: profile.weight || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess(false);
    try {
      await profileApi.update(form);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const bmi = form.height && form.weight
    ? Math.round((Number(form.weight) / Math.pow(Number(form.height) / 100, 2)) * 10) / 10
    : null;

  const bmiCategory = bmi
    ? bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese'
    : null;

  const recommendedWater = form.weight
    ? Math.round(Number(form.weight) * 0.033 * 10) / 10
    : null;

  return (
    <div className="px-6 py-6 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Profile</h1>
        <p className="text-sm text-ink-400 mt-0.5">{user?.email}</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-5">
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-2 card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100">Personal Information</h2>
              <p className="text-xs text-ink-400">Used to personalize your health insights</p>
            </div>
          </div>

          {error   && <div className="p-3 rounded-xl bg-heart/10 border border-heart/20 text-heart text-sm mb-4">{error}</div>}
          {success && <div className="p-3 rounded-xl bg-activity/10 border border-activity/20 text-activity text-sm mb-4">✓ Profile saved successfully!</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name</label>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Alex Rivera" />
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" className="input-field" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="28" min="1" max="120" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input-field" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" className="input-field" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} placeholder="172" min="50" max="300" />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" className="input-field" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="74" min="10" max="500" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary mt-5 flex items-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </motion.div>

        {/* Stats panel */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-ink-800 dark:text-ink-200 text-sm mb-3">Calculated Metrics</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-ink-400 mb-0.5">BMI</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold text-primary">{bmi ?? '—'}</span>
                  {bmiCategory && <span className="text-xs text-ink-500">{bmiCategory}</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-ink-400 mb-0.5">Recommended Water</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-2xl font-bold text-hydration">{recommendedWater ?? '—'}</span>
                  {recommendedWater && <span className="text-xs text-ink-400">L/day</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display font-semibold text-ink-800 dark:text-ink-200 text-sm mb-3">BMI Scale</h3>
            <div className="space-y-2">
              {[
                { label: 'Underweight', range: '< 18.5', color: 'bg-hydration' },
                { label: 'Normal',      range: '18.5–24.9', color: 'bg-activity' },
                { label: 'Overweight',  range: '25–29.9', color: 'bg-screen' },
                { label: 'Obese',       range: '≥ 30',     color: 'bg-heart' }
              ].map(({ label, range, color }) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bmiCategory === label ? 'bg-ink-100 dark:bg-dark-card ring-1 ring-primary' : ''}`}>
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-xs text-ink-700 dark:text-ink-300 font-medium">{label}</span>
                  <span className="text-xs text-ink-400 ml-auto">{range}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
