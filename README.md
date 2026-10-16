# SkillSwap

Neighborhood skill swap: list what you can teach and what you want to learn, get matched with neighbors.
Stack: Next.js 14 (App Router) · Prisma + SQLite · Auth.js v5 (email + password) · Tailwind.

## Run it

    npm install
    npx auth secret            # writes AUTH_SECRET to .env.local (or paste any random string into .env)
    npx prisma db push         # creates prisma/dev.db
    npm run db:seed            # 16 fake users; log in as demo@skillswap.test / password123
    npm run dev

## Deploy

SQLite files don't persist on Vercel. For a hosted demo, switch `provider` in `prisma/schema.prisma` to
`postgresql`, set `DATABASE_URL` to a Neon/Supabase/Railway Postgres URL, and set `AUTH_SECRET`.
(Railway/Render with a persistent disk can keep SQLite.)

## Where things live

- `lib/matching.ts`: the mutual-match query
- `app/actions.ts`: all server actions (auth, skills, swap requests)
- `app/matches`, `app/inbox`, `app/profile`: the three core screens
