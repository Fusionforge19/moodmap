import { motion, AnimatePresence } from 'framer-motion';

export default function MoodHistory({ history, onReplay, currentMoodId }) {
  if (!history || history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col items-center gap-2.5 w-full"
    >
      <p
        className="text-[11px] tracking-[0.2em] uppercase font-bold"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        Recent Moods
      </p>

      <div className="flex flex-wrap justify-center items-center gap-3 max-w-2xl px-2">
        <AnimatePresence>
          {history.map((item, index) => {
            const accent = item.palette?.[2] || item.palette?.[1] || '#a78bfa';
            const isActive = item.id === currentMoodId;
            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                onClick={() => onReplay(item)}
                whileHover={{ scale: 1.07, y: -2, boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 18px ${accent}55` }}
                whileTap={{ scale: 0.93 }}
                className="mood-chip group"
                style={{
                  background: `linear-gradient(135deg, ${item.palette?.[0] || '#1a1a2e'}ee, ${item.palette?.[1] || '#16213e'}cc)`,
                  border: isActive ? `1px solid ${accent}` : `1px solid ${accent}44`,
                  boxShadow: isActive
                    ? `0 4px 18px rgba(0,0,0,0.45), 0 0 18px ${accent}55, inset 0 0 8px ${accent}22`
                    : `0 4px 14px rgba(0,0,0,0.4)`,
                  outline: isActive ? `2px solid ${accent}44` : 'none',
                  outlineOffset: '2px',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                }}
              >
                {/* Color swatch dot */}
                <span
                  className="rounded-full flex-shrink-0"
                  style={{
                    width: '7px',
                    height: '7px',
                    background: accent,
                    boxShadow: `0 0 8px ${accent}`,
                  }}
                />
                <span style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: isActive ? 700 : 600 }}>
                  {item.mood_tag}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-full flex-shrink-0"
                    style={{ width: '5px', height: '5px', background: '#fff', opacity: 0.8 }}
                  />
                )}

                {/* Tooltip */}
                <span className="tooltip">
                  <strong style={{ color: accent }}>{item.music_vibe_name}</strong>
                  <br />
                  <span className="text-white/80">{item.caption?.slice(0, 90)}{item.caption?.length > 90 ? '…' : ''}</span>
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
