# F1 Race Engineer

An AI-powered Formula 1 race engineer dashboard that provides real-time telemetry analysis, strategy insights, and race commentary using data from the OpenF1 API and AI analysis from Claude.

## What is this?

F1 Race Engineer simulates having a race engineer on your pit wall. Select any F1 session (practice, qualifying, sprint, or race) from 2023-2025, and the app builds a live-style dashboard showing driver standings, car telemetry, track positions, tire strategy, and AI-powered race analysis — all in a dark, F1-themed interface.

## Features

### Live Dashboard
- **Timing Tower** — Full driver standings with positions, intervals, lap times, and tire compound badges. Click any driver to select them. Positions animate smoothly when drivers swap places (Framer Motion layout animations).
- **Track Map** — SVG circuit outline rendered from real GPS location data, with colored dots showing each driver's position on track.
- **Car Telemetry** — Speed readout, gear indicator, DRS status, throttle/brake bar gauges, sector times, and a live speed trace chart (Recharts) for the selected driver.
- **Tire Strategy** — Visual stint timeline showing compound usage (Soft/Medium/Hard/Inter/Wet) and tire age for all drivers.
- **Race Control** — Flag notifications (green, yellow, red, blue, chequered) and steward decisions with timestamps.
- **Weather** — Air/track temperature, humidity, wind speed, and rain detection shown in the header bar.

### AI Race Engineer (BYOK)
- **Bring Your Own Key** — Enter your Anthropic API key (stored locally in your browser's localStorage, never stored on the server).
- Claude analyzes the full session state and delivers categorized radio-style messages:
  - Tire strategy & pit window recommendations
  - Gap analysis & position change alerts
  - Weather impact assessments
  - Fuel management insights
  - Risk assessments
- Messages are color-coded by priority (critical = red glow, high = orange, medium = cyan, info = gray) with category labels.

### Replay Mode
- Automatically enabled for historical sessions.
- **Play/Pause** with adjustable speed (1x, 2x, 5x, 10x).
- **Scrub** to any lap using the timeline slider.
- **Step** forward/backward one lap at a time.
- All dashboard panels update to show data as of the selected lap — positions, intervals, stints, weather, and race control messages all filter to that point in the race.

### Home Page
- Browse Grand Prix events by year (2023, 2024, 2025).
- Country flag indicators and round numbers for each event.
- Session picker with icons for Practice (P), Qualifying (Q), Sprint (S), and Race (R).
- Animated transitions between event list and session selection.

### Resilience
- Each dashboard panel is wrapped in its own React Error Boundary — one panel crashing won't take down the whole dashboard.
- API requests use safe fallbacks — if any data source fails, the rest of the dashboard still renders.
- OpenF1 rate limiting is handled with exponential backoff and retry logic.
- In-memory and optional KV caching reduce redundant API calls.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 6, TypeScript |
| **Styling** | Tailwind CSS v4 (custom F1 dark theme) |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **State Management** | Zustand |
| **Routing** | React Router v7 |
| **Backend** | Hono (on Cloudflare Workers) |
| **AI** | Anthropic Claude API (claude-sonnet-4-20250514) |
| **Data Source** | OpenF1 API (free, no key required) |
| **Monorepo** | pnpm workspaces + Turborepo |
| **Deployment** | Cloudflare Workers (API) + Cloudflare Pages (Web) |


## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9 — install with `npm install -g pnpm`
- **Anthropic API key** (optional, only needed for the AI engineer feature) — get one at [console.anthropic.com](https://console.anthropic.com/)

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd f1-race-engineer

# Install dependencies
pnpm install

# Build all packages (shared types must be built first)
pnpm build
```

## Running Locally

You need both the API backend and the web frontend running:

```bash
# Option 1: Run both simultaneously
pnpm dev

# Option 2: Run separately in two terminals
pnpm dev:api    # Cloudflare Worker on http://localhost:8787
pnpm dev:web    # Vite dev server on http://localhost:5173
```

Then open **http://localhost:5173** in your browser.

The Vite dev server proxies `/api/*` requests to the Worker on port 8787 automatically.

## How to Use

1. **Select a Year** — Use the year tabs at the top of the home page (2023, 2024, 2025).
2. **Pick a Grand Prix** — Click on any event card to expand it.
3. **Choose a Session** — Click Practice 1, Qualifying, Race, etc.
4. **Explore the Dashboard** — The timing tower, track map, and strategy panels load automatically.
5. **Select a Driver** — Click any driver row to see their detailed telemetry (speed, gear, DRS, sectors).
6. **Use Replay** — Use the playback controls at the bottom to scrub through the session lap by lap.
7. **Enable AI Engineer** — Click "Set Key" in the engineer panel, paste your Anthropic API key, select a driver, and watch the AI analyze the session.

## Deployment

### API (Cloudflare Workers)

```bash
cd apps/api
npx wrangler deploy
```

Optional — create a KV namespace for response caching:

```bash
npx wrangler kv:namespace create F1_CACHE
# Then uncomment the KV binding in wrangler.toml and add the returned ID
```

### Web (Cloudflare Pages)

```bash
cd apps/web
pnpm build
# Deploy the dist/ folder to Cloudflare Pages
# Set the API URL environment variable to point to your deployed Worker
```

## Data Source

All F1 data comes from the [OpenF1 API](https://openf1.org), a free and open-source API for Formula 1 telemetry data. No API key is required. Data is available for sessions from 2023 onwards.

## License

MIT
