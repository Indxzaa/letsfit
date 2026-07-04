# LetsFit — Project Context

## Overview

LetsFit is a gamified fitness web application that motivates users to exercise through RPG mechanics: XP, FitCoins, achievements, boss battles, and an adventure world progression system. Users do real exercises (tracked via AI camera or manual input), earn rewards, and progress through themed worlds.

## Goals

- Make fitness engaging through game mechanics
- Provide AI-powered exercise detection via MediaPipe Pose
- Reward consistent effort (streak bonuses, daily missions)
- Build a social fitness experience (Workout Together, leaderboards — roadmap)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 (CSS-first config in globals.css) |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Charts | Recharts 3 |
| Auth + DB | Supabase (@supabase/supabase-js) |
| AI/CV | MediaPipe Tasks Vision (on-device pose detection) |
| Fonts | Archivo Black (display), Space Grotesk (body) via Google Fonts |

## Folder Architecture

```
app/                        Next.js App Router pages
  page.tsx                  Public landing page
  layout.tsx                Root layout (ThemeProvider, AuthProvider, fonts)
  globals.css               Design tokens + utility classes
  signin/                   Authentication pages
  signup/
  dashboard/                Main user hub (XP, stats, missions, streak)
  exercise/                 Exercise hub + 19 individual exercise routes
  adventure/                World Map + world journey pages
  boss/[id]/                Boss battle encounter
  shop/                     FitCoins cosmetics store
  progress/                 Stats, achievements, boss history, titles
  workout-together/         [NEW] Multiplayer co-workout feature (Phase 1: UI only)

components/                 Shared React components
  Navbar.tsx                Top navigation
  AuthProvider.tsx          Supabase auth context
  ThemeProvider.tsx         Dark/light mode context
  WorkoutComplete.tsx       Post-workout reward screen (neobrutalist)
  AIWorkoutSession.tsx      Camera + MediaPipe workout session
  BossHealthBar.tsx         Boss HP bar UI
  WorldAtmosphere.tsx       Adventure world CSS backgrounds
  ...

lib/                        Business logic and data
  progress.ts               Local progress store (XP, coins, streak, achievements)
  shop.ts                   Shop items, rarity config, accent themes
  worlds.ts                 World themes (Forest/Winter/Witch/Elven)
  stages.ts                 Stage definitions per world
  bosses.ts                 Boss data + TIER_CONFIG + BOSS_GAME_CONFIGS
  achievements.ts           Achievement definitions + unlock checks
  exercises.ts              Exercise metadata (name, slug, icon, MediaPipe config)
  exerciseDetectors.ts      Per-exercise rep counting logic

public/                     Static assets
  Boss 1-4.png              Boss artwork
  world-1..4-island.png     Adventure world floating island artwork
  world-1..4-bg.png         Adventure world background images
  forest/winter/witch/       Renamed PNG assets (canonical names)
  elven-island/background.png

docs/                       [NEW] Project documentation (read first)
```

## Existing Features

### Authentication
- Email/password sign-up and sign-in via Supabase
- Protected routes via `RequireAuth` component
- Auth state surfaced through `useAuth()` hook

### Dashboard
- XP level progress bar
- Daily mission cards (quest system)
- Streak tracker
- FitCoins balance
- Quick-access exercise cards
- Login calendar reward system

### AI Exercise Detection
- MediaPipe Pose Landmarker running on-device
- Per-exercise rep counting detectors in `lib/exerciseDetectors.ts`
- 19 supported exercises (squats, push-ups, jumping jacks, planks, etc.)
- Pose accuracy scoring (0–100%)
- Form feedback overlays

### Exercise Mode
- `/exercise` hub lists all exercises
- Each exercise has a dedicated page (`/exercise/[slug]`)
- `AIWorkoutSession` handles camera, AI model loading, rep counting, and completion
- `WorkoutComplete` shows rewards and stats on finish

### Adventure Mode
- 4 worlds: Forest Realm, Winter Kingdom, Witch Coven, Elven Sanctuary
- Each world has stages (exercise requirements) + a boss fight
- Worlds unlock sequentially via boss defeats
- Custom PNG island artwork + background images per world
- `app/adventure/page.tsx` = World Map (floating islands, S-curve path)
- `app/adventure/[world]/page.tsx` = Stage list (StageCard + BossCard)
- `localStorage('letsfit:lastWorld')` remembers last visited world

### Boss Battles
- `app/boss/[id]/page.tsx` handles the full boss fight loop
- Intro screen (boss info, relic selection) → battle (camera + AI) → victory/defeat
- Rounds system: multiple exercise requirements per boss
- Relics: pre-battle power-up selection
- HP damage tied to rep count + combo multiplier
- Boss attacks: warning phase → damage phase

### Shop
- FitCoins spent on cosmetics: avatars, borders, auras
- Items persist in `progress.unlockedItems` and `progress.equippedItems`
- `UserAvatar` component renders equipped cosmetics

### XP & FitCoins
- XP: earned per rep + session completion bonuses + streak bonuses
- FitCoins: earned per rep + boss rewards
- Level calculated from XP with logarithmic curve (`levelProgress()`)
- All stored in localStorage via `lib/progress.ts`

### Achievements & Titles
- ~40 achievements (rep milestones, streak milestones, boss defeats)
- Unlocked automatically via `checkAchievements()`
- Titles earned and equipped from the Progress page

### Progress Page
- Level hero card (XP bar, level number)
- Stat tiles (streak, sessions, reps, achievements)
- Boss Battles summary grid
- Titles section (equip/unequip)
- Achievement Wall (locked/unlocked states with progress bars)

### Neobrutalist UI Redesign
- All pages redesigned in the neobrutalist style (see DESIGN_SYSTEM.md)
- Thick borders, hard offset shadows, flat colors, bold typography
- Dark mode and light mode support via `[data-theme]` attribute
- Responsive on mobile and desktop

## Current Status

All core features are implemented and production-ready. The UI redesign pass is complete across:
- Home page, Dashboard, Exercise pages, Shop, Progress, Boss Battle
- Adventure Mode (World Map + Journey pages)
- Auth pages (sign-in, sign-up)
- WorkoutComplete reward screen

**Active work:** Workout Together (multiplayer Phase 1 — UI only, see MULTIPLAYER_ROADMAP.md)

## Roadmap

| Priority | Feature | Status |
|---|---|---|
| High | Workout Together UI (Phase 1) | In Progress |
| High | Workout Together backend (Phase 2) | Planned |
| Medium | Leaderboards | Planned |
| Medium | WebRTC camera sync (Phase 3) | Planned |
| Low | More exercise types | Planned |
| Low | Custom workout builder | Planned |
