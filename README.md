<p align="center">
  <img src="public/favicon.svg" alt="waHub logo" width="96" height="96" />
</p>

<h1 align="center">waHub</h1>

<p align="center">
  Open WhatsApp automation hub.<br/>
  Pair any number, plug in AI agents, send and receive at scale — from one panel.
</p>

<p align="center">
  🔗 <a href="https://ismaelhv.com/wahub/">ismaelhv.com/wahub</a> ·
  ✨ by <a href="https://ismaelhv.com">Ismael Hurtado</a>
</p>

---

## What it does

waHub turns one or many WhatsApp numbers into a programmable channel — pair a
phone via QR, route messages through AI agents, broadcast to lists, and expose
the whole thing as an HTTP API and webhooks.

- 📱 **Multi-session.** Pair as many numbers as you need. Each session has its
  own QR, status and history — fully isolated.
- 🤖 **AI agents (BETA).** Drop in OpenAI or Claude, set a system prompt, and
  let the bot reply to incoming messages.
- 💬 **Realtime inbox.** Messages stream in over WebSockets — no polling, no
  reload.
- 📤 **Send API.** `POST /v1/messages/text` with an API key — works from cURL,
  cron jobs, your backend, anywhere.
- 🔔 **Webhooks.** Subscribe to `message.received`, `session.connected`,
  `session.disconnected` — HMAC-signed deliveries with auto-retry.
- 🌐 **Bilingual.** Every screen and microcopy localized in EN / ES, switch on
  the fly.
- 🌗 **Dark / light theme** with system-preference fallback and persistence.

---

## Why it feels solid

- **Server-rendered shell** with a tiny set of client islands for the
  interactive parts (QR pairing, inbox, settings).
- **Refresh-token rotation** with single-flight lock — one expired access
  token never logs the user out.
- **Hexagonal layering** (`Domain` → `Application` → `Infrastructure` → `UI`)
  so every feature lives in its own context with the same shape.
- **No realtime polling.** A single WebSocket per page, snapshot-on-subscribe
  for instant hydration.

---

## Privacy by default

- **No tracking pixels, no analytics SDKs, no third-party fonts.**
- **Tokens stay client-side.** Access + refresh JWTs live in `localStorage`;
  the backend only sees them on the wire.
- **API keys are hashed** before storage — the raw key is shown to the user
  exactly once at creation time.
- **Webhook secrets are per-endpoint** so a leaked secret only affects one
  destination.

```
Browser ─Bearer access─▶ Backend
        ◀─401──         (access expired)
        ─POST refresh─▶
        ◀─new pair──    (single-flight, retried request)
```

---

## Local development

```bash
cp .env.example .env       # point at your backend + WS server
npm install
npm run dev                # http://localhost:3000
```

### Environment

| Variable              | Notes                                                           |
| --------------------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | Canonical base URL of the SPA itself                            |
| `NEXT_PUBLIC_API_URL` | wahub-backend base URL (e.g. `http://localhost:7001/api/wahub`) |
| `NEXT_PUBLIC_WS_URL`  | wahub-backend WebSocket URL (e.g. `ws://localhost:8000/ws`)     |

All three are `NEXT_PUBLIC_*` and **inlined into the client bundle at build
time** — they must be present before `npm run build`. CI decodes the deploy
`.env` from a base64 secret right before building.

### Useful scripts

```bash
npm run dev          # dev server with HMR (turbo)
npm run build        # production build (Next standalone output)
npm run start        # serve the production build
npm run lint         # eslint
npm run format       # prettier
npm run typecheck    # tsc --noEmit
```

---

## Architecture at a glance

```
src/
├── env/                              # Centralized public env
└── context/
    ├── shared/                       # UI primitives, AdapterApi, ThemeProvider, i18n
    ├── acceso/
    │   ├── usuarios/                 # Auth, profile, refresh flow
    │   ├── api-keys/                 # /api keys management UI
    │   └── webhooks/                 # /api webhooks tab
    └── wsp/
        ├── connections/              # QR pairing, session lifecycle
        ├── conversations/            # Realtime inbox
        ├── messages/                 # Send-message form
        ├── broadcasts/               # Bulk send to lists
        └── agents/                   # AI agent config (BETA)
```

Each context follows the same shape:

```
MiContexto/
├── Domain/             # IEntity, Repository (interface)
├── Application/        # use cases, hooks
├── Infrastructure/     # AdapterConfigure, RepositoryImpl
└── UI/                 # screens / components
```

App routing lives in `app/` (Next App Router) and only re-exports the
matching `<Screen />` from each context — keeps routes thin and testable.

---

## Routes

| Path         | Purpose                               |
| ------------ | ------------------------------------- |
| `/login`     | Sign in to your workspace             |
| `/signup`    | Create a workspace                    |
| `/dashboard` | Overview                              |
| `/connect`   | Pair a new WhatsApp number (QR scan)  |
| `/bots`      | List of paired sessions               |
| `/inbox`     | Realtime conversations                |
| `/messages`  | One-off message send                  |
| `/broadcast` | Bulk send to a list                   |
| `/agents`    | Configure AI auto-reply agents (BETA) |
| `/api`       | API keys + webhooks management        |
| `/profile`   | Display name + password change        |

---

## Public API (built into the backend)

```bash
curl -X POST http://localhost:7001/api/wahub/v1/messages/text \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: wh_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{ "code": "WSP-AB12C", "to": "51999000111", "text": "Hola desde la API" }'
```

Webhooks deliver this shape with `X-Wahub-Signature: sha256=<hex>` so you can
verify origin:

```json
{
  "event": "message.received",
  "ts": 1730000000000,
  "connection": { "id": 1, "code": "WSP-AB12C", "name": "ismael", "number": "51999..." },
  "data": { "from": "51999...@c.us", "text": "Hola", "timestamp": 1730000000 }
}
```

---

## Production build & deploy

```bash
npm install
npm run build                 # generates .next/standalone with NEXT_PUBLIC_* baked in
docker build -t wahub-frontend .
docker run -p 80:80 --env-file .env wahub-frontend
```

A ready-to-use `docker-compose.yml` lives in `configuracion-servidor/app/wahub-frontend/`
with the SSR container plus a small reverse-proxy container, joined by a
private network.

CI (GitHub Actions, `.github/workflows/ci-production.yml`) handles
format → lint → typecheck → build → Docker image push when commits land on
the `production` branch.

---

## Tech

- **Next.js 15** (App Router, Server Components, standalone output)
- **React 19** + **TypeScript** strict
- Hexagonal DDD layout per context
- Native `WebSocket` for realtime, no socket.io
- CSS variables for theming, no UI framework
- `eslint-config-next` + Prettier + tsc strict in CI

---

## License

MIT © [ismaelhv](https://ismaelhv.com)
