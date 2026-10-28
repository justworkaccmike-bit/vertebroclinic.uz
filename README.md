# Vertebro Clinic Service — website

Static site (HTML, CSS, vanilla JS) for Vertebro Clinic Service, Farg‘ona. Uzbek by default, Russian via the UZ/RU switch.

## Run locally

```bash
node serve.mjs
```

Then open http://localhost:5173.

## Booking form → Telegram group

The form posts to `/api/lead` (`api/lead.mjs`, a Vercel function), which sends each request to a Telegram group. In Vercel → Project → Settings → Environment Variables set:

- `TELEGRAM_BOT_TOKEN` — token from @BotFather
- `TELEGRAM_CHAT_ID` — the group's id (a negative number; currently `-5394318260`)

then redeploy. Until both are set, the form shows a "not sent, please call" message.

## Before going live

- Replace `assets/logo.png` with the clinic's original logo file.
