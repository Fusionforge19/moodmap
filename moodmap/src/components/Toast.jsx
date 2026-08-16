import { AnimatePresence, motion } from 'framer-motion';

/**
 * Non-blocking, auto-dismissing toast notification.
 * Fixed to top-center. Fades in, holds, fades out.
 */
export default function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          key="song-toast"
          initial={{ opacity: 0, y: -12, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-4 left-1/2 z-50 pointer-events-none"
          style={{ transform: 'translateX(-50%)' }}
          role="status"
          aria-live="polite"
        >
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium"
            style={{
              background: 'rgba(10, 11, 18, 0.93)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset',
              color: 'rgba(255,255,255,0.9)',
              whiteSpace: 'nowrap',
              maxWidth: '90vw',
            }}
          >
            {/* Animated music note pulse */}
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: 1 }}
              style={{ fontSize: '14px' }}
            >
              🎵
            </motion.span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
