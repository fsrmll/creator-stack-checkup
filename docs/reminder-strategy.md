# Reminder Strategy

The first version avoids server-side reminders by design.

## Why No SMTP Passwords

Some native or self-hosted tools can send mail by asking the user for an SMTP host, username, and app password. A normal browser app is different:

- Browsers do not expose raw SMTP/TCP mail sending APIs.
- Storing SMTP passwords in localStorage would be unsafe.
- Sending through a backend would turn the project into a hosted notification service.
- Hosted email reminders require deliverability, unsubscribe, abuse handling, and data retention rules.

For v1, the app must not ask users for SMTP secrets.

## V1 Reminder Methods

All reminder methods are user-controlled:

- `.ics` calendar download
- Google Calendar event link
- Outlook Calendar event link
- `mailto:` link that opens the user's mail app
- `sms:` link that opens the user's messaging app on supported devices
- Browser Notification only when the user explicitly enables it and the app is open

These methods do not guarantee background delivery from this app. They hand the reminder to the user's own calendar, email, or SMS app.

## Future Optional Backend

If there is enough demand, a paid or self-hosted backend can add:

- email reminders
- D1 reminder storage
- Cloudflare Cron scanning
- Resend or another email API
- unsubscribe links

Even then, store only reminder metadata, not the user's full subscription list.

