# CLAUDE.md

We're building the app described in @SPECS.md. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev       # start dev server (localhost:3000)
bun run build     # production build
bun run start     # start production server
bun run lint      # run ESLint
```

No test runner is configured yet.

## Architecture

This is a **Next.js 16 App Router** project using **Bun** as the runtime, targeting a note-taking web app (see `SPEC.MD` for full product spec).

**Stack:**
- Next.js App Router — server components for data fetching, client components for interactive UI
- Bun runtime (use `bun` not `node`/`npm` for all commands)
- SQLite via Bun's built-in SQLite client (`Bun.sqlite`) — raw SQL, no ORM
- better-auth for authentication (session accessible on both server and client)
- TipTap rich-text editor (content stored as JSON stringified in DB)
- TailwindCSS v4 for styling

**Planned directory layout (per SPEC.MD):**
- `lib/db.ts` — singleton Bun SQLite connection + query helpers (`query<T>`, `get<T>`, `run`)
- `lib/notes.ts` — note repository functions (CRUD + sharing), all scoped to `user_id`
- `lib/auth.ts` — better-auth setup + `getCurrentUser()` / `getSession()` helpers
- `app/api/notes/` — REST route handlers (`GET`, `POST`, `PUT`, `DELETE`, `POST .../share`)
- `app/api/public-notes/` — unauthenticated read-only endpoint
- `app/dashboard/` — authenticated notes list
- `app/notes/[id]/` — TipTap editor page
- `app/p/[slug]/` — public read-only note page
- `components/` — `NoteList`, `NoteEditor`, `ShareToggle`, `DeleteNoteButton`, `PublicNoteViewer`
- `data/app.db` — SQLite database file (gitignored)

**Key architectural rules:**
- Every note DB query in an authenticated context must filter by `user_id` to prevent cross-user access
- TipTap content is stored as `JSON.stringify(editor.getJSON())` and parsed back with `JSON.parse` on load — never store or render raw HTML
- Public slugs must be 16+ chars (generated via `nanoid`) to prevent enumeration
- API routes return 401 if unauthenticated, 404 if a note isn't found or doesn't belong to the current user
- The `/p/[slug]` route can resolve directly in a server component instead of going through an API route
