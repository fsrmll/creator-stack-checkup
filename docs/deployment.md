# Deployment

Creator Stack Checkup is a static Vite app.

## Cloudflare Pages

Recommended deployment target for v1.

1. Push this project to GitHub.
2. In Cloudflare, create a Pages project from the GitHub repo.
3. Use these settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

No environment variables are required.

## Why No Workers/D1/Cron In V1

The first release is local-first:

- localStorage handles data.
- Calendar files and links handle reminders.
- Static assets handle PWA installation.

Workers, D1, and Cron should only be added if the product later needs hosted email reminders or cloud sync.

