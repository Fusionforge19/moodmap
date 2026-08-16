import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchiTunes, searchSongWithCorrection } from '../audio';

const FAVORITES_KEY = 'moodmap_favorite_songs';

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  } catch {
    console.warn('Failed to save favorites to localStorage');
  }
}

// Stagger variants for song list items
const listContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 8, x: 0 },
  show: { opacity: 1, y: 0, x: 0 },
};

export default function MoodInput({
  onMoodSubmit,
  onTrackSelect,
  loading,
  accentColor = '#8b5cf6',
  songMatches = [],
  showSongDropdown = false,
  onCloseDropdown,
}) {
  const [mode, setMode] = useState('mood');
  const [value, setValue] = useState('');
  const [intensity, setIntensity] = useState(75);
  const [isFocused, setIsFocused] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const [isSearchingSong, setIsSearchingSong] = useState(false);
  const [songModeMatches, setSongModeMatches] = useState([]);
  const [showSongModeDropdown, setShowSongModeDropdown] = useState(false);
  const [correctedQuery, setCorrectedQuery] = useState(null); // for "Showing results for…"
  const [favorites, setFavorites] = useState(loadFavorites);
  const [showFavoritesPanel, setShowFavoritesPanel] = useState(false);

  const inputRef = useRef(null);
  const glowColor = accentColor || '#8b5cf6';

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const toggleFavorite = (e, track) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.some((f) => f.trackId === track.trackId);
      return exists ? prev.filter((f) => f.trackId !== track.trackId) : [track, ...prev];
    });
  };

  const isFavorite = (trackId) => favorites.some((f) => f.trackId === trackId);

  const triggerShake = () => {
    setShakeInput(true);
    setTimeout(() => setShakeInput(false), 500);
  };

  const handleSubmit = async () => {
    if (!value.trim() || loading || isSearchingSong) return;

    if (mode === 'mood') {
      setShowSongModeDropdown(false);
      onMoodSubmit(value.trim(), intensity);
      setValue('');
    } else {
      if (onCloseDropdown) onCloseDropdown();
      setIsSearchingSong(true);
      setCorrectedQuery(null);

      const { tracks, correctedQuery: corrected } = await searchSongWithCorrection(value.trim());

      setSongModeMatches(tracks);
      setCorrectedQuery(corrected);
      setIsSearchingSong(false);

      if (tracks.length === 0) {
        triggerShake();
        setShowSongModeDropdown(false);
      } else {
        setShowSongModeDropdown(true);
      }
    }
  };

  const activeMatches = mode === 'mood' ? songMatches : songModeMatches;
  const isDropdownVisible = mode === 'mood' ? showSongDropdown : showSongModeDropdown;

  const handleTrackPick = (track) => {
    onTrackSelect(track);
    if (mode === 'mood') {
      if (onCloseDropdown) onCloseDropdown();
    } else {
      setShowSongModeDropdown(false);
    }
    setValue('');
  };

  const handleClose = () => {
    if (mode === 'mood') {
      if (onCloseDropdown) onCloseDropdown();
    } else {
      setShowSongModeDropdown(false);
      setCorrectedQuery(null);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center"
    >
      {/* ── Top Bar: Mode Toggle + Favorites Button ────────── */}
      <div className="flex items-center justify-between w-full px-2 mb-2.5">
        {/* Mode Pill Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full border border-white/10 backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {['mood', 'song'].map((m) => (
            <motion.button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                if (m === 'mood') setShowSongModeDropdown(false);
                else if (onCloseDropdown) onCloseDropdown();
                setCorrectedQuery(null);
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className="px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider transition-all duration-200"
              style={{
                background: mode === m
                  ? `linear-gradient(135deg, ${glowColor}cc, ${glowColor}77)`
                  : 'transparent',
                color: mode === m ? '#ffffff' : 'rgba(255,255,255,0.5)',
                boxShadow: mode === m ? `0 0 18px ${glowColor}55` : 'none',
                cursor: 'pointer',
              }}
            >
              {m === 'mood' ? '✨ Mood' : '🎵 Song'}
            </motion.button>
          ))}
        </div>

        {/* Favorites Toggle */}
        <motion.button
          type="button"
          onClick={() => setShowFavoritesPanel(!showFavoritesPanel)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
          style={{
            background: showFavoritesPanel ? `${glowColor}33` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${showFavoritesPanel ? glowColor + '88' : 'rgba(255,255,255,0.1)'}`,
            color: favorites.length > 0 ? '#fbbf24' : 'rgba(255,255,255,0.6)',
            boxShadow: showFavoritesPanel ? `0 0 16px ${glowColor}44` : 'none',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span>★</span>
          <span>Favorites ({favorites.length})</span>
        </motion.button>
      </div>

      {/* ── Collapsible Favorites Panel ─────────────────────── */}
      <AnimatePresence>
        {showFavoritesPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 10 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full overflow-hidden"
          >
            <div
              className="p-3 rounded-2xl border border-white/10 backdrop-blur-xl"
              style={{
                background: 'rgba(12, 13, 22, 0.94)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                maxHeight: '155px',
                overflowY: 'auto',
              }}
            >
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10 text-[10px] font-bold text-white/50 tracking-wider uppercase">
                <span>Saved Favorites</span>
                <span className="text-white/30">{favorites.length} saved</span>
              </div>
              {favorites.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-2.5">
                  Click ★ on any song match to save it here.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {favorites.map((fav) => (
                    <motion.div
                      key={fav.trackId}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)', x: 2 }}
                      onClick={() => handleTrackPick(fav)}
                      className="flex items-center justify-between p-1.5 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {fav.artworkUrl && (
                          <img src={fav.artworkUrl} alt={fav.songTitle} className="w-7 h-7 rounded-md object-cover flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{fav.songTitle}</p>
                          <p className="text-[10px] text-white/50 truncate">{fav.songArtist}</p>
                        </div>
                      </div>
                      <motion.button
                        type="button"
                        onClick={(e) => toggleFavorite(e, fav)}
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.85 }}
                        className="text-amber-400 text-xs px-2 py-0.5"
                      >
                        ★
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input Bar ───────────────────────────────────────── */}
      <motion.div
        animate={shakeInput ? {
          x: [-6, 6, -5, 5, -3, 3, 0],
          boxShadow: [null, '0 0 20px rgba(239,68,68,0.6)', '0 0 20px rgba(239,68,68,0.3)', 'none'],
        } : {}}
        transition={shakeInput ? { duration: 0.45 } : {}}
        className="flex items-center gap-2 p-1.5 pl-4 w-full transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: isFocused
            ? `1px solid ${glowColor}`
            : isDropdownVisible
            ? `1px solid ${glowColor}88`
            : '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '999px',
          boxShadow: isFocused
            ? `0 0 0 3px ${glowColor}33, 0 0 24px ${glowColor}44, inset 0 0 12px ${glowColor}11`
            : '0 6px 24px rgba(0,0,0,0.3)',
          transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
        }}
      >
        <span style={{ fontSize: '15px', flexShrink: 0, opacity: 0.7 }}>
          {mode === 'mood' ? '🌊' : '🔍'}
        </span>

        <input
          ref={inputRef}
          id="mood-input-field"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKey}
          placeholder={
            mode === 'mood'
              ? 'Describe your feeling (e.g. anxious before a presentation)...'
              : 'Search a song or artist (e.g. tampala loser)...'
          }
          disabled={loading || isSearchingSong}
          aria-label={mode === 'mood' ? 'Describe your current mood' : 'Search for a song or artist'}
          className="flex-1 bg-transparent text-white placeholder-white/30 text-sm focus:outline-none"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        />

        {/* Submit Button */}
        <motion.button
          id="mood-submit-button"
          onClick={handleSubmit}
          disabled={!value.trim() || loading || isSearchingSong}
          whileHover={value.trim() && !loading && !isSearchingSong ? { scale: 1.08 } : {}}
          whileTap={value.trim() && !loading && !isSearchingSong ? { scale: 0.92 } : {}}
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '999px',
            background: value.trim() && !loading && !isSearchingSong
              ? `linear-gradient(135deg, ${glowColor}ee, ${glowColor}99)`
              : 'rgba(255,255,255,0.07)',
            border: `1px solid ${value.trim() && !loading ? glowColor + '99' : 'rgba(255,255,255,0.15)'}`,
            cursor: value.trim() && !loading && !isSearchingSong ? 'pointer' : 'not-allowed',
            boxShadow: value.trim() && !loading && !isSearchingSong
              ? `0 0 20px ${glowColor}77, 0 0 40px ${glowColor}33`
              : 'none',
            color: 'white',
            transition: 'background 0.25s ease, box-shadow 0.25s ease',
          }}
        >
          {loading || isSearchingSong ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '16px', height: '16px',
                border: '2px solid rgba(255,255,255,0.25)',
                borderTopColor: 'white',
                borderRadius: '50%',
              }}
            />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </motion.button>
      </motion.div>

      {/* ── Mood Intensity Slider ───────────────────────────── */}
      {mode === 'mood' && (
        <div className="flex items-center justify-between w-full px-4 mt-1.5 text-[11px] text-white/40">
          <div className="flex items-center gap-2">
            <span>Intensity:</span>
            <input
              type="range"
              min="10"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-20 h-1 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: glowColor }}
            />
            <span style={{ color: glowColor, fontWeight: 600 }}>{intensity}%</span>
          </div>
          <span className="italic text-[10px] text-white/25">
            {intensity < 40 ? 'subtle' : intensity > 80 ? 'overwhelming' : 'deeply felt'}
          </span>
        </div>
      )}

      {/* ── Corrected Query Banner ─────────────────────────── */}
      <AnimatePresence>
        {correctedQuery && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full mt-1.5 px-1"
          >
            <p className="text-[11px] text-white/50 italic px-2">
              ✨ Showing results for <span className="font-semibold not-italic" style={{ color: glowColor }}>"{correctedQuery}"</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Zero-results feedback ─────────────────────────── */}
      <AnimatePresence>
        {!isDropdownVisible && !loading && !isSearchingSong && mode === 'song' && value === '' && songModeMatches.length === 0 && correctedQuery === null && (
          null
        )}
      </AnimatePresence>

      {/* ── Song Dropdown ────────────────────────────────── */}
      <AnimatePresence>
        {isDropdownVisible && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full mt-2.5"
            style={{
              background: 'rgba(10, 11, 18, 0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '18px',
              padding: '10px',
              boxShadow: `0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), 0 0 30px ${glowColor}11`,
              maxHeight: '230px',
              overflowY: 'auto',
            }}
          >
            <div className="flex items-center justify-between px-3 py-1 mb-1.5 border-b border-white/10">
              <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase">
                {mode === 'mood'
                  ? (activeMatches.length > 0 ? `Mood-Matched Songs (${activeMatches.length})` : 'Song Recommendations')
                  : (activeMatches.length > 0 ? `Matching Tracks (${activeMatches.length})` : 'Search Results')}
              </span>
              <motion.button
                type="button"
                onClick={handleClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-white/40 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </motion.button>
            </div>

            {activeMatches.length === 0 ? (
              <p className="text-xs text-white/50 p-3 text-center leading-relaxed">
                No matches found — try the <strong>Song</strong> tab or rephrase your search.
              </p>
            ) : (
              <motion.div
                variants={listContainerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-0.5"
              >
                {activeMatches.map((track) => {
                  const fav = isFavorite(track.trackId);
                  return (
                    <motion.div
                      key={track.trackId}
                      variants={listItemVariants}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.09)', x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTrackPick(track)}
                      className="flex items-center gap-3 p-2 rounded-xl cursor-pointer border border-transparent hover:border-white/8 transition-colors"
                      style={{ transition: 'background 0.15s ease, border-color 0.15s ease' }}
                    >
                      {track.artworkUrl ? (
                        <img
                          src={track.artworkUrl}
                          alt={track.songTitle}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-white/10 flex-shrink-0 flex items-center justify-center text-xs">🎵</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-white leading-tight">{track.songTitle}</p>
                        <p className="truncate text-[11px] text-white/50">{track.songArtist}</p>
                      </div>

                      {/* Favorite Toggle */}
                      <motion.button
                        type="button"
                        onClick={(e) => toggleFavorite(e, track)}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.8 }}
                        title={fav ? 'Remove from favorites' : 'Save to favorites'}
                        className="p-1 text-base transition-colors"
                        style={{ color: fav ? '#fbbf24' : 'rgba(255,255,255,0.25)' }}
                      >
                        ★
                      </motion.button>

                      <motion.span
                        whileHover={{ scale: 1.06 }}
                        style={{
                          fontSize: '10px',
                          color: glowColor,
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '6px',
                          background: `${glowColor}18`,
                          border: `1px solid ${glowColor}44`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Select
                      </motion.span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading hint */}
      <motion.p
        animate={{ opacity: loading || isSearchingSong ? 0.7 : 0 }}
        className="text-center mt-1.5 text-[11px] text-white/40 italic"
        style={{ pointerEvents: 'none' }}
      >
        {loading
          ? 'Analyzing emotion & searching iTunes...'
          : isSearchingSong
          ? 'Correcting query & searching iTunes...'
          : ''}
      </motion.p>
    </motion.div>
  );
}
