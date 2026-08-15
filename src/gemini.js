import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || (typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY : undefined);

// Deterministic hashing helper for unique fallback generation when API key is missing
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Color palettes for fallback generator (Multi-tone atmospheric trios)
const PALETTE_PRESETS = [
  ['#1e1b4b', '#6366f1', '#a855f7'], // Violet / Indigo
  ['#450a0a', '#dc2626', '#f43f5e'], // Crimson Flame
  ['#082f49', '#0284c7', '#38bdf8'], // Ocean Azure
  ['#78350f', '#d97706', '#f59e0b'], // Sunset Gold
  ['#064e3b', '#059669', '#10b981'], // Emerald Aurora
  ['#4a044e', '#c026d3', '#ec4899'], // Neon Fuchsia
  ['#1f2937', '#6b7280', '#cbd5e1'], // Mist / Slate
  ['#7c2d12', '#ea580c', '#fb923c'], // Solar Flare
];

// Smart Dynamic Fallback Generator with varied sentence structures & no repetitive clichés
export function getSmartMockResponse(text, intensity = 75) {
  const clean = (text || '').trim().toLowerCase();
  console.log(`⚡ [getSmartMockResponse] Generating dynamic mood for input: "${clean}" (intensity: ${intensity}%)`);

  // 1. Visceral / Animal / Filthy / Wild
  if (clean.match(/\b(animal|wild|filthy|beast|raw|savage|unleashed|feral|monster|carnal)\b/)) {
    const captions = [
      'Pure adrenaline overrides reason; blood hammers behind the eyes as unfiltered animal impulse commands the room.',
      'Strip away the polite veneer and what remains is predatory, electric, and unapologetically fierce.',
      'A ferocious spark catches in the dark — jagged, relentless, and refusing every restraint.',
    ];
    return {
      mood_tag: 'visceral',
      palette: ['#7c2d12', '#7e22ce', '#ff6b00'], // Rust + Deep Violet + Blazing Flame
      caption: captions[hashString(clean) % captions.length],
      music_vibe_name: 'Raw Heavy Distortion',
      search_query: 'raw grunge punk rock',
    };
  }

  // 2. Grief / Loss / Sorrow
  if (clean.match(/\b(grief|mourn|sorrow|loss|crying|pain|heartbreak|tears|devastated|mourning)\b/)) {
    const captions = [
      'The quiet room holds the sharp, hollow ache of absence — heavy with every word left unsaid.',
      'Grief sits in the chest like cold iron, remembering what was cherished before time pulled it away.',
      'A tender ache lingers in the silence, where memories softly trace the outlines of what used to be.',
    ];
    return {
      mood_tag: 'mournful',
      palette: ['#1e1b4b', '#0891b2', '#818cf8'], // Deep Indigo + Cyan + Periwinkle
      caption: captions[hashString(clean) % captions.length],
      music_vibe_name: 'Solitary Echoes',
      search_query: 'sad solitary cello acoustic',
    };
  }

  // 3. Joy / Celebration / Ecstatic
  if (clean.match(/\b(joy|joyful|celebration|party|dance|happy|ecstatic|cheer|vibrant|euphoria|celebrate)\b/)) {
    const captions = [
      'Laughter erupts into neon spark, radiating an infectious kinetic warmth that demands movement.',
      'Every nerve endings hums with radiant gratitude — golden, unrestrained, and overflowing with light.',
      'A rush of pure momentum lifts everything off the ground in spontaneous triumph.',
    ];
    return {
      mood_tag: 'ecstatic',
      palette: ['#4a044e', '#0284c7', '#f43f5e'], // Neon Magenta + Azure + Electric Coral
      caption: captions[hashString(clean) % captions.length],
      music_vibe_name: 'Neon Euphoria Surge',
      search_query: 'euphoric celebratory dance pop',
    };
  }

  // 4. Anxious / Presentation / Nervous / Overwhelmed
  if (clean.match(/\b(anxious|scared|nervous|stress|panic|overwhelmed|worry|fear|presentation|deadline)\b/)) {
    const captions = [
      'Rapid heartbeats sync to a ticking countdown as the spotlight sharpens every nerve before taking the leap.',
      'Static crackles between racing thoughts — breathe, find your center, and step directly into the heat.',
      'The tension in the air is palpable, humming with high-stakes anticipation on the brink of action.',
    ];
    return {
      mood_tag: 'frenetic',
      palette: ['#082f49', '#7c3aed', '#38bdf8'], // Dark Cyan + Electric Violet + Sky Blue
      caption: captions[hashString(clean) % captions.length],
      music_vibe_name: 'High Tension Pulse',
      search_query: 'tense ambient electronic pulse',
    };
  }

  // 5. Loser / Defeat / Sadness / Crestfallen
  if (clean.match(/\b(loser|sad|defeat|fail|useless|broken|lonely|hurt|down|hopeless|depressed|gloom)\b/)) {
    const captions = [
      'The scoreboard is harsh, but bruised knuckles and bruised pride carry their own underground grit.',
      'In the quiet aftermath of a heavy blow, resilience takes root where expectations fell away.',
      'Washed out and worn down, yet an unmistakable pulse of defiance whispers underneath the dust.',
    ];
    return {
      mood_tag: 'crestfallen',
      palette: ['#1e293b', '#6366f1', '#94a3b8'], // Deep Slate + Indigo Accent + Cool Silver
      caption: captions[hashString(clean) % captions.length],
      music_vibe_name: 'Underground Grit',
      search_query: 'crestfallen moody indie rock',
    };
  }

  // 6. Anger / Rage / Tempestuous
  if (clean.match(/\b(angry|furious|mad|rage|frustrated|hate|annoyed|storm|fire|wrath)\b/)) {
    const captions = [
      'Molten pressure builds against the walls — a sharp, incandescent refusal to stay quiet.',
      'A searing conviction ignites, turning frustration into sheer explosive momentum.',
      'Sharp edges and fierce heat: no diplomacy, just direct uncompromising force.',
    ];
    return {
      mood_tag: 'tempestuous',
      palette: ['#450a0a', '#9333ea', '#f87171'], // Crimson + Electric Purple + Fiery Rose
      caption: captions[hashString(clean) % captions.length],
      music_vibe_name: 'Crimson Fury',
      search_query: 'furious heavy metal rock',
    };
  }

  // 7. Calm / Zen / Tranquil
  if (clean.match(/\b(calm|peace|chill|relax|sleep|still|quiet|zen|serene)\b/)) {
    const captions = [
      'The noise of the day dissolves into velvet silence, leaving space to simply exist without friction.',
      'A deep exhale unknots the shoulders, drifting into smooth effortless equilibrium.',
      'Stillness settles like dusk in an empty sanctuary — uncluttered, cool, and whole.',
    ];
    return {
      mood_tag: 'tranquil',
      palette: ['#064e3b', '#0284c7', '#34d399'], // Emerald + Ocean Cyan + Mint Glow
      caption: captions[hashString(clean) % captions.length],
      music_vibe_name: 'Velvet Horizon',
      search_query: 'tranquil ambient lofi chill',
    };
  }

  // 8. Nostalgic / Past / Memory
  if (clean.match(/\b(nostalgic|reminisce|past|memory|old|amber|retro|vintage)\b/)) {
    const captions = [
      'A familiar cadence spins backwards in time, unlocking sunlit rooms you haven\'t visited in years.',
      'Faded polaroid tones resurface with bittersweet clarity, humming with songs from a different lifetime.',
      'The gentle gravity of the past pulls you in, wrapped in warm sepia tape hiss.',
    ];
    return {
      mood_tag: 'nostalgic',
      palette: ['#78350f', '#0d9488', '#fbbf24'], // Amber + Vintage Teal + Golden Sun
      caption: captions[hashString(clean) % captions.length],
      music_vibe_name: 'Amber Retrospective',
      search_query: 'nostalgic retro dream folk',
    };
  }

  // Dynamic hash-based fallback with dedicated multi-hue palettes per mood tag
  const hash = hashString(clean);
  const DYNAMIC_MOOD_CONFIGS = [
    { tag: 'hypnotic', palette: ['#0f172a', '#7c3aed', '#06b6d4'] }, // Midnight + Violet + Cyan
    { tag: 'contemplative', palette: ['#1e1b4b', '#0284c7', '#f59e0b'] }, // Indigo + Azure + Amber
    { tag: 'ethereal', palette: ['#2e1065', '#06b6d4', '#f43f5e'] }, // Purple + Cyan + Rose
    { tag: 'restless', palette: ['#450a0a', '#ea580c', '#38bdf8'] }, // Crimson + Orange + Sky Blue
    { tag: 'wistful', palette: ['#1e293b', '#a855f7', '#fb7185'] }, // Slate + Purple + Coral
    { tag: 'reverent', palette: ['#1c1917', '#d97706', '#34d399'] }, // Obsidian + Gold + Emerald
    { tag: 'kinetic', palette: ['#7f1d1d', '#9333ea', '#facc15'] }, // Ruby + Violet + Yellow
    { tag: 'defiant', palette: ['#3b0764', '#ea580c', '#38bdf8'] }, // Violet + Orange + Cyan
  ];

  const selectedConfig = DYNAMIC_MOOD_CONFIGS[hash % DYNAMIC_MOOD_CONFIGS.length];
  const mood_tag = selectedConfig.tag;
  const palette = selectedConfig.palette;
  const music_vibe_name = `${clean.charAt(0).toUpperCase() + clean.slice(1)} Resonance`;
  const search_query = `${clean} ${mood_tag} music`;

  const dynamicCaptions = [
    `The feeling of "${clean}" strikes a ${mood_tag} chord with ${intensity}% resonance, sharp and distinct.`,
    `A singular pulse of "${clean}" unfolds with unmistakable ${mood_tag} presence in the stillness.`,
    `Reflecting on "${clean}" creates a vivid, ${mood_tag} atmosphere that lingers in the air.`,
  ];

  return {
    mood_tag,
    palette,
    caption: dynamicCaptions[hash % dynamicCaptions.length],
    music_vibe_name,
    search_query,
  };
}

