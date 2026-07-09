LetsFit — Session Handoff Summary
1. Project Overview
LetsFit is a gamified fitness web application that motivates users through RPG mechanics: XP, FitCoins, achievements, boss battles, and an adventure world progression system. Users perform real exercises tracked via AI camera (MediaPipe Pose), earn rewards, and progress through themed worlds.

Stack: Next.js 16(App Router) · React 19 · TypeScript · Supabase (auth + DB + Realtime) · MediaPipe Tasks Vision · Framer Motion · Tailwind CSS v4 · Lucide React

2. Current State
Just completed
Boss Fight UI redesign (Neobrutalism):

Battle phase: Replaced BossHealthBar card wrapper and bottom exercise card with minimal RPG overlays. Camera now fills the viewport; only thin text strips sit at the top/bottom edges.
Top HUD: Boss name + tier, bare HP bar (no outer box), phase badge (ENRAGED/DESPERATE), combo pill, round progress dots.
Bottom HUD: Single line — EXERCISE NAME · REP_COUNT on the left, abbreviated R1/3 on the far right. No card, no border.
Victory/Defeat phases: Replaced rounded-2xl / 1px borders with sharp neobrutalist cards (4px solid tier-color border, 6px 6px 0 shadow).
BossHealthBar component: Removed gradient fill → flat solid color.
Very next step
No outstanding bugs. Potential areas for future work:

Phase 7 (Multiplayer): XP/coins rewards for multiplayer sessions
Phase 8 (Multiplayer): Leaderboards
Profile picture crop/zoom UX (currently uploads without crop preview)
Remove debug console.log statements added during friends system debugging

