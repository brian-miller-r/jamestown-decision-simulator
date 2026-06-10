# Jamestown Decision Simulator
Jamestown Decision Simulator is an interactive social studies web app for Virginia SOL-aligned practice. Students make historical decisions, explain their reasoning, and receive coaching feedback. Teachers can create sessions, review class insights, and identify misconception-driven reteach priorities.

## Core functionality
- Student simulation with branching decisions and score impact across:
  - Survival readiness
  - Colony economy
  - Powhatan diplomacy
  - Governance stability
- AI-style feedback on student reasoning (local deterministic logic)
- Teacher dashboard with:
  - Class trends
  - Misconception summaries
  - Suggested reteach moves
- Optional reading-level suggestion workflow in teacher setup:
  - Paste writing, or upload `.txt`, `.docx`, `.pdf`
  - Local browser-side analysis (no external API)
- Optional press-and-hold voice dictation for student reasoning input (browser support varies)

## Tech stack
- React + TypeScript + Vite
- Tailwind CSS
- Lucide icons
- Local browser storage (`localStorage`) for sessions/results
- Mammoth (`.docx`) and PDF.js (`.pdf`) parsing for reading sample analysis

## Getting started
1. Install dependencies:
   - `npm install`
2. Start the dev server:
   - `npm run dev`
3. Open the local URL shown by Vite (typically `http://localhost:5173`)

## Available scripts
- `npm run dev` — start development server
- `npm run build` — production build
- `npm run preview` — preview production build locally
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript checks

## Demo and local data behavior
- Demo data is seeded on app load (`seedDemoData()`).
- Session/result data is stored locally in browser storage, not a backend.
- Default seeded demo session code is `JMS1607`.

## Important project files
- `src/App.tsx` — app shell, routing, responsive sidebar navigation
- `src/views/TeacherSetupView.tsx` — teacher setup + reading-level suggestion workflow
- `src/views/StudentSimView.tsx` — simulation flow, reasoning input, dictation control
- `src/views/TeacherDashboardView.tsx` — class insights and reteach recommendations
- `src/data/ai.ts` — local reasoning/debrief insight logic
- `src/data/readingLevel.ts` — local readability heuristics + document text extraction
- `src/data/store.ts` — localStorage persistence

## Known limitations
- Speech-to-text depends on browser/device Web Speech support and microphone permissions.
- PDF/DOCX extraction quality depends on source file formatting (scanned PDFs without OCR may extract poorly).
- Large parser bundles are lazy-loaded only when file analysis is used.
