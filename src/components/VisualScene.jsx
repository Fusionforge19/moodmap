import { motion, AnimatePresence } from 'framer-motion';

export default function VisualScene({ palette, loading }) {
  // Extract distinct colors from the active mood's palette
  const color1 = palette?.[0] || '#1e1b4b'; // Deep mood base (Orb 3 - Center/Mid-Left)
  const color2 = palette?.[1] || '#0284c7'; // Ambient mid tone (Orb 2 - Bottom-Right)
  const color3 = palette?.[2] || '#f43f5e'; // Vibrant accent highlight (Orb 1 - Top-Left)

  // Log active palette colors to console to confirm distinct hues per orb
  console.log('🎨 [VisualScene Active Palette Orbs]:', {
    orb1_topLeft_accent: color3,
    orb2_bottomRight_ambient: color2,
    orb3_centerLeft_base: color1,
  });

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#090A10]">
      {/* ── Dark Void Foundation (Visible in all negative space) ── */}
      <div className="absolute inset-0 bg-[#090A10]" />

      {/* ── 3 Distinct, Separated Glowing Ambient Orbs ────────── */}

      {/* Orb 1: Top-Left (Color 3 - Vibrant Accent) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '44vw',
          height: '44vw',
          maxWidth: '520px',
          maxHeight: '520px',
          top: '-8%',
          left: '-8%',
          filter: 'blur(90px)',
          opacity: 0.55,
          background: `radial-gradient(circle, ${color3}ee 0%, ${color3}77 45%, transparent 75%)`,
        }}
        animate={{
          background: `radial-gradient(circle, ${color3}ee 0%, ${color3}77 45%, transparent 75%)`,
          x: [0, 35, -20, 0],
          y: [0, -25, 35, 0],
          scale: [1, 1.12, 0.94, 1],
        }}
        transition={{
          background: { duration: 1.2, ease: 'easeInOut' },
          x: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* Orb 2: Bottom-Right (Color 2 - Ambient Mid Tone) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '42vw',
          height: '42vw',
          maxWidth: '480px',
          maxHeight: '480px',
          bottom: '-6%',
          right: '-6%',
          filter: 'blur(95px)',
          opacity: 0.5,
          background: `radial-gradient(circle, ${color2}ee 0%, ${color2}66 45%, transparent 75%)`,
        }}
        animate={{
          background: `radial-gradient(circle, ${color2}ee 0%, ${color2}66 45%, transparent 75%)`,
          x: [0, -40, 25, 0],
          y: [0, 30, -35, 0],
          scale: [1, 0.92, 1.15, 1],
        }}
        transition={{
          background: { duration: 1.2, ease: 'easeInOut' },
          x: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 22, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* Orb 3: Center-Left Floating Pocket (Color 1 - Deep Mood Base) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '36vw',
          height: '36vw',
          maxWidth: '420px',
          maxHeight: '420px',
          top: '38%',
          left: '18%',
          filter: 'blur(85px)',
          opacity: 0.42,
          background: `radial-gradient(circle, ${color1}ff 0%, ${color1}66 40%, transparent 75%)`,
        }}
        animate={{
          background: `radial-gradient(circle, ${color1}ff 0%, ${color1}66 40%, transparent 75%)`,
          x: [0, 30, -35, 0],
          y: [0, -20, 25, 0],
          scale: [1, 1.16, 0.88, 1],
        }}
        transition={{
          background: { duration: 1.2, ease: 'easeInOut' },
          x: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* ── Concentric Loading Wave Indicator ───────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading-ambient-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            {[280, 190, 110].map((size, i) => (
              <motion.div
                key={size}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  border: `2px solid ${color3}66`,
                  boxShadow: `0 0 40px ${color3}88, inset 0 0 20px ${color3}44`,
                }}
                animate={{
                  scale: [0.9, 1.3, 0.9],
                  opacity: [0.8, 0.15, 0.8],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
