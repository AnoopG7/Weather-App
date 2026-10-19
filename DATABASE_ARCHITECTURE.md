# Database Architecture

## Current Runtime

The backend currently does not connect to a database. Weather responses and geocoding results are stored in the in-memory `CacheService`, which uses a JavaScript `Map` with TTL values:

- Geocoding results: 24 hours
- Weather responses: 10 minutes
- Cache contents: cleared when the backend restarts

This keeps the project simple while it uses the Nominatim and OpenWeatherMap APIs directly. The PostgreSQL schema below is the planned persistence layer; it is not automatically created or queried by the current server.

## PostgreSQL Direction

PostgreSQL is the only database direction for this project. It provides:

- Relational city and location metadata with unique constraints
- JSONB storage for variable current-weather and forecast payloads
- ACID transactions for search and export records
- Indexes for city lookups, coordinates, cache expiry, and audit history

The schema can be connected later with the native `pg` driver or another PostgreSQL-focused query layer.

## SQL Schema

The canonical SQL definition lives at `backend/src/db/schema.sql`.

```sql
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    country_code CHAR(2),
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    osm_place_id BIGINT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_city_state_country
      UNIQUE (LOWER(name), LOWER(COALESCE(state, '')), country_code)
);

CREATE TABLE weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    city_name_normalized VARCHAR(100) NOT NULL UNIQUE,
    current_weather JSONB NOT NULL,
    forecast_5day JSONB NOT NULL,
    cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE search_logs (
    id BIGSERIAL PRIMARY KEY,
    query_string VARCHAR(100) NOT NULL,
    resolved_city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    response_time_ms INTEGER NOT NULL,
    cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
    status_code SMALLINT NOT NULL,
    searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE export_logs (
    id BIGSERIAL PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    days_requested SMALLINT NOT NULL CHECK (days_requested BETWEEN 1 AND 5),
    rows_count INTEGER NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    exported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Integration Plan

When durable persistence is needed:

1. Add a PostgreSQL connection using `pg` and `DATABASE_URL`.
2. Create the schema from `backend/src/db/schema.sql`.
3. Move cacheable weather and geocoding records from `CacheService` into `weather_cache` and retain the in-memory layer as a short-lived read-through cache.
4. Write search and export telemetry to `search_logs` and `export_logs`.
5. Keep API keys and database credentials in `backend/.env`.

Until that integration is implemented, the app remains database-free at runtime and uses only the in-memory cache.