const responseSchema = {
  type: 'object',
  properties: {
    mood_tag: {
      type: 'string',
      description: 'Single evocative lowercase word accurately capturing the EXACT emotion (e.g. visceral, frenetic, mournful, ecstatic, crestfallen, tempestuous, tranquil, nostalgic, luminous, hypnotic).',
    },
    palette: {
      type: 'array',
      description: 'Array of exactly 3 DISTINCT, harmoniously complementary hex colors [deep_base, ambient_mid, vibrant_accent] (e.g. ["#0f172a", "#7c3aed", "#06b6d4"] or ["#450a0a", "#d97706", "#38bdf8"]) showcasing multi-color depth rather than a single monochromatic tint.',
      items: { type: 'string' },
    },
    caption: {
      type: 'string',
      description: 'A 1-2 sentence deeply poetic, journaling-style reflection tailored to the specific nuance of the input.',
    },
    music_vibe_name: {
      type: 'string',
      description: 'A 2-4 word curated playlist title reflecting the mood.',
    },
    search_query: {
      type: 'string',
      description: 'A 2-3 word search query combining a SPECIFIC mood adjective AND a musical genre/style for iTunes API search (e.g. "raw grunge rock", "euphoric dance pop", "solitary sad cello", "tense electronic pulse").',
    },
  },
  required: ['mood_tag', 'palette', 'caption', 'music_vibe_name', 'search_query'],
};

