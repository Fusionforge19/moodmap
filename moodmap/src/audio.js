/**
 * iTunes Search API integration for real commercial song metadata & 30-second audio previews.
 * Free, public, CORS-friendly, no API key required.
 *
 * Includes:
 *  - Content safety filter (blocks slurs/offensive labels before display)
 *  - Gemini-powered typo correction for Song search mode
 */
import { correctSearchQuery } from './gemini.js';

// ─── Content Safety Blocklist ────────────────────────────────────────────────
// Targeted blocklist of slurs and clearly offensive phrases.
// Using a small explicit set rather than a dependency so we ship zero extra bytes.
const BLOCKED_TERMS = [
  'retard', 'retards', 'retarded',
  'nigger', 'niggers', 'nigga', 'nigg',
  'faggot', 'faggots', 'fag',
  'kike', 'kikes',
  'spic', 'spics',
  'chink', 'chinks',
  'tranny', 'trannies',
  'cunt', 'cunts',
  'rape', 'raped',
  'molest',
];

/**
 * Returns true if any of the checked fields contain a blocked term.
 * Checks whole words only to avoid false positives on substrings.
 */
function isOffensive(track) {
  const fieldsToCheck = [
    track.songTitle || '',
    track.songArtist || '',
    track.albumName || '',
  ];
  const combined = fieldsToCheck.join(' ').toLowerCase();

  for (const term of BLOCKED_TERMS) {
    // Use word boundary matching where possible
    const pattern = new RegExp(`\\b${term}\\b`, 'i');
    if (pattern.test(combined)) {
      console.warn(`🚫 [Content Filter] Blocked track — matched term "${term}":`, track.songTitle, '/', track.albumName);
      return true;
    }
  }
  return false;
}

// ─── Core Search ──────────────────────────────────────────────────────────────
async function doSearch(term) {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=15`;
    console.log(`📡 [iTunes Fetching URL]: ${url}`);
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    const rawList = (data?.results || []).map((r) => ({
      trackId: r.trackId || Math.random(),
      songTitle: r.trackName,
      songArtist: r.artistName,
      previewUrl: r.previewUrl,
      artworkUrl: r.artworkUrl100 || r.artworkUrl60,
      albumName: r.collectionName,
    }));

    // Apply content safety filter first
    const safeList = rawList.filter((t) => !isOffensive(t));

    // Deduplicate by lowercase songTitle
    const uniqueList = [];
    const seenTitles = new Set();
    for (const track of safeList) {
      const titleKey = (track.songTitle || '').toLowerCase().trim();
      if (titleKey && !seenTitles.has(titleKey)) {
        seenTitles.add(titleKey);
        uniqueList.push(track);
      }
    }

    return uniqueList.slice(0, 5);
  } catch (err) {
    console.error('❌ [iTunes Fetch Error]:', err);
    return [];
  }
}

// ─── Mood-based Search (used from App after Gemini mood analysis) ─────────────
export async function searchiTunes(query, moodTag = '') {
  if (!query || !query.trim()) return [];
  const primaryTerm = query.trim();
  console.log(`🎵 [iTunes Search API] Primary Query: "${primaryTerm}" (moodTag: "${moodTag}")`);

  // Attempt 1: Primary search query from Gemini mood analysis
  let matches = await doSearch(primaryTerm);
  if (matches.length > 0) {
    console.log(`✅ [iTunes] Found ${matches.length} safe matches for "${primaryTerm}"`);
    return matches;
  }

  console.warn(`⚠️ [iTunes] 0 results for "${primaryTerm}". Retrying with mood tag...`);

  // Attempt 2: Mood tag fallback
  const retryTerm = moodTag ? `${moodTag} music` : 'chill music';
  matches = await doSearch(retryTerm);
  if (matches.length > 0) {
    console.log(`✅ [iTunes] Retry succeeded with ${matches.length} matches for "${retryTerm}"`);
    return matches;
  }

  // Attempt 3: Generic safe fallback
  console.warn(`⚠️ [iTunes] Attempting generic fallback: "acoustic chill"`);
  return await doSearch('acoustic chill');
}

// ─── Song Search Mode (with Gemini typo correction) ───────────────────────────
/**
 * Searches iTunes for a user-typed song query, correcting typos/partial names
 * via Gemini before hitting the API.
 * Returns { tracks, correctedQuery } so the UI can show "Showing results for '…'"
 */
export async function searchSongWithCorrection(rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return { tracks: [], correctedQuery: null };

  let correctedQuery = null;
  let effectiveQuery = rawQuery.trim();

  try {
    correctedQuery = await correctSearchQuery(rawQuery.trim());
    if (correctedQuery && correctedQuery.toLowerCase() !== rawQuery.trim().toLowerCase()) {
      console.log(`✨ [Gemini Query Correction] "${rawQuery}" → "${correctedQuery}"`);
      effectiveQuery = correctedQuery;
    } else {
      // No meaningful correction — don't show the "showing results for" banner
      correctedQuery = null;
    }
  } catch (err) {
    console.warn('⚠️ [Query Correction] Gemini correction failed, using raw query:', err);
    correctedQuery = null;
  }

  const tracks = await doSearch(effectiveQuery);
  return { tracks, correctedQuery };
}
