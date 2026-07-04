# Multiplayer Roadmap — Workout Together

## Goal

Let two users exercise together in real time, see each other's rep counts, and compete or cooperate on shared workouts.

## Current Phase: Phase 1 (UI Only)

**Status:** Implemented  
**Location:** `app/workout-together/`  
**Constraints:** Local state only. No backend. No cameras. No synchronization.

Everything in Phase 1 uses mock data and React state. The page flow is fully navigable but does not connect to any server or second user.

---

## Phase 1 — UI & Mock Data

### What is built

| Page | Route | Description |
|---|---|---|
| Landing | `/workout-together` | Create Room / Join Room entry point |
| Lobby | `/workout-together/lobby` | Shared lobby for both flows, mock room code |
| Exercise Select | `/workout-together/exercise-select` | Host picks the exercise |
| Countdown | `/workout-together/countdown` | Animated 3-2-1-GO |
| Session | `/workout-together/session` | Dual-panel UI with camera placeholders |
| Results | `/workout-together/results` | Mock results screen |

### What is NOT built in Phase 1

- Supabase integration
- Real room codes (just `LFIT42` mock)
- Second user connection
- Camera feeds (placeholders only)
- Real rep counting
- Score synchronization
- Friend system

### Entry point

A "Workout Together" card appears on the Dashboard (`app/dashboard/page.tsx`).

---

## Phase 2 — Backend + Presence (Planned)

**Requires:** Supabase Realtime

### Goals

- Real room creation and join logic
- Room codes stored in Supabase
- Presence: both users see each other's connected status
- Rep count sync: each user's reps broadcast to the room in real time
- Results persisted to user progress

### Architecture

```
User A (Host)          Supabase Realtime          User B (Guest)
  creates room   →     broadcast channel    ←      joins with code
  reps update    →     "reps" event         →      sees B's reps
  finish         →     "done" event         →      both see results
```

### Tables needed (Supabase)

```sql
workout_rooms (
  id uuid PRIMARY KEY,
  code text UNIQUE,
  host_id uuid REFERENCES auth.users,
  guest_id uuid REFERENCES auth.users,
  exercise text,
  status text,  -- 'waiting' | 'active' | 'complete'
  created_at timestamptz
)

room_reps (
  room_id uuid,
  user_id uuid,
  reps int,
  updated_at timestamptz
)
```

### Components to update

- `app/workout-together/lobby/page.tsx` — replace mock code with Supabase insert; listen for guest join
- `app/workout-together/session/page.tsx` — broadcast reps via Realtime channel; display partner's live count

---

## Phase 3 — WebRTC Cameras (Planned)

**Requires:** WebRTC + STUN/TURN server

### Goals

- Both users see each other's live camera feed
- MediaPipe runs locally on each user's device
- Only rep events (not video) are synced over Supabase Realtime
- Camera feeds synced peer-to-peer via WebRTC

### Architecture

```
User A browser                                  User B browser
  MediaPipe (local)                             MediaPipe (local)
  rep count → Supabase channel → ← rep count
  video stream → WebRTC peer → ← video stream
```

### Known constraints

- MediaPipe is single-user by design — each user runs their own instance
- WebRTC requires a STUN server (Google's public one works for development)
- TURN server needed for users behind strict NAT (paid service)
- Mobile browsers have inconsistent WebRTC support

### Components to create

- `components/PeerVideo.tsx` — WebRTC video stream component
- `lib/webrtc.ts` — RTCPeerConnection setup + signaling helpers

---

## Folder Structure (full)

```
app/workout-together/
  page.tsx                    Landing (Create Room / Join Room)
  lobby/
    page.tsx                  Shared lobby
  exercise-select/
    page.tsx                  Exercise picker (host)
  countdown/
    page.tsx                  3-2-1-GO animation
  session/
    page.tsx                  Dual-panel workout (camera placeholders → live)
  results/
    page.tsx                  Results screen

components/
  WorkoutTogetherCard.tsx     [optional] Reusable card used on landing
  PeerVideo.tsx               [Phase 3] WebRTC peer video component

lib/
  webrtc.ts                   [Phase 3] RTCPeerConnection helpers
```

---

## Page Flow (all phases)

```
Dashboard
  ↓
/workout-together         ← Landing
  ↓ Create Room / Join Room
/workout-together/lobby   ← Shared lobby
  ↓ Start Workout (host)
/workout-together/exercise-select
  ↓ Select exercise
/workout-together/countdown
  ↓ GO!
/workout-together/session
  ↓ Stop Workout
/workout-together/results
  ↓ Back to Dashboard
```
