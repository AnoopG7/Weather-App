-- ============================================================================
-- Production Database Schema: Weather Forecast Application
-- Compatible with PostgreSQL 14+ / CockroachDB / SQLite 3
-- ============================================================================

-- 1. Cities Registry (Stores normalized geocoding results)
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(50) NOT NULL DEFAULT 'India',
    country_code VARCHAR(2) NOT NULL DEFAULT 'IN',
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    osm_place_id BIGINT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_cities_coords ON cities(latitude, longitude);

-- 2. Weather Cache Table (Caches external OpenWeatherMap API responses)
CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    current_payload JSONB NOT NULL,
    forecast_payload JSONB NOT NULL,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_weather_cache_city UNIQUE (LOWER(city_name))
);

CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON weather_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_weather_cache_city ON weather_cache(LOWER(city_name));

-- 3. Search Audit & Analytics Logs (Tracks query performance and popular searches)
CREATE TABLE IF NOT EXISTS search_logs (
    id BIGSERIAL PRIMARY KEY,
    query_term VARCHAR(100) NOT NULL,
    resolved_city VARCHAR(100),
    ip_hash VARCHAR(64) NOT NULL,
    response_time_ms INTEGER NOT NULL,
    status_code SMALLINT NOT NULL,
    cached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(LOWER(query_term));
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);

-- 4. CSV Export Audit Logs (Tracks data exports)
CREATE TABLE IF NOT EXISTS export_logs (
    id BIGSERIAL PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    days_requested SMALLINT NOT NULL CHECK (days_requested BETWEEN 1 AND 5),
    rows_generated INTEGER NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_export_logs_city ON export_logs(LOWER(city_name));

-- 5. User Bookmarks / Saved Favorite Cities
CREATE TABLE IF NOT EXISTS favorite_cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(64) NOT NULL,
    city_name VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    display_order SMALLINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_city UNIQUE (session_id, LOWER(city_name))
);

CREATE INDEX IF NOT EXISTS idx_favorites_session ON favorite_cities(session_id);
