import { Umbrella, Wind } from "lucide-react";
import type { ForecastSlot } from "../../types";
import { getWeatherEmoji, formatTime } from "../../lib/utils";

interface HourlyTimelineProps {
  slots: ForecastSlot[];
  timezoneOffset?: number;
}

export default function HourlyTimeline({ slots, timezoneOffset = 19800 }: HourlyTimelineProps) {
  // Take next 8 slots (24 hours: 8 x 3 hours)
  const next24Hours = slots.slice(0, 8);

  return (
    <div className="linen-card p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="eyebrow">Hourly Telemetry</span>
          <h3 className="text-base font-bold text-[var(--color-stone-ink)]">Next 24 Hours</h3>
        </div>
        <span className="text-xs text-[var(--color-stone-muted)] font-medium">3-Hour Intervals</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {next24Hours.map((slot) => {
          const weather = slot.weather[0];
          const popPercent = Math.round(slot.pop * 100);
          return (
            <div
              key={slot.dt}
              className="flex-shrink-0 flex flex-col items-center justify-between p-3.5 rounded-xl bg-[var(--color-linen-base)] border border-[var(--color-linen-border)] min-w-[100px] text-center transition-all hover:bg-[var(--color-linen-card)] hover:border-[var(--color-linen-border-strong)]"
            >
              <p className="text-xs font-semibold text-[var(--color-stone-muted)]">
                {formatTime(slot.dt, timezoneOffset)}
              </p>
              <span className="text-2xl my-2 select-none" aria-hidden="true">
                {weather ? getWeatherEmoji(weather.id, weather.icon) : "🌤️"}
              </span>
              <p className="text-lg font-bold text-[var(--color-stone-ink)]">
                {Math.round(slot.temp)}°
              </p>
              <div className="mt-2 flex flex-col items-center gap-1 text-[11px] text-[var(--color-stone-muted)]">
                <span className="flex items-center gap-0.5 text-[var(--color-lake)] font-semibold">
                  <Umbrella size={11} /> {popPercent}%
                </span>
                <span className="flex items-center gap-0.5">
                  <Wind size={10} /> {slot.wind_speed}m/s
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
