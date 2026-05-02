# EventFast

EventFast is a web app for creating events and sharing them instantly via a public link. Attendees can confirm their attendance without needing an account.

## Features

- **Passwordless auth** — sign in with a magic link sent to your email (Supabase OTP)
- **Create & manage events** — set a title, description, location, date, and time
- **Public event pages** — each event gets a shareable URL at `/e/[id]`
- **Attendee RSVP** — guests confirm attendance by name; no account required
- **Attendee list** — optionally show confirmed attendees on the public page
- **Edit & delete** — full event management from the dashboard

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Auth & Database | Supabase (`@supabase/ssr`) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Icons | Lucide React |
| Date utilities | date-fns, react-day-picker |

## Project Structure

```
app/
  page.tsx                  → redirects to /dashboard
  layout.tsx                → root layout
  actions.ts                → server actions (auth, events, attendees)
  auth/confirm/route.ts     → Supabase magic link callback
  login/                    → magic link login page
  dashboard/                → authenticated event management
    [id]/                   → edit / manage attendees / delete event
  e/[id]/                   → public event page + RSVP form
components/ui/              → shadcn/ui component library
utils/supabase/             → Supabase client helpers (server & browser)
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to the dashboard, and if not logged in, to the login page.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
