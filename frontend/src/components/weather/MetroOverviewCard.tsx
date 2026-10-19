import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Droplets, Wind, Loader2 } from "lucide-react";
import type { WeatherResponse } from "../../types";
import { fetchWeatherByCity } from "../../lib/api";
import { getWeatherEmoji } from "../../lib/utils";

interface MetroOverviewCardProps {
  cityName: string;
  stateName: string;
}

export default function MetroOverviewCard({ cityName, stateName }: MetroOverviewCardProps) {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchWeatherByCity(cityName)
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch(() => {
        // silent fallback for metro cards
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [cityName]);

  if (loading) {
    return (
      <div className="linen-card p-4 min-h-[140px] flex items-center justify-center text-[var(--color-stone-muted)]">
        <Loader2 size={18} className="animate-spin text-[var(--color-terracotta)]" />
      </div>
    );
  }

  if (!data) return null;

  const weather = data.current.weather[0];

  return (
    <Link
      to={`/city/${encodeURIComponent(cityName)}`}
      className="linen-card p-4 flex flex-col justify-between transition-all hover:scale-[1.02] group text-inherit no-underline"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-sm text-[var(--color-stone-ink)] group-hover:text-[var(--color-terracotta)] flex items-center gap-1 transition-colors">
            {cityName}
            <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <p className="text-[11px] text-[var(--color-stone-muted)]">{stateName}</p>
        </div>
        <span className="text-2xl select-none" aria-hidden="true">
          {weather ? getWeatherEmoji(weather.id, weather.icon) : "☀️"}
        </span>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold font-serif text-[var(--color-stone-ink)]">
            {Math.round(data.current.temp)}°C
          </span>
          <p className="text-[11px] capitalize text-[var(--color-stone-muted)] truncate max-w-[120px]">
            {weather?.description}
          </p>
        </div>

        <div className="text-right text-[11px] text-[var(--color-stone-muted)]">
          <p className="flex items-center justify-end gap-1">
            <Droplets size={11} className="text-[var(--color-lake)]" /> {data.current.humidity}%
          </p>
          <p className="flex items-center justify-end gap-1 mt-0.5">
            <Wind size={11} /> {data.current.wind_speed}m/s
          </p>
        </div>
      </div>
    </Link>
  );
}