export async function analyzeMood(text, recentCaptions = [], intensity = 75) {
  const isKeyValid = API_KEY && API_KEY !== 'your_gemini_api_key_here';

  if (!isKeyValid) {
    console.warn(
      '⚠️ [MoodMap Fallback Mode] VITE_GEMINI_API_KEY is missing or default. Using Dynamic Smart Generator for:',
      { text, intensity }
    );
    await new Promise((r) => setTimeout(r, 350));
    return getSmartMockResponse(text, intensity);
  }

  console.log('🚀 [analyzeMood Called for]:', { text, intensity, recentCaptionsCount: recentCaptions.length });

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.95, // High creative variance for poetic reflections
      },
    });

    const recentCaptionsContext = recentCaptions.length > 0
      ? `\nRecent captions previously generated:\n${recentCaptions.map((c, i) => `${i + 1}. "${c}"`).join('\n')}\nCRITICAL: Avoid repeating similar phrasing, imagery, or grammatical structures to these recent captions.`
      : '';

    const prompt = `CRITICAL INSTRUCTION: Analyze the emotional tone and specific nuance of this user input, and generate an aesthetic JSON reflection with a tailored iTunes search query.

User Input: "${text}"
Emotional Intensity: ${intensity}% (where 10% is understated/subtle and 100% is intense/overwhelming)
${recentCaptionsContext}

Poetic & Aesthetic Rules:
1. mood_tag: Return a single specific lowercase word that directly reflects the emotional texture (e.g., "visceral", "frenetic", "mournful", "ecstatic", "crestfallen", "tempestuous", "tranquil", "nostalgic"). Never default to generic tags like "reflective" or "chill" unless explicitly calm.
2. caption:
   - Reflect the SPECIFIC emotional nuance of the user input with genuine depth.
   - AVOID generic nature-imagery clichés (like "fog over mountains", "waves crashing on dark shores", "misty tides", "autumn leaves") unless the input directly invokes nature.
   - Vary sentence structure and imagery dynamically across different feelings — use punchy fragments, visceral physical sensations, urban or tactile metaphors, or introspective journal cadence.
   - Calibrate the tone to the ${intensity}% intensity.
3. palette: Return 3 atmospheric hex colors [dark_background, medium_ambient, vibrant_accent] that visually embody this mood.
4. music_vibe_name: 2-4 word curated playlist vibe title.
5. search_query: 2-3 words combining a SPECIFIC mood adjective AND a musical genre (e.g. "raw grunge rock", "euphoric dance pop", "solitary cello acoustic", "tense electronic pulse", "furious metal rock").`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const parsed = JSON.parse(response.text());

    if (!parsed.palette || parsed.palette.length < 3) {
      parsed.palette = ['#1a1a2e', '#16213e', '#7c3aed'];
    }

    console.log('📦 [Gemini Mood Analysis Output for "' + text + '"]:', parsed);
    return parsed;
  } catch (error) {
    console.error('❌ [Gemini API Error] Falling back to Smart Dynamic Generator:', error);
    return getSmartMockResponse(text, intensity);
  }
}

/**
 * Corrects a potentially typo'd or partial song/artist search query using Gemini.
 * Returns the corrected search term string (or the original if no correction needed).
 * Falls back to the original query if the API is unavailable.
 */
export async function correctSearchQuery(rawQuery) {
  const isKeyValid = API_KEY && API_KEY !== 'your_gemini_api_key_here';
  if (!isKeyValid) return rawQuery;

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1, // Low temperature — we want one confident correction
        maxOutputTokens: 40,
      },
    });

    const prompt = `The user typed "${rawQuery}" into a music search box — this may contain typos, misspellings, or be a partial/rough match to a real song or artist name. Correct it to the most likely intended real song or artist search term. Return ONLY the corrected search term text, nothing else. No quotes, no explanation.`;

    const result = await model.generateContent(prompt);
    const corrected = result.response.text().trim().replace(/^["']|["']$/g, '');
    return corrected || rawQuery;
  } catch (err) {
    console.warn('⚠️ [Gemini Query Correction] Failed, using original query:', err);
    return rawQuery;
  }
}
