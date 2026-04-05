import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { recordsApi } from '../services';
import AddRecordModal from '../components/modals/AddRecordModal';

const MOOD_BADGE = {
  great: 'bg-activity/10 text-activity',
  good:  'bg-hydration/10 text-hydration',
  okay:  'bg-primary/10 text-primary',
  low:   'bg-screen/10 text-screen',
  poor:  'bg-heart/10 text-heart'
};

const MOOD_EMOJI = { great: '😄', good: '🙂', okay: '😐', low: '😕', poor: '😞' };

export default function Records() {
  const [data, setData]           = useState({ records: [], total: 0, totalPages: 1 });
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [todayRecord, setToday]   = useState(null);
  const [modalOpen, setModal]     = useState(false);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const [rAll, rToday] = await Promise.allSettled([recordsApi.all(p), recordsApi.today()]);
      if (rAll.status === 'fulfilled') setData(rAll.value.data);
      if (rToday.status === 'fulfilled') setToday(rToday.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const handleClose = (saved) => { setModal(false); if (saved) load(1); };

  const cols = [
    { key: 'date',             label: 'Date',        render: r => format(new Date(r.date), 'MMM d, yyyy') },
    { key: 'heartRate',        label: 'HR (bpm)',     render: r => r.heartRate ?? '—' },
    { key: 'sleepHours',       label: 'Sleep (hrs)',  render: r => r.sleepHours ?? '—' },
    { key: 'stepCount',        label: 'Steps',        render: r => r.stepCount ? r.stepCount.toLocaleString() : '—' },
    { key: 'waterIntake',      label: 'Water (L)',    render: r => r.waterIntake ?? '—' },
    { key: 'exerciseDuration', label: 'Exercise (min)',render: r => r.exerciseDuration ?? '—' },
    { key: 'screenTime',       label: 'Screen (hrs)', render: r => r.screenTime ?? '—' },
    { key: 'bloodPressure',    label: 'BP',           render: r => r.bloodPressure?.systolic ? `${r.bloodPressure.systolic}/${r.bloodPressure.diastolic}` : '—' },
    { key: 'moodIndicator',    label: 'Mood',         render: r => r.moodIndicator ? (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${MOOD_BADGE[r.moodIndicator]}`}>
        {MOOD_EMOJI[r.moodIndicator]} {r.moodIndicator}
      </span>
    ) : '—' }
  ];

  return (
    <div className="px-6 py-6 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">Records</h1>
          <p className="text-sm text-ink-400 mt-0.5">{data.total} total entries</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> {todayRecord ? 'Update Today' : 'Log Today'}
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 shimmer border-b border-border dark:border-dark-border" />
            ))}
          </div>
        ) : data.records.length === 0 ? (
          <div className="p-12 text-center text-ink-400 text-sm">
            No records yet. <button onClick={() => setModal(true)} className="text-primary underline">Log your first entry →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border dark:border-dark-border bg-ink-50 dark:bg-dark-card">
                  {cols.map(c => (
                    <th key={c.key} className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.records.map((record, i) => (
                  <tr key={record._id} className={`border-b border-border dark:border-dark-border hover:bg-ink-50/50 dark:hover:bg-dark-card/50 transition-colors ${i % 2 === 0 ? '' : 'bg-ink-50/30 dark:bg-dark-card/20'}`}>
                    {cols.map(c => (
                      <td key={c.key} className="px-4 py-3 text-sm font-mono text-ink-700 dark:text-ink-300 whitespace-nowrap">
                        {c.render(record)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border dark:border-dark-border">
            <p className="text-xs text-ink-400">Page {page} of {data.totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost p-2 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="btn-ghost p-2 disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <AddRecordModal open={modalOpen} onClose={handleClose} existing={todayRecord} />
    </div>
  );
}
