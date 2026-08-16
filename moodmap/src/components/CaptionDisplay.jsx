import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function CopyPillButton({ text, accentColor }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }, [text]);

  return (
    <motion.button
      onClick={handleCopy}
      whileHover={{ scale: 1.08, boxShadow: `0 0 14px ${accentColor}44` }}
      whileTap={{ scale: 0.91 }}
      title={copied ? 'Copied to clipboard!' : 'Copy caption text'}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider transition-all cursor-pointer"
      style={{
        background: copied ? `${accentColor}33` : 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${copied ? accentColor + '88' : 'rgba(255, 255, 255, 0.12)'}`,
        color: copied ? accentColor : 'rgba(255, 255, 255, 0.75)',
        boxShadow: copied ? `0 0 16px ${accentColor}44` : 'none',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.svg
            key="check"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.18 }}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        ) : (
          <motion.svg
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.15 }}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </motion.svg>
        )}
      </AnimatePresence>
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </motion.button>
  );
}

export default function CaptionDisplay({ moodData, onShare, isSharing }) {
  if (!moodData) return null;

  const accentColor = moodData.palette?.[2] || moodData.palette?.[1] || '#a78bfa';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={moodData.mood_tag + moodData.caption}
        initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="text-center w-full max-w-2xl mx-auto px-2"
      >
        {/* ── Action Bar: Mood Tag + Copy Button + Share Button (Zero text overlap) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center justify-center flex-wrap gap-2.5 mb-4"
        >
          {/* Mood tag pill */}
          <span
            id="mood-tag-badge"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.22em] uppercase transition-all"
            style={{
              background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}12)`,
              border: `1px solid ${accentColor}66`,
              color: accentColor,
              boxShadow: `0 0 20px ${accentColor}44, 0 0 35px ${accentColor}22, inset 0 1px 0 ${accentColor}33`,
              textShadow: `0 0 10px ${accentColor}99`,
            }}
          >
            <span
              className="rounded-full animate-pulse"
              style={{
                width: '6px', height: '6px',
                background: accentColor,
                boxShadow: `0 0 8px ${accentColor}`,
                display: 'inline-block',
              }}
            />
            {moodData.mood_tag}
          </span>

          {/* Copy Button (Clean pill next to Share button - 0% overlap with caption text) */}
          <CopyPillButton text={moodData.caption} accentColor={accentColor} />

          {/* Share Button */}
          {onShare && (
            <motion.button
              onClick={onShare}
              disabled={isSharing}
              whileHover={{ scale: 1.08, boxShadow: '0 0 14px rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.91 }}
              title="Download Shareable Mood Card (PNG)"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider text-white/70 hover:text-white transition-all cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {isSharing ? (
                <span className="text-[10px]">Generating...</span>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                  <span>Share</span>
                </>
              )}
            </motion.button>
          )}
        </motion.div>

        {/* ── Poetic caption card (Clean, unobstructed typography) ── */}
        <motion.div
          id="mood-card-export-target"
          className="relative rounded-2xl p-7 sm:p-8 text-left cursor-default"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: `0 16px 44px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 0 45px ${accentColor}18`,
          }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -2, boxShadow: `0 22px 50px rgba(0,0,0,0.6), 0 0 55px ${accentColor}28` }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Decorative quote glyph */}
          <span
            className="absolute select-none pointer-events-none"
            style={{
              top: '-12px', left: '22px',
              fontSize: '60px',
              color: `${accentColor}35`,
              fontFamily: "'Playfair Display', Georgia, serif",
              lineHeight: 1,
            }}
          >
            "
          </span>

          <p
            className="relative z-10"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '21px',
              lineHeight: '1.8',
              color: 'rgba(255, 255, 255, 0.95)',
              letterSpacing: '0.015em',
              textShadow: '0 2px 14px rgba(0,0,0,0.5)',
            }}
          >
            {moodData.caption}
          </p>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10 text-[12px] text-white/40">
            <span className="flex items-center gap-2">
              <span
                style={{
                  width: '7px', height: '7px',
                  borderRadius: '50%',
                  background: accentColor,
                  display: 'inline-block',
                  boxShadow: `0 0 8px ${accentColor}`,
                }}
              />
              <span className="font-medium text-white/70">{moodData.music_vibe_name || `${moodData.mood_tag} vibe`}</span>
            </span>
            <span className="tracking-widest uppercase text-[9px] text-white/30 font-semibold">MoodMap Echo</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
