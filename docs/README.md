# LetsFit Documentation

> **Every Claude Code session must read this file first before modifying any code.**

This folder contains the authoritative documentation for the LetsFit project. Reading these files before starting work prevents duplicate effort, broken patterns, and design inconsistencies.

## Documentation Index

| File | Description |
|---|---|
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Project overview, tech stack, feature list, folder architecture, current status, and roadmap. Read this to understand what LetsFit is and what has already been built. |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | The LetsFit neobrutalist design language. CSS variables, utility classes, component patterns, spacing, typography, color system, animations, and world themes. Read this before writing any UI code. |
| [MULTIPLAYER_ROADMAP.md](MULTIPLAYER_ROADMAP.md) | Complete architecture plan for the Workout Together multiplayer feature. Phase 1 (UI/mock) is implemented. Phase 2 (Supabase Realtime) and Phase 3 (WebRTC cameras) are planned. |

## Quick Rules

1. **Never modify existing gameplay, progression, routing, or reward logic** unless the task explicitly requires it.
2. **Always follow DESIGN_SYSTEM.md** when writing or modifying UI components.
3. **Workout Together** lives under `app/workout-together/` — Phase 1 is UI-only with mock data.
4. **Run `npm run build` before committing** to catch TypeScript errors early.
5. **CLAUDE.md** at the project root also contains architecture and git workflow rules — read both.