3. File Map & Responsibilities
Core App Routes
File	Role
app/page.tsx	Public landing page (Home)
app/dashboard/page.tsx	Main hub — XP bar, missions, streak, Workout Together promo card
app/exercise/page.tsx	Exercise catalog
app/exercise/[slug]/page.tsx	Individual exercise page (AI session wrapper)
app/adventure/page.tsx	World Map — floating island SVGs, S-curve path, localStorage lastWorld redirect
app/adventure/[world]/page.tsx	Adventure Journey — StageCard + BossCard components
app/boss/[id]/page.tsx	Full boss fight loop (intro → battle → victory/defeat). The ONLY file for the entire boss fight UI and gameplay. Phase 'battle' returns a fixed fullscreen overlay with camera + canvas + HUD overlays.
app/shop/page.tsx	FitCoins cosmetics store (borders, auras) — avatar tab removed
app/progress/page.tsx	Stats, achievements, boss history, titles
app/signin/page.tsx · app/signup/page.tsx	Auth pages (both use AuthForm)
app/friends/page.tsx	Friends management page (/friends route). Auth guard uses useEffect to avoid render-phase redirect.
app/workout-together/page.tsx	Multiplayer landing (Create Room / Join Room)
app/workout-together/lobby/page.tsx	Shared lobby — Realtime players, ready state, host exercise picker, game mode selector (Freestyle / 1v1 Battle)
app/workout-together/session/page.tsx	Live workout session — WebRTC cameras, MediaPipe detection, round system. Battle phase starts via "Choose Exercise → Start Workout" overlay (phase='selecting').
Multiplayer Library
File	Role
lib/multiplayer/types.ts	Shared TS types (Room, Player, WorkoutResult, etc.)
lib/multiplayer/constants.ts	MULTIPLAYER_EXERCISES, EXERCISE_LABELS, XP/COINS per rep, MOCK_ROOM_CODE
lib/multiplayer/db.ts	Raw Supabase queries. RoomRow now includes game_mode and battle_rounds columns.
lib/multiplayer/service.ts	Business logic: createRoom, joinRoom, joinRoomById (used by invite accept), leaveRoom, setReady, updateRoomSettings (accepts game_mode, battle_rounds)
lib/multiplayer/hooks.ts	useLobby() hook — includes changeGameMode(), changeBattleRounds()
lib/multiplayer/workoutSession.ts	Session event types. navigate event includes gameMode + battleRounds. New events: exercise_change, battle_result.
lib/multiplayer/useWorkoutSession.ts	React hook — round state, countdown, battle scoring, signalRoundFinished (with completionTimeMs), hostStartCountdown (repGoal=0 always now)
lib/multiplayer/workout-sync.ts	Rep-only sync types + broadcast helpers
lib/multiplayer/webrtc.ts	Pure WebRTC utils
lib/multiplayer/signaling.ts	Supabase broadcast signaling for WebRTC
lib/multiplayer/useWebRTC.ts	React hook — full WebRTC lifecycle
hooks/multiplayer/useMultiplayerWorkoutSync.ts	Runs MediaPipe locally, counts reps, syncs rep count. Uses createPoseLandmarker() from lib/ai/mediapipe.ts. Has useEffect([slug]) to swap detector on exercise change. Detection video is visible (not display:none).
AI Pipeline
File	Role
lib/ai/mediapipe.ts	Single shared PoseLandmarker factory. ONLY place with model URL (/latest/). Used by both AIWorkoutSession and useMultiplayerWorkoutSync.
lib/exerciseDetectors.ts	All exercise detectors (squat, pushup, jumping-jack, etc.). getDetectorForSlug(slug) factory. drawSkeleton() renderer. Shared by solo and multiplayer.
components/AIWorkoutSession.tsx	Solo exercise session — camera, MediaPipe, rep counting, completion screen. Uses createPoseLandmarker() from lib/ai/mediapipe.ts.
Social System (Phase 6.2)
File	Role
types/social.ts	All social TS types: FriendRow, InviteRow, PresencePayload, SocialNotification, UserSearchResult (with FriendRelationStatus)
lib/social/friends-db.ts	Raw Supabase queries for friends table. Two-step pattern (no FK joins). Avatar field = getAvatarPublicUrl(userId).
lib/social/friends-service.ts	Business logic for friends. searchUsers returns UserSearchResult[] with relation status.
lib/social/invite-db.ts	Raw Supabase queries for invites. Two-step pattern.
lib/social/invite-service.ts	Business logic: sendInvite (broadcasts on social:{userId} channel), acceptInvite, declineInvite
lib/social/presence-service.ts	upsertPresence(), setOffline(). Throttled at 3000ms.
hooks/social/usePresence.ts	Supabase Realtime Presence on 'presence_global' channel
hooks/social/useFriends.ts	Friend list, pending requests, searchUsers returns {data, error}
hooks/social/useInvites.ts	Pending invites, sendInvite, acceptInvite (calls joinRoomById), declineInvite
hooks/social/useNotifications.ts	Aggregates friend requests + invites into SocialNotification[]. localStorage key 'letsfit:notif:lastRead'.
components/social/SocialProvider.tsx	Top-level context. Reads username from profileSync.getUsername(), NOT user_metadata. Exports SocialContext for Navbar.
components/social/friends/FriendCard.tsx	Single friend row. No useAvatarUrl call — passes profile.avatar (storage URL) directly to UserAvatar.
components/social/friends/FriendList.tsx	Full list (Friends / Pending tabs)
components/social/friends/AddFriendModal.tsx	5-state search: none / pending_sent / pending_received / friends. onSearch returns {data, error}.
components/social/invites/InvitePopup.tsx	Full-screen invite accept/decline modal
components/social/notifications/NotificationPanel.tsx	Bell dropdown. Has onOpenFriends prop → navigates to /friends.
components/social/notifications/NotificationToast.tsx	Auto-dismiss at 2.8s. Timers stored in Map ref (not useEffect cleanup).
components/social/presence/PresenceDot.tsx	Colored square dot for presence status
Profile & Avatar System
File	Role
lib/profilePicture.ts	uploadAvatarBlob() → uploads to Supabase Storage avatars/{userId}/avatar.webp, sets hasAvatar:true in localStorage progress. No DB column needed. getAvatarPublicUrl(userId) constructs deterministic URL.
hooks/useAvatarUrl.ts	Reads loadProgress().hasAvatar to decide if photo exists. Returns storage URL if true. Subscribes to progress changes. broadcastAvatarUrl() for post-upload update.
components/UserAvatar.tsx	Circular avatar. photoUrl prop → shows image; falls back to first letter on accent bg. onError handles missing files.
components/ProfilePictureModal.tsx	Drag-drop upload modal with live preview + crop. Calls uploadAvatarBlob.
Key Components
File	Role
components/AuthForm.tsx	Sign-in / sign-up form
components/BossHealthBar.tsx	Boss HP bar (used only as fallback; battle HUD now inlines HP directly). Gradient fill removed → flat color.
components/WorldAtmosphere.tsx	Per-world CSS background effects
components/Navbar.tsx	Fixed top nav. Bell icon + NotificationPanel. useAvatarUrl for photo. useRouter for onOpenFriends navigation. user declared before useAvatarUrl.
Business Logic Libraries
File	Role
lib/progress.ts	localStorage progress store. Progress type now has hasAvatar?: boolean.
lib/profileSync.ts	Cloud sync for Progress ↔ Supabase profiles.data. Never touches avatar_url (separate concern).
lib/exercises.ts	Exercise metadata
lib/worlds.ts	World themes — primary color, introBg, battleGradient, particleType per world
lib/stages.ts	Stage definitions per world
lib/bosses.ts	Boss data, TIER_CONFIG, BOSS_GAME_CONFIGS (image paths, attackColor, moveDurationS)
lib/shop.ts	SHOP_ITEMS — avatar items REMOVED. Only borders + auras remain.
lib/achievements.ts	Achievement definitions + unlock checks
lib/supabase.ts	getSupabase() lazy singleton
Documentation
File	Role
CLAUDE.md	Agent instructions + git workflow (auto-commit on task complete)
docs/README.md	Documentation index
docs/DESIGN_SYSTEM.md	Neobrutalist design reference — CSS vars, classes, patterns
docs/MULTIPLAYER_ROADMAP.md	Phase 1→8 roadmap, Supabase schema, WebRTC constraints
SQL Migrations (run in Supabase SQL Editor in order)
File	Purpose
SETUP_01–05	Profiles, roles, admin setup
SETUP_06_social.sql	friends, invites, presence tables with RLS
SETUP_07_profiles_public_read.sql	Allows authenticated users to read all profiles (required for friend search)
SETUP_08_game_mode.sql	Adds game_mode + battle_rounds columns to rooms table
SETUP_09_avatars.sql	Creates avatars storage bucket with RLS
SETUP_10_profile_avatar_column.sql	Adds avatar_url column (NOT currently used — app uses progress.hasAvatar instead)

