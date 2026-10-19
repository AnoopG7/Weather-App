import { Umbrella } from "lucide-react";
import type { DayForecast } from "../../types";
import { getWeatherEmoji } from "../../lib/utils";

interface ForecastGridProps {
  days: DayForecast[];
}

export default function ForecastGrid({ days }: ForecastGridProps) {
  return (
    <section className="mb-8" aria-labelledby="forecast-heading">
      <div className="section-header-row">
        <div>
          <span className="eyebrow">Extended Outlook</span>
          <h2 id="forecast-heading" className="section-title">
            5-Day Meteorological Forecast
          </h2>
        </div>
        <span className="section-desc">Daily aggregates from 3-hour models</span>
      </div>

      <div className="forecast-grid">
        {days.map((day) => (
          <article
            key={day.date}
            className="forecast-card"
            aria-label={`Forecast for ${day.label}`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="forecast-day-name">{day.label}</p>
                  <p className="forecast-day-date">{day.date}</p>
                </div>
                <span className="text-3xl select-none" aria-hidden="true">
                  {getWeatherEmoji(day.dominantWeather.id, day.dominantWeather.icon)}
                </span>
              </div>
              <p className="mt-3 text-xs font-medium capitalize text-[var(--color-stone-body)]">
                {day.dominantWeather.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[var(--color-linen-border)]">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="forecast-temp-main">{day.tempMax}°</span>
                  <span className="forecast-temp-low">/ {day.tempMin}°</span>
                </div>
                <span className="forecast-pill">
                  <Umbrella size={12} />
                  <span>{day.maxPop}%</span>
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[var(--color-stone-muted)]">
                Avg. humidity: {day.avgHumidity}%
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
