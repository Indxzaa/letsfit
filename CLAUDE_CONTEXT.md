LetsFit — Session Handoff Summary
1. Project Overview
LetsFit is a gamified fitness web application that motivates users through RPG mechanics: XP, FitCoins, achievements, boss battles, and an adventure world progression system. Users perform real exercises tracked via AI camera (MediaPipe Pose), earn rewards, and progress through themed worlds.

Stack: Next.js 16(App Router) · React 19 · TypeScript · Supabase (auth + DB + Realtime) · MediaPipe Tasks Vision · Framer Motion · Tailwind CSS v4 · Lucide React

2. Current State
Just completed
All phases of the Workout Together multiplayer feature (Phases 1–6.1):

Phase 1 — UI/mock pages (landing, lobby, exercise select, countdown, session, results)
Phase 2 — Supabase room system (create/join rooms, RLS, room codes)
Phase 3 — Realtime lobby sync (ready state, exercise/duration selection, host controls)
Phase 4 — WebRTC peer-to-peer video (STUN, Supabase broadcast signaling)
Phase 5 — Synchronized workout sessions (host-authoritative countdown + timing)
Phase 6 — Local MediaPipe detection + rep sync (each device runs AI independently, only rep counts synced)
Phase 6patches — Round-based system, open-ended sessions, exit confirmation, media toggle fixes
Phase 6.1 — Sync stability + UX polish (duplicate overlay fix, double-tap guard, co-op feedback strip, shake countdown, auto-resolve on disconnect)
Very next step
The multiplayer system is feature-complete through Phase 6.1. Remaining roadmap items (from docs/MULTIPLAYER_ROADMAP.md):

Phase 7 (future): XP/coins rewards for multiplayer sessions
Phase 8 (future): Leaderboards
The Adventure Mode and all solo features are fully approved and production-ready.

