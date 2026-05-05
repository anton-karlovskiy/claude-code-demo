# NoteApp

A rich-text note-taking web app with public sharing. Built with Next.js App Router, Bun, SQLite, and TipTap.

## Features

- Email/password auth (sign up, login, logout) via better-auth
- Create, edit, delete notes with a rich-text TipTap editor (bold, italic, headings, code blocks, bullet lists)
- Toggle public sharing — generates a shareable `/p/[slug]` URL accessible without login
- Content stored as TipTap JSON (never raw HTML)

## Stack

- **Runtime:** Bun
- **Framework:** Next.js 16 App Router + TypeScript
- **Database:** SQLite via Bun's built-in client (raw SQL, no ORM)
- **Auth:** better-auth
- **Editor:** TipTap
- **Styling:** TailwindCSS v4

## Getting Started

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
bun run dev        # start dev server
bun run build      # production build
bun run start      # start production server
bun run lint       # ESLint
bun run test       # unit tests (Vitest)
bun run test:watch # Vitest watch mode
```

## Project Structure

```
app/
  (auth)/login, register   # auth pages
  dashboard/               # notes list (authenticated)
  notes/[id]/              # note editor (authenticated)
  p/[slug]/                # public read-only note
  api/notes/               # REST endpoints (CRUD + sharing)
components/                # NoteList, NoteEditor, ShareToggle, DeleteNoteButton, PublicNoteViewer
lib/
  db.ts                    # SQLite singleton + query helpers
  notes.ts                 # note repository (all queries scoped to user_id)
  auth.ts                  # better-auth setup + session helpers
data/app.db                # SQLite database (gitignored)
```

## Security

- All note queries in authenticated context filter by `user_id`
- Public slugs are 16+ chars (nanoid) to prevent enumeration
- Content is stored/rendered as TipTap JSON — no raw HTML
- API routes return 401 if unauthenticated, 404 if note not found or not owned by user
