# AXIDENT Store

Cyberpunk streetwear storefront for **AXIDENT — Embrace the Chaos**, with **ECHO**: a live Claude-powered store manager (hacker persona + admin inventory/ops tools).

## Run

```bash
cd axident-store
cp .env.example .env
# put your Anthropic key in .env
npm install
npm run dev
```

Open http://localhost:5173

### ECHO live mode

Set `ANTHROPIC_API_KEY` in `.env`. ECHO calls Claude Opus with tools for:

- live inventory (filter low/out)
- stock adjust / set
- orders + status updates
- metrics / ops snapshot
- catalog search

Without a key, the UI still loads; chat reports the missing uplink.

## Stack

- Vite + React + TypeScript
- `@anthropic-ai/sdk` via Vite dev middleware (`/api/echo/*`)
- Local cart (localStorage)
