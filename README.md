# Nile Numbers — Primary 2 Egypt Math Adventure

**Nile Numbers (أرقام النيل)** is a bilingual (**English LTR / Arabic RTL**) interactive math learning game built for **Egyptian Primary 2 (Terms 1 & 2)**. Children practice all 12 core curriculum subjects through illustrated mini-games, hands-on interactive practice labs, a diagnostic Level Check exam, and an Egyptian Sticker Book & Cosmetic Gem Shop — guided by animated Nile companions **Sobek** and **Horus**.

## Features

- **12 Separated Math Subjects × 5 Progressive Levels (60 Levels)**:
  1. Place Value (H-T-O)
  2. Egyptian Money (LE)
  3. Vertical Addition & Subtraction (with step-by-step 2-digit and 3-digit regrouping)
  4. Arrays & Early Multiplication
  5. Analog & Digital Clocks
  6. Elapsed Time & Calendar
  7. Length & Rulers (cm / m)
  8. Liquid Capacity (mL / L)
  9. Mass & Balance Scales (g / kg)
  10. 2D & 3D Shapes
  11. Fractions
  12. Bar Graphs & Data
- **Fresh, Non-Repeating Questions**: Every round, Practice Quick Check, and Level Check auto-generates fresh problems and tracks shown question signatures in session + `localStorage` so children do not get repeating questions.
- **Placement & Comprehension Exam ("Level Check")**: 24 multiple-choice questions (2 per subject, easy → hard), combining visual models, bilingual word problems, and 3-choice *"Explain it"* comprehension items. Generates a parent-friendly printable HTML report, tracks the last 5 results with before/after comparisons, and unlocks recommended starting levels without ever lowering stars or mastery.
- **Interactive Practice Labs**: Visual sandboxes for all 12 subjects plus infinite Quick Checks.
- **Completed vs. Mastered Tracking**: Completing any level earns a Completed badge; Mastery requires ≥ 80% recent first-try accuracy across the last 3 attempts. Repeated mistake types unlock targeted 3-question mini-rounds.
- **Accessibility & Bilingual Support**: Full English (`ltr`) and Arabic (`rtl`) switching syncing `<html lang dir>`, localized ARIA labels, screen-reader descriptions for visual math models, Web Speech API *"Read aloud"* on every question, modal focus trapping with focus restoration, keyboard-safe shortcuts, and `prefers-reduced-motion` support.
- **Local-First Progress Safety**: Progress is stored **on this device only** in `localStorage` (no account or cloud sync required), with unfinished-level Resume and one-click JSON Backup / Restore for parents.

## Getting Started

### Prerequisites
- Node.js 20+ and npm 10+

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
The app runs at `http://localhost:3000`.

### Typecheck, Unit Tests, E2E Tests & Build
```bash
# TypeScript type-checking
npm run typecheck

# Unit tests (scoring, regrouping, deterministic question generators, placement exam)
npm test

# Production build (Vite with code-splitting & WebP assets)
npm run build

# Playwright end-to-end browser tests (requires Chromium: npx playwright install chromium)
npm run build && npm run test:e2e
```

## Project Structure

```text
├── .github/workflows/ci.yml        # GitHub Actions CI (install, typecheck, test, build)
├── index.html                      # Entry HTML
├── playwright.config.ts            # Playwright E2E configuration
├── tests/
│   └── e2e.spec.ts                 # Browser E2E tests (Pause, 390x844, RTL, Level Check)
└── src/
    ├── App.tsx                     # Root state, React.lazy code-splitting, HUD & routing
    ├── assets/images/              # Compressed WebP illustrated backdrops
    ├── components/
    │   ├── TitleScreen.tsx         # Home screen, Resume, Level Check, Backup/Restore
    │   ├── WorldMapScreen.tsx      # 12 subjects × 5 levels Game Section
    │   ├── PracticeMenuScreen.tsx  # Practice hub + Mastery Celebration
    │   ├── PracticeSubjectLab.tsx  # Interactive sandbox + Quick Check per subject
    │   ├── PlacementExamScreen.tsx # 24-question Level Check + Results + HTML Report
    │   ├── StickerBookScreen.tsx   # Curriculum stickers + cosmetic Nile Gem Shop
    │   ├── BazaarMiniGame.tsx      # Place Value & Egyptian Money mini-game
    │   ├── NileMiniGame.tsx        # Vertical Math (regrouping) & Arrays mini-game
    │   ├── ClockMiniGame.tsx       # Analog/Digital Clock & Calendar mini-game
    │   ├── WorkshopMeasureMiniGame.tsx # Length, Capacity, Mass, Shapes, Fractions, Graphs
    │   ├── WalkingCompanion.tsx    # Sobek & Horus guides with reactions & cosmetics
    │   ├── GameModals.tsx          # Pause & Round Summary modals
    │   ├── ReadAloudButton.tsx     # Web Speech API bilingual question reader
    │   ├── SectionNavHeader.tsx    # Top navigation bar
    │   └── EgyptSvgs.tsx           # Accessible Egyptian math SVG visuals
    ├── data/
    │   ├── egyptLevels.ts          # 60 levels + seeded question generators
    │   ├── placementExam.ts        # 24-question placement exam, scoring & HTML report
    │   ├── practiceSubjects.ts     # 12 practice labs + quick check generator
    │   ├── shopItems.ts            # Cosmetic outfits, accessories, trails & stickers
    │   └── i18n.ts                 # English & Arabic translations
    ├── hooks/
    │   ├── useModalFocusTrap.ts    # Accessible focus trap & focus restoration hook
    │   └── usePausableTimer.ts     # Pause-aware timer hook
    ├── types/game.ts               # Core TypeScript types
    └── utils/
        ├── scoring.ts              # Scoring reducer, mastery, resume & JSON backup/restore
        ├── regrouping.ts           # Multi-step carrying & borrowing helper (incl. across zero)
        ├── questionHistory.ts      # Session + localStorage no-repeat signature registry
        ├── speech.ts               # Bilingual Web Speech API helper
        ├── sound.ts                # Procedural Web Audio SFX & lofi music engine
        ├── scoring.test.ts         # Scoring & mastery unit tests
        ├── generators.test.ts      # Deterministic-seed generator invariant tests
        └── placementExam.test.ts   # Placement exam, report & backup migration tests
```