3. File Map & Responsibilities
Core App Routes
File	Role
app/page.tsx	Public landing page (Home)
app/dashboard/page.tsx	Main hub — XP bar, missions, streak, Workout Together promo card
app/exercise/page.tsx	Exercise catalog
app/exercise/[slug]/page.tsx	Individual exercise page (AI session wrapper)
app/adventure/page.tsx	World Map — floating island SVGs, S-curve path, localStorage lastWorld redirect
app/adventure/[world]/page.tsx	Adventure Journey — StageCard + BossCard components
app/boss/[id]/page.tsx	Full boss fight loop (intro → battle → victory/defeat)
app/shop/page.tsx	FitCoins cosmetics store (avatars, borders, auras)
app/progress/page.tsx	Stats, achievements, boss history, titles
app/signin/page.tsx · app/signup/page.tsx	Auth pages (both use AuthForm)
app/workout-together/page.tsx	Multiplayer landing (Create Room / Join Room)
app/workout-together/lobby/page.tsx	Shared lobby — Realtime players, ready state, host exercise picker
app/workout-together/session/page.tsx	Live workout session — WebRTC cameras, MediaPipe detection, round system
Multiplayer Library
File	Role
lib/multiplayer/types.ts	Shared TS types (Room, Player, WorkoutResult, etc.)
lib/multiplayer/constants.ts	MULTIPLAYER_EXERCISES, EXERCISE_LABELS, XP/COINS per rep, MOCK_ROOM_CODE
lib/multiplayer/mock.ts	Phase 1 mock helpers (generateRoomCode, computeResult, etc.)
lib/multiplayer/db.ts	Raw Supabase queries (insert/get/update/delete rooms + room_players)
lib/multiplayer/service.ts	Business logic: createRoom, joinRoom, leaveRoom, setReady, updateRoomSettings, startWorkout
lib/multiplayer/hooks.ts	useLobby() hook — loads room + players, subscribes to Realtime channel lobby:{roomId}
lib/multiplayer/workoutSession.ts	Session event types + Supabase broadcast helpers for workout sync (workout_session:{roomId})
lib/multiplayer/useWorkoutSession.ts	React hook — round state, countdown, pause/resume, signalRoundFinished, hostStartCountdown
lib/multiplayer/workout-sync.ts	Rep-only sync types + broadcast helpers (workout_sync:{roomId})
lib/multiplayer/webrtc.ts	Pure WebRTC utils — RTC_CONFIG (STUN servers), getLocalMedia, createPeer, addTracks
lib/multiplayer/signaling.ts	Supabase broadcast signaling for WebRTC (offer/answer/ICE/leave via signaling:{roomId})
lib/multiplayer/useWebRTC.ts	React hook — full WebRTC lifecycle (media, peer connection, toggleMute, toggleVideo, hangUp)
hooks/multiplayer/useMultiplayerWorkoutSync.ts	Runs MediaPipe locally, counts reps, syncs only rep count via broadcast (200ms throttle)
Key Components
File	Role
components/AuthForm.tsx	Sign-in / sign-up form (neobrutalist split-screen layout)
components/AIWorkoutSession.tsx	Solo exercise session — camera, MediaPipe, rep counting, completion screen
components/WorkoutComplete.tsx	Post-workout reward screen (ConfettiBurst + neobrutalist stats)
components/WorldAtmosphere.tsx	Per-world CSS background effects (forest, winter, witch, elven)
components/BossHealthBar.tsx	Boss HP bar UI
components/Navbar.tsx	Fixed top navigation
Business Logic Libraries
File	Role
lib/progress.ts	localStorage progress store — XP, FitCoins, streak, achievements, equipped items
lib/exercises.ts	Exercise metadata (slug, name, isTimed, hasAiDetection, targets, etc.)
lib/exerciseDetectors.ts	Per-exercise rep counting detectors (factory: getDetectorForSlug(slug)) + drawSkeleton
lib/worlds.ts	World themes — primary color, introBg, islandImg, bgImg per world
lib/stages.ts	Stage definitions per world (exercise, reps, boss linkage)
lib/bosses.ts	Boss data, TIER_CONFIG, BOSS_GAME_CONFIGS (image paths)
lib/shop.ts	SHOP_ITEMS, RARITY_CONFIG
lib/achievements.ts	Achievement definitions + unlock checks
lib/supabase.ts	getSupabase() lazy singleton (returns null if not configured or SSR)
Documentation
File	Role
CLAUDE.md	Agent instructions + page terminology (Journey≠ Progress Dashboard) + git workflow
docs/README.md	Documentation index — read first every session
docs/PROJECT_CONTEXT.md	Full project overview, tech stack, feature list
docs/DESIGN_SYSTEM.md	Neobrutalist design reference — CSS vars, classes, patterns, readability rules
docs/MULTIPLAYER_ROADMAP.md	Phase1→8 roadmap, Supabase schema, WebRTC constraints
supabase/migrations/001_multiplayer_rooms.sql	SQL to run in Supabase dashboard — creates rooms + room_players tables with RLS
4. Key Decisions
Design System
Neobrutalism throughout — 3px solid #111 borders, 4px 4px 0 #111 hard shadows, border-radius: 0, flat colors only. No gradients, no blur, no glassmorphism.
--neo-accent: #16A34A (green) is the primary accent. Dark mode inverts --neo-black/--neo-white automatically via [data-theme="dark"].
Never use rgba(x,x,x,<0.8) for important text — readability rule enforced across all pages.
Adventure Mode
localStorage('letsfit:lastWorld') — set on every world visit; /adventure redirects there on load. Cleared only when user explicitly clicks "Back to World Map" in the exit dialog.
World islands are PNG files in public/ with transparent backgrounds (flood-fill removed via sharp). Names: forest-island.png, winter-island.png, witch-island.png, elven-island.png.
World backgrounds: forest-background.png, etc. — used as position: fixed; object-fit: cover behind Journey pages.
Multiplayer Architecture
Supabase is signaling-only for WebRTC — SDP offers/answers and ICE candidates travel via ephemeral broadcast events, never written to DB.
Three separate Realtime channels per room:
lobby:{roomId} — player join/leave/ready (postgres_changes on room_players + rooms)
workout_session:{roomId} — countdown, start, pause, resume, round_finish, round_complete
workout_sync:{roomId} — rep count broadcast (throttled at 200ms, only on change)
signaling:{roomId} — WebRTC signaling
Host-authoritative timing — host embeds startedAt timestamp; guests compute elapsed from Date.now() - startedAt.
Round system — session is infinite; a round ends when BOTH players click "Finish Round." Host sees exercise picker after each round; guest waits. No auto-end based on rep count or time.
Each device runs its own MediaPipe — no pose data is ever transmitted. Only { repCount, exerciseState, finishFlag } are synced.
resetReps() in useMultiplayerWorkoutSync also resets partnerReps to 0 to prevent stale display.
Database (Supabase)
Tables: rooms + room_players (see supabase/migrations/001_multiplayer_rooms.sql)
RLS: authenticated read-all; owner-only write.
Must enable Realtime for both rooms and room_players in Supabase dashboard → Database → Replication.
Room codes: 6-char uppercase, no O/0/I/1 — generated in lib/multiplayer/service.ts.
Exit Flow
All exits require confirmation — "Leave Workout?" modal with "Leave Workout" / "Keep Going."
stopDetection() → broadcastLeave() → hangUp() → navigate — this order ensures clean cleanup.