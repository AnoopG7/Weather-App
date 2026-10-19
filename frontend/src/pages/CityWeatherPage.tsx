import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import type { WeatherResponse } from "../types";
import { fetchWeatherByCity } from "../lib/api";
import { groupForecastByDay } from "../lib/utils";
import { useFavorites } from "../context/FavoritesContext";
import CurrentWeatherCard from "../components/CurrentWeatherCard";
import HourlyTimeline from "../components/weather/HourlyTimeline";
import ForecastGrid from "../components/weather/ForecastGrid";
import ExportCard from "../components/weather/ExportCard";

export default function CityWeatherPage() {
  const { cityName } = useParams<{ cityName: string }>();
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const loadWeather = async (cityToFetch: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWeatherByCity(cityToFetch);
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load weather data.";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cityName) {
      loadWeather(cityName);
    }
  }, [cityName]);

  const toggleFavorite = () => {
    if (!cityName) return;
    if (isFavorite(cityName)) {
      removeFavorite(cityName);
      setNotification(`Removed ${cityName} from favorites`);
    } else {
      addFavorite(cityName);
      setNotification(`Saved ${cityName} to favorites`);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Loader2 size={32} className="animate-spin text-[var(--color-terracotta)] mb-4" />
        <h2 className="text-xl font-bold text-[var(--color-stone-ink)]">
          Observing Atmosphere for {cityName}...
        </h2>
        <p className="text-sm text-[var(--color-stone-muted)] mt-1">
          Resolving coordinates via OpenStreetMap &amp; compiling OpenWeatherMap telemetry.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 max-w-xl mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-stone-ink)]">
          Could not retrieve forecast for "{cityName}"
        </h2>
        <p className="text-sm text-[var(--color-stone-muted)] mt-2 leading-relaxed">
          {error || "An unexpected error occurred while contacting meteorological servers."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 bg-[var(--color-linen-panel)] hover:bg-[var(--color-linen-accent)] border border-[var(--color-linen-border)] rounded-lg text-xs font-semibold text-[var(--color-stone-ink)] transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Back to Search
          </Link>
          <button
            type="button"
            onClick={() => cityName && loadWeather(cityName)}
            className="px-4 py-2 bg-[var(--color-stone-ink)] hover:bg-[var(--color-terracotta)] text-[var(--color-linen-base)] rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} /> Retry Query
          </button>
        </div>
      </div>
    );
  }

  const groupedForecast = groupForecastByDay(data.forecast);
  const isFav = cityName ? isFavorite(cityName) : false;

  return (
    <div className="py-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-stone-muted)] hover:text-[var(--color-stone-ink)] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Search Another City</span>
        </Link>

        <div className="flex items-center gap-2">
          {notification && (
            <span className="text-xs font-medium text-[var(--color-sage)] bg-[var(--color-sage-subtle)] px-2.5 py-1 rounded-md animate-fade-in-up">
              {notification}
            </span>
          )}
          <button
            type="button"
            onClick={toggleFavorite}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isFav
                ? "bg-[var(--color-amber-tint)] text-[var(--color-amber-sun)] border-[var(--color-amber-sun)]"
                : "bg-[var(--color-linen-card)] text-[var(--color-stone-body)] border-[var(--color-linen-border)] hover:border-[var(--color-stone-ink)]"
            }`}
            title={isFav ? "Remove from saved cities" : "Save to favorites"}
          >
            <Star size={13} className={isFav ? "fill-[var(--color-amber-sun)]" : ""} />
            <span>{isFav ? "Saved" : "Save City"}</span>
          </button>

          <button
            type="button"
            onClick={() => cityName && loadWeather(cityName)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-linen-panel)] text-[var(--color-stone-ink)] border border-[var(--color-linen-border)] hover:bg-[var(--color-linen-accent)] transition-colors cursor-pointer"
            title="Refresh weather"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Current Weather Display */}
      <CurrentWeatherCard current={data.current} location={data.location} />

      {/* Hourly Timeline (Next 24h) */}
      <HourlyTimeline slots={data.forecast} timezoneOffset={data.current.timezone} />

      {/* 5-Day Outlook */}
      <ForecastGrid days={groupedForecast} />

      {/* CSV Export Card */}
      <ExportCard
        cityName={data.location.name}
        onSuccess={(msg) => {
          setNotification(msg);
          setTimeout(() => setNotification(null), 4000);
        }}
        onError={(err) => {
          setNotification(err);
          setTimeout(() => setNotification(null), 4000);
        }}
      />
    </div>
  );
}
