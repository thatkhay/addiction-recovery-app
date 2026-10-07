# Recovery

A private addiction recovery companion built with Next.js: a live sobriety timer, daily check-ins, an SOS craving toolkit, journaling, health milestones, insights and an AI recovery coach.

## Accounts and data

People sign up with an email and password. Passwords are hashed with scrypt; sessions are random tokens stored hashed in the database and sent as `httpOnly` cookies. Each user's data is saved instantly on the device and synced to their account in the background, so it follows them to other devices and keeps working offline.

The database is Postgres:

- **On Vercel / in production:** [Neon](https://neon.tech) serverless Postgres, used whenever `DATABASE_URL` is set.
- **Locally:** if `DATABASE_URL` isn't set, an embedded Postgres ([PGlite](https://pglite.dev)) stored in `./data/pglite` (gitignored). No setup needed.

Tables are created automatically on first use.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. In the Vercel project, open **Storage → Create Database → Neon (Postgres)** and connect it to the project. This sets `DATABASE_URL` for you.
3. Add `ANTHROPIC_API_KEY` under **Settings → Environment Variables** (optional; without it the coach gives built-in offline guidance).
4. Deploy. That's it: accounts, sync and the coach all work.

## Notifications (optional)

The app shows reminders in an in-app inbox, and can also send phone/desktop notifications when it's closed (web push). On iPhone, push only works after the user adds the app to their Home Screen (iOS 16.4+); the app guides them through it.

1. Generate keys: `npx web-push generate-vapid-keys`.
2. In Vercel → Settings → Environment Variables add `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (e.g. `mailto:you@example.com`) and `CRON_SECRET` (any long random string), then redeploy.
3. Reminders are sent by `/api/cron/notify`. Vercel's free plan runs it once a day (see `vercel.json`). For on-time, per-timezone reminders, the included GitHub Action runs it every 15 minutes: in GitHub → Settings → Secrets and variables → Actions, add the secret `CRON_SECRET` (same value) and the variable `SITE_URL` (your site's URL).

`/api/health` shows whether push and the scheduler are configured.

## AI coach setup

The coach and journal reflections call Claude through `app/api/coach/route.ts`. Create `.env.local` with:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

The coach is only available to signed-in users (rate-limited to 60 messages per hour each). Without a key the app still works: the coach falls back to built-in offline guidance (marked "Offline guidance" in the chat).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
