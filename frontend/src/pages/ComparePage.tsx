import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, Loader2, Thermometer, Droplets, Wind, Gauge, CloudRain, ArrowUpRight } from "lucide-react";
import type { CompareResponse } from "../types";
import { compareCities } from "../lib/api";
import { getWeatherEmoji } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const COMPARISON_PRESETS = [
  { c1: "Mumbai", c2: "Delhi" },
  { c1: "Bengaluru", c2: "Hyderabad" },
  { c1: "Jaipur", c2: "Kolkata" },
  { c1: "Kochi", c2: "Shimla" },
];

export default function ComparePage() {
  const [city1, setCity1] = useState("Mumbai");
  const [city2, setCity2] = useState("Delhi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResponse | null>(null);

  const handleCompare = async (c1Input?: string, c2Input?: string) => {
    const c1 = (c1Input ?? city1).trim();
    const c2 = (c2Input ?? city2).trim();

    if (!c1 || !c2) {
      setError("Please specify both cities to compare.");
      return;
    }

    if (c1.toLowerCase() === c2.toLowerCase()) {
      setError("Please choose two different cities to compare.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await compareCities(c1, c2);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compare cities.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (c1: string, c2: string) => {
    setCity1(c1);
    setCity2(c2);
    handleCompare(c1, c2);
  };

  return (
    <div className="py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="eyebrow">Climatic Analytics</span>
        <h1 className="hero-title text-3xl md:text-4xl">
          Side-by-Side <em>City Comparison</em>
        </h1>
        <p className="hero-subtitle mb-0">
          Compare temperature differentials, humidity variances, and cloud cover between any two locations.
        </p>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
        <span className="text-xs text-[var(--color-stone-muted)] font-semibold uppercase tracking-wider">
          Presets:
        </span>
        {COMPARISON_PRESETS.map((p) => (
          <button
            key={`${p.c1}-${p.c2}`}
            type="button"
            onClick={() => applyPreset(p.c1, p.c2)}
            className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--color-linen-panel)] hover:bg-[var(--color-linen-accent)] border border-[var(--color-linen-border)] text-[var(--color-stone-ink)] transition-colors cursor-pointer"
          >
            {p.c1} vs {p.c2}
          </button>
        ))}
      </div>

      {/* Comparator Input Box */}
      <Card className="linen-card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          <div className="md:col-span-2">
            <Label htmlFor="city1-input" className="block text-xs font-bold text-[var(--color-stone-muted)] uppercase mb-1">
              City 1 (Base)
            </Label>
            <Input
              id="city1-input"
              type="text"
              value={city1}
              onChange={(e) => setCity1(e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full h-11 px-3.5 bg-[var(--color-linen-base)] border border-[var(--color-linen-border-strong)] rounded-lg text-sm text-[var(--color-stone-ink)] font-semibold focus:outline-none focus:border-[var(--color-stone-ink)]"
            />
          </div>

          <div className="md:col-span-1 flex justify-center py-2">
            <div className="w-10 h-10 rounded-full bg-[var(--color-linen-panel)] border border-[var(--color-linen-border)] flex items-center justify-center text-[var(--color-terracotta)]">
              <ArrowLeftRight size={18} />
            </div>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="city2-input" className="block text-xs font-bold text-[var(--color-stone-muted)] uppercase mb-1">
              City 2 (Target)
            </Label>
            <Input
              id="city2-input"
              type="text"
              value={city2}
              onChange={(e) => setCity2(e.target.value)}
              placeholder="e.g. Delhi"
              className="w-full h-11 px-3.5 bg-[var(--color-linen-base)] border border-[var(--color-linen-border-strong)] rounded-lg text-sm text-[var(--color-stone-ink)] font-semibold focus:outline-none focus:border-[var(--color-stone-ink)]"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {error ? (
            <p className="text-xs text-[var(--color-error-warm)] font-medium">{error}</p>
          ) : (
            <span aria-hidden="true" />
          )}

          <Button
            type="button"
            onClick={() => handleCompare()}
            disabled={loading}
            className="px-6 h-11 bg-[var(--color-stone-ink)] hover:bg-[var(--color-terracotta)] text-[var(--color-linen-base)] text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowLeftRight size={15} />}
            <span>{loading ? "Comparing..." : "Run Comparison"}</span>
          </Button>
        </div>
      </Card>

      {/* Comparison Results */}
      {result && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Summary Insight Banner */}
          <div className="bg-[var(--color-linen-panel)] border border-[var(--color-linen-border)] rounded-xl p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="eyebrow">Analytical Summary</span>
              <p className="text-sm font-bold text-[var(--color-stone-ink)] mt-0.5">
                {result.comparison.warmerCity} is {Math.abs(result.comparison.tempDiff)}°C warmer than{" "}
                {result.comparison.warmerCity === result.city1.location.name
                  ? result.city2.location.name
                  : result.city1.location.name}
                .
              </p>
              <p className="text-xs text-[var(--color-stone-muted)] mt-1">
                {result.comparison.moreHumidCity} has {Math.abs(result.comparison.humidityDiff)}% higher relative humidity.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/city/${encodeURIComponent(result.city1.location.name)}`}
                className="text-xs font-semibold px-3 py-1.5 bg-[var(--color-linen-card)] border border-[var(--color-linen-border)] rounded-lg text-[var(--color-stone-ink)] hover:border-[var(--color-stone-ink)] inline-flex items-center gap-1 transition-colors"
              >
                {result.city1.location.name} Details <ArrowUpRight size={12} />
              </Link>
              <Link
                to={`/city/${encodeURIComponent(result.city2.location.name)}`}
                className="text-xs font-semibold px-3 py-1.5 bg-[var(--color-linen-card)] border border-[var(--color-linen-border)] rounded-lg text-[var(--color-stone-ink)] hover:border-[var(--color-stone-ink)] inline-flex items-center gap-1 transition-colors"
              >
                {result.city2.location.name} Details <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>

          {/* Side by Side Weather Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City 1 Card */}
            <div className="linen-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-stone-ink)]">{result.city1.location.name}</h3>
                  <p className="text-xs text-[var(--color-stone-muted)]">{result.city1.location.state || result.city1.location.country}</p>
                </div>
                <span className="text-4xl select-none" aria-hidden="true">
                  {getWeatherEmoji(result.city1.current.weather[0]?.id ?? 800, result.city1.current.weather[0]?.icon)}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-bold font-serif text-[var(--color-stone-ink)]">
                  {Math.round(result.city1.current.temp)}°C
                </span>
                <span className="text-xs text-[var(--color-stone-muted)] capitalize">
                  {result.city1.current.weather[0]?.description}
                </span>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--color-linen-border)] space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone-muted)] flex items-center gap-1.5">
                    <Thermometer size={13} /> Feels Like
                  </span>
                  <span className="font-bold text-[var(--color-stone-ink)]">{Math.round(result.city1.current.feels_like)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone-muted)] flex items-center gap-1.5">
                    <Droplets size={13} /> Humidity
                  </span>
                  <span className="font-bold text-[var(--color-stone-ink)]">{result.city1.current.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone-muted)] flex items-center gap-1.5">
                    <Wind size={13} /> Wind Speed
                  </span>
                  <span className="font-bold text-[var(--color-stone-ink)]">{result.city1.current.wind_speed} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone-muted)] flex items-center gap-1.5">
                    <Gauge size={13} /> Pressure
                  </span>
                  <span className="font-bold text-[var(--color-stone-ink)]">{result.city1.current.pressure} hPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone-muted)] flex items-center gap-1.5">
                    <CloudRain size={13} /> Cloud Cover
                  </span>
                  <span className="font-bold text-[var(--color-stone-ink)]">{result.city1.current.clouds}%</span>
                </div>
              </div>
            </div>

            {/* City 2 Card */}
            <div className="linen-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-stone-ink)]">{result.city2.location.name}</h3>
                  <p className="text-xs text-[var(--color-stone-muted)]">{result.city2.location.state || result.city2.location.country}</p>
                </div>
                <span className="text-4xl select-none" aria-hidden="true">
                  {getWeatherEmoji(result.city2.current.weather[0]?.id ?? 800, result.city2.current.weather[0]?.icon)}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-bold font-serif text-[var(--color-stone-ink)]">
                  {Math.round(result.city2.current.temp)}°C
                </span>
                <span className="text-xs text-[var(--color-stone-muted)] capitalize">
                  {result.city2.current.weather[0]?.description}
                </span>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--color-linen-border)] space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone-muted)] flex items-center gap-1.5">
                    <Thermometer size={13} /> Feels Like
                  </span>
                  <span className="font-bold text-[var(--color-stone-ink)]">{Math.round(result.city2.current.feels_like)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone-muted)] flex items-center gap-1.5">
                    <Droplets size={13} /> Humidity
                  </span>
                  <span className="font-bold text-[var(--color-stone-ink)]">{result.city2.current.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone-muted)] flex items-center gap-1.5">
                    <Wind size={13} /> Wind Speed
                  </span>
                  <span className="font-bold text-[var(--color-stone-ink)]">{result.city2.current.wind_speed} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone-muted)] flex items-center gap-1.5">
                    <Gauge size={13} /> Pressure
                  </span>
                  <span className="font-bold text-[var(--color-stone-ink)]">{result.city2.current.pressure} hPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-stone-muted)] flex items-center gap-1.5">
                    <CloudRain size={13} /> Cloud Cover
                  </span>
                  <span className="font-bold text-[var(--color-stone-ink)]">{result.city2.current.clouds}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
