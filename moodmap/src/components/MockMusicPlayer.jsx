import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HalftoneReveal from './HalftoneReveal';

function EqBar({ animClass, accentColor, isPlaying, delay }) {
  return (
    <div
      className={isPlaying ? animClass : ''}
      style={{
        width: '4px',
        height: isPlaying ? undefined : '10px',
        minHeight: '8px',
        borderRadius: '3px',
        background: `linear-gradient(to top, ${accentColor}88, ${accentColor})`,
        boxShadow: `0 0 10px ${accentColor}88`,
        alignSelf: 'flex-end',
        animationDelay: delay,
        transition: 'height 0.3s ease',
      }}
    />
  );
}

export default function MockMusicPlayer({
  moodData,
  palette,
  selectedTrack,
  songMatchesCount,
  SpecularButtonComponent,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const accentColor = palette?.[2] || palette?.[1] || '#a78bfa';

  // Pause & reset playback when track changes
  useEffect(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [selectedTrack?.previewUrl, moodData?.music_vibe_name]);

  const togglePlay = () => {
    if (!audioRef.current || !selectedTrack?.previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio Playback error:', err);
          audioRef.current.load();
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    }
  };

  if (!moodData) return null;

  const hasSelectedTrack = Boolean(selectedTrack && selectedTrack.previewUrl);
  const displayTitle = hasSelectedTrack ? selectedTrack.songTitle : moodData.music_vibe_name;
  const displayArtist = hasSelectedTrack ? selectedTrack.songArtist : `${moodData.mood_tag} · curated vibe`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayTitle + (selectedTrack?.trackId || '')}
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.96 }}
        whileHover={{ y: -2, boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 50px ${accentColor}28` }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '24px 26px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '22px',
          boxShadow: `0 16px 44px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 45px ${accentColor}18`,
        }}
      >
        {/* Hidden HTML5 Audio Element */}
        {hasSelectedTrack && (
          <audio
            ref={audioRef}
            src={selectedTrack.previewUrl}
            onEnded={() => setIsPlaying(false)}
            preload="auto"
          />
        )}

        {/* ── Top row: Label + Equalizer ─────────────────── */}
        <div className="flex items-center justify-between mb-3.5">
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.45)',
              textTransform: 'uppercase',
            }}
          >
            NOW VIBING
          </span>

          {/* 4-bar CSS equalizer */}
          <div className="flex items-end gap-[3.5px]" style={{ height: '34px' }}>
            <EqBar animClass="eq-bar-1" accentColor={accentColor} isPlaying={isPlaying} delay="0s" />
            <EqBar animClass="eq-bar-2" accentColor={accentColor} isPlaying={isPlaying} delay="0.1s" />
            <EqBar animClass="eq-bar-3" accentColor={accentColor} isPlaying={isPlaying} delay="0.2s" />
            <EqBar animClass="eq-bar-4" accentColor={accentColor} isPlaying={isPlaying} delay="0.15s" />
          </div>
        </div>

        {/* ── Track Artwork + Title + Artist ───────────────── */}
        <div className="flex items-center gap-3.5 mb-4">
          {hasSelectedTrack && selectedTrack.artworkUrl ? (
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                boxShadow: `0 4px 18px ${accentColor}44`,
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <HalftoneReveal
                src={selectedTrack.artworkUrl.replace('100x100bb', '600x600bb')}
                inkColor={palette?.[0] || '#090A10'}
                paperColor={palette?.[2] || accentColor || '#a78bfa'}
                mode="duotone"
                trigger="hover"
                dotDensity={75}
                revealRadius={0.45}
                borderRadius="14px"
              />
            </div>
          ) : (
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${accentColor}55, ${accentColor}20)`,
                border: `1px solid ${accentColor}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
              }}
            >
              🎵
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              className="truncate"
              style={{
                fontSize: '17px',
                fontWeight: 700,
                lineHeight: '1.3',
                marginBottom: '3px',
                color: '#ffffff',
              }}
            >
              {displayTitle}
            </h3>
            <p className="truncate" style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
              {displayArtist}
            </p>
          </div>
        </div>

        {/* ── Song Pick Status Placeholder ─────────────────── */}
        {!hasSelectedTrack && (
          <div
            className="mb-3 text-center py-1.5 px-3 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px dashed ${accentColor}40`,
              fontSize: '11px',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {songMatchesCount > 0 ? (
              <span>🎵 {songMatchesCount} songs match this mood — select one below to preview</span>
            ) : (
              <span>✨ Select a song match below to listen</span>
            )}
          </div>
        )}

        {/* ── Progress bar ───────────────────────────────── */}
        <div
          style={{
            height: '3px',
            borderRadius: '99px',
            background: 'rgba(255,255,255,0.08)',
            marginBottom: '14px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            style={{
              height: '100%',
              borderRadius: '99px',
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}66)`,
              boxShadow: `0 0 8px ${accentColor}aa`,
            }}
            initial={{ width: '0%' }}
            animate={{ width: isPlaying ? '100%' : hasSelectedTrack ? '25%' : '0%' }}
            transition={{ duration: isPlaying ? 30 : 0.8, ease: 'linear' }}
          />
        </div>

        {/* ── Playback controls ──────────────────────────── */}
        <div className="flex items-center justify-center gap-6">
          <motion.button
            type="button"
            disabled
            whileHover={{ scale: 1.15, opacity: 0.5 }}
            style={{ background: 'none', border: 'none', cursor: 'default', color: 'rgba(255,255,255,0.3)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
            </svg>
          </motion.button>

          {/* Functional Play / Pause Button */}
          {SpecularButtonComponent ? (
            <div onClick={hasSelectedTrack ? togglePlay : undefined} className={hasSelectedTrack ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}>
              <SpecularButtonComponent
                size="md"
                radius={999}
                lineColor={palette?.[0] || accentColor}
                baseColor="#1a1a1a"
                intensity={1}
                followMouse={true}
                autoAnimate={false}
              >
                <div className="flex items-center justify-center w-10 h-10 text-white">
                  {isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </div>
              </SpecularButtonComponent>
            </div>
          ) : (
            <motion.button
              type="button"
              id="main-play-button"
              onClick={togglePlay}
              disabled={!hasSelectedTrack}
              whileHover={hasSelectedTrack ? { scale: 1.1 } : {}}
              whileTap={hasSelectedTrack ? { scale: 0.92 } : {}}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: hasSelectedTrack
                  ? `linear-gradient(135deg, ${accentColor}dd, ${accentColor}77)`
                  : 'rgba(255,255,255,0.08)',
                border: `1px solid ${hasSelectedTrack ? accentColor + '88' : 'rgba(255,255,255,0.12)'}`,
                boxShadow: hasSelectedTrack
                  ? `0 0 25px ${accentColor}66, 0 0 50px ${accentColor}33, inset 0 1px 0 rgba(255,255,255,0.3)`
                  : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: hasSelectedTrack ? 'pointer' : 'not-allowed',
                color: 'white',
                opacity: hasSelectedTrack ? 1 : 0.4,
                transition: 'all 0.3s ease',
              }}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </motion.button>
          )}

          <motion.button
            type="button"
            disabled
            whileHover={{ scale: 1.15, opacity: 0.5 }}
            style={{ background: 'none', border: 'none', cursor: 'default', color: 'rgba(255,255,255,0.3)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
