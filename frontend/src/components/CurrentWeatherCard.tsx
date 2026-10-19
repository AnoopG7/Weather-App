import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  CloudRain,
  ArrowUp,
  ArrowDown,
  MapPin,
  Compass,
} from "lucide-react";
import type { CurrentWeather, LocationInfo } from "../types";
import { getWeatherEmoji, windDirection, formatTime } from "../lib/utils";

interface CurrentWeatherCardProps {
  current: CurrentWeather;
  location: LocationInfo;
}

export default function CurrentWeatherCard({ current, location }: CurrentWeatherCardProps) {
  const weather = current.weather[0];
  if (!weather) return null;

  const emoji = getWeatherEmoji(weather.id, weather.icon);
  const windDir = windDirection(current.wind_deg);

  return (
    <article className="current-hero-card" aria-label="Current Weather Conditions">
      {/* Top Header Strip: Location & Status */}
      <div className="weather-header-strip">
        <div className="location-badge">
          <MapPin size={16} className="text-[var(--color-terracotta)]" />
          <span>
            {location.name}
            {location.state ? `, ${location.state}` : ""}, {location.country}
          </span>
          <span className="location-coords">
            {location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E
          </span>
        </div>

        <div className="live-indicator">
          <span className="live-dot" />
          <span>Live Observation</span>
        </div>
      </div>

      {/* Main Temperature & Weather Row */}
      <div className="main-temp-display">
        <div className="flex items-center gap-5">
          <span className="text-6xl md:text-7xl select-none" aria-hidden="true">
            {emoji}
          </span>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="temp-huge">{Math.round(current.temp)}°</span>
              <span className="text-2xl font-semibold text-[var(--color-stone-muted)]">C</span>
            </div>
            <p className="condition-tagline">{weather.description}</p>
            <div className="temp-meta-row">
              <span className="flex items-center gap-1">
                <Thermometer size={14} className="text-[var(--color-stone-subtle)]" />
                Feels like {Math.round(current.feels_like)}°C
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-medium text-[var(--color-stone-ink)]">
                <ArrowUp size={13} className="text-[var(--color-terracotta)]" />
                {Math.round(current.temp_max)}°
              </span>
              <span className="flex items-center gap-1 font-medium text-[var(--color-stone-ink)]">
                <ArrowDown size={13} className="text-[var(--color-lake)]" />
                {Math.round(current.temp_min)}°
              </span>
            </div>
          </div>
        </div>

        {/* Sunrise & Sunset Block */}
        <div className="sun-times-card">
          <div className="sun-time-block">
            <Sunrise size={20} className="text-[var(--color-amber-sun)]" />
            <div>
              <p className="sun-time-label">Sunrise</p>
              <p className="sun-time-val">{formatTime(current.sunrise, current.timezone)}</p>
            </div>
          </div>
          <div className="w-px bg-[var(--color-linen-border)]" aria-hidden="true" />
          <div className="sun-time-block">
            <Sunset size={20} className="text-[var(--color-terracotta)]" />
            <div>
              <p className="sun-time-label">Sunset</p>
              <p className="sun-time-val">{formatTime(current.sunset, current.timezone)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Weather Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-tile-label">Humidity</span>
            <Droplets size={16} className="text-[var(--color-lake)]" />
          </div>
          <p className="metric-tile-val">{current.humidity}%</p>
          <p className="metric-tile-sub">Relative moisture</p>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-tile-label">Wind Speed</span>
            <Wind size={16} className="text-[var(--color-stone-muted)]" />
          </div>
          <p className="metric-tile-val">{current.wind_speed} <span className="text-sm font-normal">m/s</span></p>
          <p className="metric-tile-sub flex items-center gap-1">
            <Compass size={12} /> {windDir} ({current.wind_deg}°)
          </p>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-tile-label">Pressure</span>
            <Gauge size={16} className="text-[var(--color-stone-muted)]" />
          </div>
          <p className="metric-tile-val">{current.pressure} <span className="text-sm font-normal">hPa</span></p>
          <p className="metric-tile-sub">Atmospheric</p>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-tile-label">Visibility</span>
            <Eye size={16} className="text-[var(--color-sage)]" />
          </div>
          <p className="metric-tile-val">{(current.visibility / 1000).toFixed(1)} <span className="text-sm font-normal">km</span></p>
          <p className="metric-tile-sub">Horizontal sight</p>
        </div>

        <div className="metric-tile">
          <div className="metric-tile-header">
            <span className="metric-tile-label">Cloud Cover</span>
            <CloudRain size={16} className="text-[var(--color-lake)]" />
          </div>
          <p className="metric-tile-val">{current.clouds}%</p>
          <p className="metric-tile-sub">Sky overcast</p>
        </div>

        {current.wind_gust !== undefined && (
          <div className="metric-tile">
            <div className="metric-tile-header">
              <span className="metric-tile-label">Wind Gust</span>
              <Wind size={16} className="text-[var(--color-terracotta)]" />
            </div>
            <p className="metric-tile-val">{current.wind_gust} <span className="text-sm font-normal">m/s</span></p>
            <p className="metric-tile-sub">Peak gust</p>
          </div>
        )}
      </div>
    </article>
  );
}
