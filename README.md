# Weather Forecast Web Application

A multi-page weather intelligence and forecasting platform for cities worldwide built with **React 19 + TypeScript + React Router** (frontend) and **Node.js + Express + TypeScript** (backend).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 6, React Router v7, Tailwind CSS v4, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, tsx, Axios, json2csv, express-rate-limit |
| **Caching & Architecture** | In-memory TTL cache (`Map`) with 24h geocoding and 10m weather entries |
| **Database Design** | PostgreSQL schema documented for future persistence; not connected at runtime |
| **Data Providers** | OpenStreetMap (Nominatim) for geocoding, OpenWeatherMap for forecasts |

---

## Application Pages & Routing

| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/` | **Home Page** | Global city search with popular city chips, live overview of major cities, and platform telemetry status. |
| `/city/:cityName` | **City Forecast Page** | Deep-dive telemetry for a city: current conditions, 24-hour scrollable 3h timeline, 5-day predictive outlook, favorite bookmarking, and instant CSV download. |
| `/compare` | **City Comparator** | Side-by-side climatic comparison between any two cities with live delta calculations for temperature, humidity, wind, and cloudiness. |
| `/export` | **Data Export Hub** | Dedicated RFC 4180 CSV export center with data dictionary, duration selector (1–5 days), and field specification table. |
| `*` | **404 Not Found** | Clean linen-themed fallback page with one-click return to the dashboard. |

---

## Persistence Status

The current application does not connect to an external database. Weather responses and geocoding results are cached in an in-memory `Map`, so the cache is cleared whenever the backend restarts.

PostgreSQL is the planned persistence option if durable storage, search history, and export logs are added later. The SQL design is an architecture artifact, not an active dependency of the running server.

See [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) and [backend/src/db/schema.sql](./backend/src/db/schema.sql) for the PostgreSQL design.

---

## Setup & Running

### 1. Configure the API Key

Create or edit `backend/.env`:

```env
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
PORT=3001
```

*(A template is provided at `backend/.env.example`)*

---

### 2. Install Dependencies

```bash
# Install root, backend, and frontend dependencies:
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

---

### 3. Run Development Servers

```bash
# Single command starts both Backend (port 3001) and Frontend (port 5173):
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

### 1. Health & Cache Telemetry
`GET /api/health`
- Returns system status, API key presence, and real-time cache statistics:
  ```json
  {
    "ok": true,
    "service": "Weather Forecast API",
    "hasApiKey": true,
    "cache": { "size": 18, "hits": 34, "misses": 18, "hitRate": "65%" },
    "timestamp": "2026-10-19T01:11:20.890Z"
  }
  ```

### 2. Fetch Single City Forecast
`GET /api/weather?city=Mumbai`
- Resolves coordinates via Nominatim and fetches current weather and 5-day forecast.

### 3. Compare Two Cities
`GET /api/compare?city1=Mumbai&city2=Delhi`
- Parallel multi-city weather retrieval with calculated temperature and humidity deltas.

### 4. Export CSV
`GET /api/export/csv?city=Bengaluru&days=5`
- Generates and downloads formatted RFC 4180 CSV attachment.

---

## Project Structure

```
Weather-Forecast/
├── DATABASE_ARCHITECTURE.md    # PostgreSQL architecture and integration plan
├── package.json                # Root concurrent dev runner
├── .gitignore                  # Gitignore rules
├── README.md                   # Complete documentation
├── backend/                    # TypeScript Express Backend
│   ├── src/
│   │   ├── services/
│   │   │   └── cacheService.ts # In-memory TTL caching with hit/miss telemetry
│   │   ├── db/
│   │   │   └── schema.sql      # PostgreSQL DDL schema
│   │   ├── server.ts           # Express server, geocoding & OWM integration
│   │   └── types.ts            # TypeScript interfaces
│   ├── .env                    # Environment variables (API key)
│   ├── .gitignore              # Backend gitignore
│   ├── package.json            # Backend scripts & dependencies
│   └── tsconfig.json           # Backend TypeScript configuration
└── frontend/                   # React 19 + TypeScript + React Router Frontend
    ├── src/
    │   ├── pages/
    │   │   ├── HomePage.tsx            # Landing page with global city overview
    │   │   ├── CityWeatherPage.tsx     # City telemetry, timeline, 5-day outlook
    │   │   ├── ComparePage.tsx         # Side-by-side city comparator
    │   │   ├── ExportPage.tsx          # Data dictionary & CSV download hub
    │   │   └── NotFoundPage.tsx        # 404 page
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.tsx          # Nav links, saved city bookmarks, branding
    │   │   │   ├── Footer.tsx          # Footer layout & data credits
    │   │   │   └── AppLayout.tsx       # Shell wrapper with linen texture
    │   │   ├── weather/
    │   │   │   ├── CurrentWeatherCard.tsx # Detailed meteorological dials
    │   │   │   ├── HourlyTimeline.tsx  # Next 24 hours 3h scrollable timeline
    │   │   │   ├── ForecastGrid.tsx    # 5-day predictive cards
    │   │   │   ├── ExportCard.tsx      # In-page CSV export module
    │   │   │   └── MetroOverviewCard.tsx # Live metro cards
    │   │   └── SearchBar.tsx           # Search with quick city chips
    │   ├── context/
    │   │   └── FavoritesContext.tsx    # LocalStorage bookmarks state
    │   ├── lib/
    │   │   ├── api.ts                  # Axios client (fetch, compare, export)
    │   │   └── utils.ts                # Date formatting, validation, grouping
    │   ├── types.ts                    # Frontend TypeScript interfaces
    │   ├── AppRouter.tsx               # React Router routes definition
    │   ├── index.css                   # Linen design system & Tailwind CSS
    │   └── main.tsx                    # React DOM entry
    ├── index.html                      # HTML document & Google Fonts
    ├── .gitignore                      # Frontend gitignore
    ├── package.json                    # Frontend dependencies & scripts
    ├── tsconfig.json                   # Frontend TypeScript configuration
    └── vite.config.ts                  # Vite proxy config (127.0.0.1:3001)
```

---

## Verification

- **Frontend Compilation**: `npx tsc -b` passes with 0 errors.
- **Frontend Bundle**: Vite build completes in ~1.2s.
- **Backend Compilation**: `tsc` passes with 0 errors.
- **Routing**: Client-side history navigation with deep-linking (`/city/Mumbai`, `/compare`, `/export`).
- **Telemetry & Quota Protection**: Cache hit/miss statistics are exposed through `/api/health`.
