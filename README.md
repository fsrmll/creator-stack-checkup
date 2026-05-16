# Creator Stack Checkup

A local-first PWA for auditing AI tools and creator subscriptions before they quietly drain your budget.

Creator Stack Checkup is intentionally simple:

- no login
- no backend
- no bank connection
- no email or phone collection
- no SMTP password storage
- data stays in the user's browser

It helps creators track monthly tool burn, annualized cost, category overlap, renewal dates, and cancellation candidates.

## What It Does

- Add AI tools, design apps, hosting, email tools, marketplaces, and creator subscriptions.
- See monthly burn, annualized cost, upcoming renewals, and possible savings.
- Get rule-based labels: `Keep`, `Review`, `Downgrade`, `Cancel Candidate`.
- Generate no-backend reminders through `.ics`, Google Calendar, Outlook, `mailto:`, and `sms:` links.
- Export and import local data as JSON.
- Export subscriptions as CSV.
- Install as a PWA on supported browsers.

## What It Does Not Do

- It does not automatically send email.
- It does not ask for SMTP passwords.
- It does not send SMS from a server.
- It does not cancel subscriptions automatically.
- It does not import bank or email data.
- It does not sync across devices.

## Tech Stack

- Vite
- React
- TypeScript
- localStorage
- PWA manifest and service worker
- Cloudflare Pages static deployment

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run test
npm run build
```

## Cloudflare Pages Deployment

Connect the GitHub repository to Cloudflare Pages.

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: use a modern Node 20+ runtime supported by Cloudflare Pages

The first version is static only. It does not need Workers, D1, KV, Cron Triggers, or secrets.

## Privacy Model

All subscription data is stored in browser localStorage. Calendar, email, and SMS reminders are generated as local links or downloaded files. No reminder is scheduled on a remote server.

## License

MIT

