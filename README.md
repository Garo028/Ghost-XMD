# 👻 Ghost XMD — Multi-User Web Pair Edition

Anyone can open your Render URL, link their own WhatsApp number, and get
their own isolated instance of the bot — 80 commands, their own prefix,
their own bot name, running on one deployment.

## What changed from the single-user version

- **`index.js`** is now an Express web server, not a console pairing script.
- **`sessionManager.js`** is new — it creates/tracks one Baileys socket per
  linked number, all in memory (`Map`), each with its own `config`
  (`prefix`, `botName`, `mode`).
- **`public/index.html`** is the pairing page — enter a number, get a
  pairing code, link WhatsApp, then set your prefix/bot name/mode from the
  same page.
- **`main.js`** now reads `sock.config.prefix` per session instead of one
  global prefix, and gates commands when a session is in `self` mode.
- **80 commands total** — the original 39 plus 41 new ones (utility, fun,
  group management, and per-user bot settings). Full list is in `.menu`.

## ⚠️ Sessions are in-memory only

Every restart / redeploy on Render wipes linked sessions — everyone has to
re-pair. This was the tradeoff picked to keep things simple and free (no
database). If you want sessions to survive restarts later, the fix is
swapping session disk storage for a MongoDB-backed auth state — ping me if
you want that added.

## Deploy on Render

1. Push this folder to a GitHub repo.
2. Render → New → Web Service → connect the repo.
3. Build command: `npm install`
4. Start command: `node index.js`
5. It auto-detects the port via `process.env.PORT` — no extra env vars
   required (there's a `render.yaml` in here too if you prefer Blueprint
   deploys).
6. Once live, visit your Render URL — that's the pairing page for
   **everyone** who wants to run the bot on their own number.

## Per-user commands (owner only, run in your own linked chat)

- `.setprefix !` — change your command prefix
- `.setbotname MyBot` — change your bot's display name
- `.mode self` / `.mode public` — restrict commands to just you, or open
  them to any chat you're in

## Local testing

```bash
npm install
node index.js
# open http://localhost:3000
```

## Notes

- `tolink.js` still needs your own ImgBB API key (free) — see the comment
  inside that file.
- Group features (`antilink`, `welcome`, `lock`, warns) are stored
  in-memory per group too, so they reset on restart along with sessions.
