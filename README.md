
# moodmap

**An emotion-driven ambient companion.** Describe how you feel, and moodmap turns it into a poetic reflection, a living color palette, and a real matching song — powered by Gemini and the iTunes Search API.

Show Image Show Image



## ✨ What it does

Type how you're feeling — anything from "anxious before a presentation" to a single word like "defiant" — and moodmap responds with:

- 🎨 **A dynamic color palette** that shifts the entire background to match your mood
- 📝 **A poetic caption**, freshly generated for what you typed — never generic, never repeated
- 🎵 **Real song matches** pulled live from the iTunes Search API, picked to fit the mood
- 🎚️ **An intensity slider** to fine-tune how strongly you're feeling it
- ⭐ **Favorites** to save songs you like, and a **history** of your recent moods
- 🔍 **Song search mode** — look up a specific song or artist directly

## 🖥️ Tech Stack

- **React** + **Vite**
- **Tailwind CSS**
- **Motion** (Framer Motion) for animation and micro-interactions
- **Gemini API** for mood analysis, caption generation, and search-term generation
- **iTunes Search API** for real song matching and 30-second previews
- **localStorage** for mood history and favorites (no backend, no database)

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.19.0 or ≥22.12.0)
- A Gemini API key ([get one here](https://ai.google.dev/))

### Installation

```bash
git clone https://github.com/Fusionforge19/moodmap.git
cd moodmap
npm install
```

Create a `.env.local` file in the project root:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

Then run the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Windows users:** if `npm run dev` fails with a PowerShell execution policy error, run this once:
>
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

## 📸 Screenshots

<div align="center">
  <img src="src/assets/hero.png" alt="moodmap mood input screen" width="800" />
  <p><em>mood input + ambient mood state</em></p>

  <img src="src/assets/hero.png" alt="moodmap generated mood result" width="800" />
  <p><em>generated reflection with music match</em></p>
</div>

## 🗂️ Project Structure

```
src/
  components/     # UI components (mood input, music player, caption card, etc.)
  lib/            # Gemini API calls, iTunes API wrapper, localStorage helpers
  App.jsx         # Root state and layout
  main.jsx
```

## 🔒 Privacy & Data

- No accounts, no backend, no server-side storage
- Mood history and favorites are stored only in your browser's localStorage
- Your Gemini API key stays local via `.env.local` (never committed — see `.gitignore`)

## 🛣️ Roadmap / Ideas

- Shareable mood cards (export as image)
- Dark/light theme toggle
- Deploy a live demo (Vercel/Netlify)

## 📄 License

MIT — feel free to fork, remix, or build on this.

---

Built as a personal project exploring how AI-generated language and real music data can turn a single sentence into a small, living experience.