4. Key Decisions
Design System
Neobrutalism throughout — 3px solid #111 borders, 4px 4px 0 #111 hard shadows, borderRadius: 0. No gradients, no blur, no glassmorphism. Boss Fight uses world-color shadows (not black) to match the themed atmosphere.

Avatar System
avatarUrl is NOT stored in a DB column. uploadAvatarBlob() sets hasAvatar: true in the Progress localStorage object. profileSync syncs Progress to profiles.data, so the flag survives refresh/logout. getAvatarPublicUrl(userId) constructs the deterministic storage URL from userId. For other users (friends, lobby), pass the URL directly and let UserAvatar.onError handle 404s with letter fallback.

Multiplayer Architecture
Supabase is signaling-only for WebRTC. Three separate Realtime channels per room: lobby:{roomId}, workout_session:{roomId}, workout_sync:{roomId}, signaling:{roomId}. Host-authoritative timing. Each device runs its own MediaPipe — no pose data transmitted. repGoal is always 0 in Freestyle (open-ended). The session always starts in phase='selecting'; host must press "Start Workout" to trigger the first hostStartCountdown.

AI Pipeline
Single shared createPoseLandmarker() in lib/ai/mediapipe.ts. Both AIWorkoutSession and useMultiplayerWorkoutSync import from here. Multiplayer detection video must be visible (not display:none) — browsers may not decode frames for hidden video elements. Canvas must be absolute inset-0 over an also-absolute-inset-0 video so object-cover coordinates align.

Social Layer
Friend search returns UserSearchResult[] with a relation field (none/pending_sent/pending_received/friends) so the UI shows the correct badge without re-querying. All Supabase FK joins between friends/invites and profiles are replaced with two-step queries (fetch rows, then batch-fetch profiles by ID) because the FKs point to auth.users, not profiles.

Multiplayer Session Start Bug (fixed d1be70d)
phase starts as 'selecting'. The exercise picker overlay now also shows when phase === 'selecting' (not just 'round_complete'). Host sees "Start Workout →" button which calls hostStartCountdown — without this, isActive was always false and the detector never ran.
