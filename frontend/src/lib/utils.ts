import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WeatherCondition, ForecastSlot, DayForecast } from "../types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a Unix timestamp to a human-readable time string.
 */
export function formatTime(timestamp: number, timezoneOffset = 0): string {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

/**
 * Format a Unix timestamp to a readable date string.
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date for forecast grouping — returns "Today", "Tomorrow", or weekday name.
 */
export function formatDayLabel(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get weather icon CSS class based on condition code.
 */
export function getWeatherIconClass(code: number): string {
  if (code >= 200 && code < 300) return "weather-icon-storm";
  if (code >= 300 && code < 600) return "weather-icon-rain";
  if (code >= 600 && code < 700) return "weather-icon-snow";
  if (code >= 700 && code < 800) return "weather-icon-mist";
  if (code === 800) return "weather-icon-sun";
  return "weather-icon-cloud";
}

/**
 * Get weather emoji based on condition code.
 */
export function getWeatherEmoji(code: number, icon = ""): string {
  const isNight = icon.endsWith("n");
  if (code >= 200 && code < 300) return "⛈️";
  if (code >= 300 && code < 400) return "🌦️";
  if (code >= 500 && code < 600) return "🌧️";
  if (code >= 600 && code < 700) return "❄️";
  if (code >= 700 && code < 800) return "🌫️";
  if (code === 800) return isNight ? "🌙" : "☀️";
  if (code === 801) return isNight ? "🌙" : "🌤️";
  if (code === 802) return "⛅";
  return "☁️";
}

/**
 * Convert wind degree to compass direction.
 */
export function windDirection(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16] ?? "N";
}

/**
 * Validate city name — only letters, spaces, hyphens, periods allowed.
 */
export function validateCityInput(city: string): { valid: boolean; error?: string } {
  if (!city || !city.trim()) {
    return { valid: false, error: "Please enter a city name" };
  }
  const trimmed = city.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: "City name must be at least 2 characters" };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: "City name is too long" };
  }
  if (!/^[a-zA-Z\s\-.,']+$/.test(trimmed)) {
    return { valid: false, error: "City name can only contain letters, spaces, hyphens, periods, and commas" };
  }
  return { valid: true };
}

/**
 * Group forecast slots into days with aggregated stats.
 */
export function groupForecastByDay(slots: ForecastSlot[]): DayForecast[] {
  const groups = new Map<string, ForecastSlot[]>();

  for (const slot of slots) {
    const dateKey = new Date(slot.dt * 1000).toDateString();
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(slot);
    } else {
      groups.set(dateKey, [slot]);
    }
  }

  return Array.from(groups.entries()).map(([dateKey, daySlots]) => {
    const temps = daySlots.map((s) => s.temp);
    const humidities = daySlots.map((s) => s.humidity);
    const pops = daySlots.map((s) => s.pop);

    // Find the most common weather condition
    const condCounts = new Map<number, { count: number; condition: WeatherCondition }>();
    for (const s of daySlots) {
      const w = s.weather[0];
      if (w) {
        const existing = condCounts.get(w.id);
        if (existing) {
          existing.count++;
        } else {
          condCounts.set(w.id, { count: 1, condition: w });
        }
      }
    }
    const dominant = Array.from(condCounts.values()).sort((a, b) => b.count - a.count)[0]?.condition
      ?? daySlots[0]!.weather[0]!;

    return {
      label: formatDayLabel(daySlots[0]!.dt),
      date: new Date(dateKey).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" }),
      slots: daySlots,
      tempMin: Math.round(Math.min(...temps)),
      tempMax: Math.round(Math.max(...temps)),
      avgHumidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
      maxPop: Math.round(Math.max(...pops) * 100),
      dominantWeather: dominant,
    };
  });
}
