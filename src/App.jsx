import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { analyzeMood } from './gemini';
import { searchiTunes } from './audio';
import VisualScene from './components/VisualScene';
import MoodInput from './components/MoodInput';
import CaptionDisplay from './components/CaptionDisplay';
import MockMusicPlayer from './components/MockMusicPlayer';
import MoodHistory from './components/MoodHistory';
import SpecularButton from './components/SpecularButton';
import Toast from './components/Toast';

const STORAGE_KEY = 'moodmap_history';
const MAX_HISTORY = 6;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(history) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); }
  catch { console.warn('LocalStorage write failed'); }
}

export default function App() {
  const [currentMood, setCurrentMood] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [songMatches, setSongMatches] = useState([]);
  const [showSongDropdown, setShowSongDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(loadHistory);
  const [error, setError] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message });
    toastTimerRef.current = setTimeout(() => setToast({ visible: false, message: '' }), 2200);
  }, []);

  useEffect(() => { saveHistory(history); }, [history]);

  // Mood mode submit -> fresh analysis & iTunes search with history context & intensity
  const handleMoodSubmit = useCallback(async (text, intensity = 75) => {
    console.log('📥 [Step 1 - MoodInput Submit Captured]:', { text, intensity });

    if (!text || !text.trim()) return;
    const cleanInput = text.trim();

    setLoading(true);
    setError(null);
    setSelectedTrack(null);
    setSongMatches([]);
    setShowSongDropdown(false);

    const recentCaptions = history.slice(0, 3).map((h) => h.caption).filter(Boolean);

    try {
      const moodResult = await analyzeMood(cleanInput, recentCaptions, intensity);
      console.log('✅ [Step 3 - Fresh Mood Analysis Parsed]:', moodResult);

      const primaryQuery = moodResult.search_query || `${moodResult.mood_tag} music`;
      
      const matches = await searchiTunes(primaryQuery, moodResult.mood_tag);

      setSongMatches(matches);
      setShowSongDropdown(true);

      const entry = {
        ...moodResult,
        id: Date.now(),
        inputText: cleanInput,
        intensity,
        search_query: primaryQuery,
      };

      console.log('🎨 [Setting Fresh State in App]:', entry);
      setCurrentMood(entry);

      setHistory((prev) => {
        const filtered = prev.filter((h) => h.mood_tag !== entry.mood_tag);
        return [entry, ...filtered].slice(0, MAX_HISTORY);
      });
    } catch (err) {
      console.error('❌ [Mood Submission Error]:', err);
      setError('Something went wrong analyzing your mood. Try again.');
    } finally {
      setLoading(false);
    }
  }, [history]);

  // Track select from dropdown
  const handleTrackSelect = useCallback((track) => {
    console.log('🎵 [Track Selected]:', track);
    setSelectedTrack(track);
    setShowSongDropdown(false);
    if (track?.songTitle && track?.songArtist) {
      showToast(`Now vibing: ${track.songTitle} · ${track.songArtist}`);
    }
  }, [showToast]);

  const handleReplay = useCallback((item) => {
    console.log('🔄 [Replaying History Item]:', item);
    setCurrentMood(item);
    setSelectedTrack(item.selectedTrack || null);
  }, []);

  // Share Mood Card as PNG
  const handleShareMoodCard = useCallback(async () => {
    const node = document.getElementById('mood-card-export-target');
    if (!node) return;

    try {
      setIsSharing(true);
      const dataUrl = await toPng(node, {
        cacheBust: true,
        backgroundColor: '#0c0d14',
      });
      const link = document.createElement('a');
      link.download = `moodmap-${currentMood?.mood_tag || 'mood'}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export mood card image:', err);
    } finally {
      setIsSharing(false);
    }
  }, [currentMood]);

  const palette = currentMood?.palette;
  const accentColor = palette?.[2] || palette?.[1] || '#8b5cf6';

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: '#090A10',
      }}
    >
      {/* ── Accessibility: Skip to main input ──────────────── */}
      <a
        href="#mood-input-field"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:z-[9999] focus:px-5 focus:py-2.5 focus:rounded-full focus:text-sm focus:font-semibold focus:text-white focus:no-underline"
        style={{
          transform: 'translateX(-50%)',
          background: accentColor,
          boxShadow: `0 0 20px ${accentColor}88`,
        }}
      >
        Skip to input
      </a>

      {/* ── Toast notification ─────────────────────────────── */}
      <Toast message={toast.message} visible={toast.visible} />

      {/* ── Background visual scene ────────────────────────── */}
      <VisualScene palette={palette} loading={loading} />

      {/* ── Main Scrollable Page Layout ────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 24px',
        }}
      >
        {/* ── Centered Container with generous max-width (max-w-3xl) ── */}
        <div
          style={{
            width: '100%',
            maxWidth: '768px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >

          {/* ━━ BRAND IDENTITY HEADER (Understated, Editorial, Compact) ━━ */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full flex flex-col items-center justify-center pt-8 pb-1 cursor-default select-none"
          >
            <div className="flex items-center justify-center gap-2.5 mb-1.5">
              {/* Emotion Gradient Aura Circle with Harmonic Wave */}
              <motion.div
                animate={{
                  boxShadow: `0 0 16px ${accentColor}55, inset 0 0 10px ${accentColor}33`,
                  borderColor: `${accentColor}66`,
                }}
                transition={{ duration: 1.2 }}
                className="relative flex items-center justify-center rounded-full overflow-hidden"
                style={{
                  width: '24px',
                  height: '24px',
                  background: `radial-gradient(circle at 35% 35%, ${accentColor}99, #090A10 90%)`,
                  border: `1px solid ${accentColor}55`,
                }}
              >
                {/* Minimal Harmonic Sound/Emotion Wave SVG */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12h2a2 2 0 0 1 2-2 2 2 0 0 0 2-2V4" opacity="0.4" />
                  <path d="M6 12h2a2 2 0 0 0 2-2 2 2 0 0 1 2-2V4" opacity="0.7" />
                  <path d="M10 12c1.5-4 2.5-4 4 0s2.5 4 4 0" />
                  <path d="M18 12h4" opacity="0.4" />
                </svg>
              </motion.div>

              {/* Editorial Wordmark: 'mood' in medium sans + 'map' in delicate italic serif */}
              <div className="flex items-baseline tracking-tight">
                <span
                  style={{
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    fontSize: '18px',
                    fontWeight: 500,
                    letterSpacing: '-0.025em',
                    color: 'rgba(255, 255, 255, 0.95)',
                  }}
                >
                  mood
                </span>
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: 'italic',
                    fontSize: '19px',
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                    color: 'rgba(255, 255, 255, 0.65)',
                    marginLeft: '1px',
                  }}
                >
                  map
                </span>
              </div>
            </div>

            {/* Subtle Minimalist Tagline */}
            <p
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.3)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              ambient emotion space
            </p>
          </motion.header>

          {/* ━━ Centerpiece: Hero Caption & Player Section (Phase 4 hierarchy) ━━ */}
          <div
            style={{
              width: '100%',
              marginTop: '36px',
              marginBottom: '36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <AnimatePresence mode="wait">
              {!currentMood && !loading ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                  transition={{ duration: 0.5 }}
                  style={{ textAlign: 'center', padding: '64px 20px' }}
                >
                  <p
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontStyle: 'italic',
                      fontSize: '38px',
                      fontWeight: 500,
                      lineHeight: 1.3,
                      marginBottom: '16px',
                      background: 'linear-gradient(135deg, #ffffff 40%, rgba(255,255,255,0.5))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    What's on your mind?
                  </p>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto' }}>
                    Describe your feeling or search a song to transform your ambient world.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={currentMood ? `${currentMood.id}-${currentMood.mood_tag}` : 'loading-view'}
                  initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.98 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                  exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.98 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    width: '100%',
                  }}
                >
                  <CaptionDisplay
                    moodData={currentMood}
                    onShare={handleShareMoodCard}
                    isSharing={isSharing}
                  />
                  <MockMusicPlayer
                    moodData={currentMood}
                    palette={palette}
                    selectedTrack={selectedTrack}
                    songMatchesCount={songMatches.length}
                    SpecularButtonComponent={SpecularButton}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: '16px',
                    fontSize: '12px',
                    padding: '8px 18px',
                    borderRadius: '12px',
                    background: 'rgba(239,68,68,0.14)',
                    border: '1px solid rgba(239,68,68,0.28)',
                    color: 'rgba(252,165,165,0.9)',
                  }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* ━━ Utility Section: Input Bar + History (Generous spacing, compact & anchored) ━━ */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              paddingTop: '28px',
              paddingBottom: '56px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Input Bar */}
            <div className="w-full flex justify-center">
              <MoodInput
                onMoodSubmit={handleMoodSubmit}
                onTrackSelect={handleTrackSelect}
                loading={loading}
                accentColor={accentColor}
                songMatches={songMatches}
                showSongDropdown={showSongDropdown}
                onCloseDropdown={() => setShowSongDropdown(false)}
              />
            </div>

            {/* Recent Moods History */}
            <MoodHistory
              history={history}
              onReplay={handleReplay}
              currentMoodId={currentMood?.id}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
