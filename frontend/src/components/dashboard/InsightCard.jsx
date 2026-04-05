import { motion } from 'framer-motion';

export default function InsightCard({ emoji, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="card p-4 hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-200 cursor-default"
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <h4 className="font-display font-semibold text-sm text-ink-900 dark:text-ink-100 mb-1">{title}</h4>
      <p className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
