<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# EventFast — Agent Guide

## Project Overview

EventFast is a Next.js 16 (App Router) application for creating events and sharing them via a public URL. It uses Supabase for authentication and database. Authentication is passwordless (magic link / OTP only).

## Key Conventions

- **Server Actions** live in `app/actions.ts`. All mutations go through server actions — no separate API routes.
- **Supabase clients**: use `utils/supabase/server.ts` in Server Components and Server Actions; use `utils/supabase/client.ts` in Client Components.
- **Environment variables**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (note: *publishable*, not *anon*).
- **UI components**: use the existing shadcn/ui components in `components/ui/`. Run `npx shadcn add <component>` to add new ones — do not hand-write primitives.
- **Styling**: Tailwind CSS v4. No `tailwind.config.*` — configuration is in CSS via `app/globals.css`.
- **Path alias**: `@/` maps to the workspace root (configured in `tsconfig.json`).

## Database Schema (Supabase)

### `events`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `creator_id` | uuid | References `auth.users` |
| `title` | text | Required |
| `description` | text | Nullable |
| `location` | text | Nullable |
| `event_date` | date | Nullable |
| `event_time` | time | Nullable |
| `show_attendees` | boolean | Whether to show attendee list publicly |
| `created_at` | timestamptz | Auto-set |

### `attendees`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `event_id` | uuid | References `events.id` |
| `name` | text | Required |
| `created_at` | timestamptz | Auto-set |

## Route Map

| Route | Description |
|---|---|
| `/` | Redirects to `/dashboard` |
| `/login` | Magic link login |
| `/auth/confirm` | Supabase OTP callback |
| `/dashboard` | Authenticated event list + create form |
| `/dashboard/[id]` | Edit event, manage attendees, delete event |
| `/e/[id]` | Public event page + RSVP (no auth required) |

## Development

```bash
npm install
npm run dev   # http://localhost:3000
npm run build
npm run lint
```
