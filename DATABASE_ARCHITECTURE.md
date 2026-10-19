# Database Architecture & Design Rationale

## 1. Executive Summary & Architecture Decision

### **The Decision: PostgreSQL (Relational + JSONB) + Redis Cache Layer**

For a production-grade Weather Forecast platform, the industry-standard architecture is a **Hybrid Relational Store with Semi-Structured Document support (PostgreSQL)** coupled with an **In-Memory Cache (Redis)**.

---

## 2. Why SQL (PostgreSQL) vs. NoSQL (MongoDB) — Trade-Off Analysis

| Architectural Dimension | SQL (PostgreSQL) | NoSQL (MongoDB) | Production Winner & Rationale |
| :--- | :--- | :--- | :--- |
| **Geographic Hierarchy** | Strict relational foreign keys (`country` → `state` → `city`). Spatial queries via `PostGIS` (`ST_DWithin`, `ST_Point`). | Embedded documents or loose references. Spatial queries supported via 2dsphere. | **SQL**: Geographic boundaries and administrative divisions in India are inherently relational. |
| **Weather Payloads** | Native `JSONB` with GIN indexing allows storing raw 40-slot 3-hour forecasts directly while querying sub-keys. | Native BSON documents. Natural fit for arbitrary weather JSON structures. | **Tie**: PostgreSQL's `JSONB` provides the same flexibility as MongoDB with zero penalty. |
| **Audit & Export Logs** | ACID transactions ensure analytics and CSV download logs are strictly recorded without duplicates. | Eventual consistency; write concern adjustments needed for strict logging. | **SQL**: Relational audit trails guarantee data integrity. |
| **API Rate-Limit Protection** | Can store TTL cache rows with expiration timestamps. | Built-in TTL indexes (`expireAfterSeconds`). | **NoSQL / Redis**: In-memory key-value caching is ideal for short-lived weather data. |
| **Operational Overhead** | Single battle-tested engine handles relational data, spatial coordinates, and JSON documents. | Requires managing separate schema migrations or Mongoose validators. | **SQL**: Lower operational complexity with fewer moving parts. |

### Why Pure NoSQL is Suboptimal:
1. **Duplicate City Records**: Without relational unique constraints across normalized coordinates and normalized city names, document stores easily accumulate duplicate variations (e.g., `Bengaluru`, `Bangalore`, `Bengaluru Urban`).
2. **Analytics & Aggregations**: Aggregating export statistics, peak search hours, and state-level query volumes is significantly faster and more expressive with SQL group-by queries.

### Why Pure Traditional SQL Without JSON/Cache is Suboptimal:
1. A 5-day forecast contains **40 separate 3-hour readings**, each with temperature, humidity, wind gusts, cloud cover, and rain volume. Normalizing all 40 slots into individual SQL rows on every search causes excessive write overhead and slow multi-table joins.
2. **Solution**: Store city metadata as relational columns, and store the weather forecast as a `JSONB` column.

---

## 3. Production SQL Schema (PostgreSQL DDL)

```sql
-- Enable UUID and PostGIS extensions (if using spatial coordinates)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CITIES (Normalized Geocoded Master Table)
-- ============================================================================
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(50) NOT NULL DEFAULT 'India',
    country_code VARCHAR(2) NOT NULL DEFAULT 'IN',
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    osm_place_id BIGINT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_city_state_country UNIQUE (LOWER(name), LOWER(COALESCE(state, '')), country_code)
);

CREATE INDEX idx_cities_name_lower ON cities (LOWER(name));
CREATE INDEX idx_cities_coords ON cities (latitude, longitude);

-- ============================================================================
-- 2. WEATHER CACHE (Hybrid Relational + JSONB Store)
-- ============================================================================
CREATE TABLE weather_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    city_name_normalized VARCHAR(100) NOT NULL,
    current_weather JSONB NOT NULL,
    forecast_5day JSONB NOT NULL,
    cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_weather_cache_city UNIQUE (city_name_normalized)
);

CREATE INDEX idx_weather_cache_expires ON weather_cache (expires_at);
CREATE INDEX idx_weather_cache_gin_current ON weather_cache USING gin (current_weather);

-- ============================================================================
-- 3. SEARCH LOGS & TELEMETRY (Analytics & Usage Tracking)
-- ============================================================================
CREATE TABLE search_logs (
    id BIGSERIAL PRIMARY KEY,
    query_string VARCHAR(100) NOT NULL,
    resolved_city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    ip_hash CHAR(64) NOT NULL,
    response_time_ms INTEGER NOT NULL,
    cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
    status_code SMALLINT NOT NULL,
    searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_logs_query ON search_logs (LOWER(query_string));
CREATE INDEX idx_search_logs_timestamp ON search_logs (searched_at);

-- ============================================================================
-- 4. EXPORT AUDIT LOGS (Tracks CSV Exports & Usage)
-- ============================================================================
CREATE TABLE export_logs (
    id BIGSERIAL PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    days_requested SMALLINT NOT NULL CHECK (days_requested BETWEEN 1 AND 5),
    rows_count INTEGER NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    ip_hash CHAR(64) NOT NULL,
    exported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_export_logs_city ON export_logs (LOWER(city_name));
```

---

## 4. Alternative NoSQL Schema (MongoDB / Mongoose)

If deploying to a pure document-based architecture (e.g., MongoDB Atlas):

```typescript
import mongoose, { Schema, Document } from "mongoose";

// 1. City Document
export interface ICity extends Document {
  name: string;
  state?: string;
  country: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  osmPlaceId?: number;
  createdAt: Date;
}

export const CitySchema = new Schema<ICity>(
  {
    name: { type: String, required: true, trim: true, index: true },
    state: { type: String, trim: true },
    country: { type: String, default: "India" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    osmPlaceId: { type: Number, unique: true, sparse: true },
  },
  { timestamps: true }
);
CitySchema.index({ location: "2dsphere" });

// 2. Weather Cache Document with Native TTL Index
export interface IWeatherCache extends Document {
  cityNameNormalized: string;
  cityId: mongoose.Types.ObjectId;
  current: Record<string, any>;
  forecast: Array<Record<string, any>>;
  cachedAt: Date;
  expiresAt: Date;
}

export const WeatherCacheSchema = new Schema<IWeatherCache>({
  cityNameNormalized: { type: String, required: true, unique: true, lowercase: true, index: true },
  cityId: { type: Schema.Types.ObjectId, ref: "City", required: true },
  current: { type: Schema.Types.Mixed, required: true },
  forecast: { type: [Schema.Types.Mixed], required: true },
  cachedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // MongoDB deletes document automatically upon expiry!
});
```

---

## 5. Cache Strategy & In-Memory TTL Configuration

External APIs have rate limits:
- **Nominatim (OpenStreetMap)**: Max 1 request/second strictly enforced by policy.
- **OpenWeatherMap**: 60 calls/minute on free tier.

### Production Cache-Aside Pattern:
```
Client Request -> Cache Check (Redis / In-Memory Map)
    ├─ Cache Hit (TTL < 10 mins) -> Return cached payload (< 2ms)
    └─ Cache Miss -> Fetch Nominatim & OWM -> Save to Cache & DB -> Return payload (~450ms)
```

| Data Type | Cache TTL | Rationale |
| :--- | :--- | :--- |
| **Geocoding Coordinates** | 30 Days | Latitude and longitude of Indian cities never change. |
| **Current Weather** | 10 Minutes | Atmospheric conditions evolve gradually over minutes. |
| **5-Day Forecast** | 30 Minutes | Global forecasting numerical models (GFS/ECMWF) update on 3 to 6-hour cycles. |
