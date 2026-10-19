import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeftRight, Download, ShieldCheck, Zap } from "lucide-react";
import SearchBar from "../components/SearchBar";
import MetroOverviewCard from "../components/weather/MetroOverviewCard";

const METROS = [
  { city: "London", state: "United Kingdom" },
  { city: "Tokyo", state: "Japan" },
  { city: "New York", state: "United States" },
  { city: "Paris", state: "France" },
  { city: "Sydney", state: "Australia" },
  { city: "Bengaluru", state: "India" },
];

export default function HomePage() {
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSearch = (selectedCity?: string) => {
    const target = (selectedCity ?? city).trim();
    if (target) {
      navigate(`/city/${encodeURIComponent(target)}`);
    }
  };

  return (
    <div className="py-6">
      {/* Hero Section */}
      <section className="hero-wrapper">
        <span className="eyebrow">Real-Time Meteorological Telemetry</span>
        <h1 className="hero-title">
          Global Weather &amp; <em>Forecasts</em>
        </h1>
        <p className="hero-subtitle">
          Accurate live observations and 5-day predictive models for cities around the world,
          powered by OpenStreetMap and OpenWeatherMap.
        </p>

        <SearchBar
          city={city}
          onCityChange={setCity}
          onSearch={handleSearch}
          loading={false}
          error={null}
        />
      </section>

      {/* Global city live overview */}
      <section className="mt-8 mb-12" aria-labelledby="metros-heading">
        <div className="section-header-row mb-4">
          <div>
            <span className="eyebrow">Regional Highlights</span>
            <h2 id="metros-heading" className="text-xl font-bold text-[var(--color-stone-ink)]">
              Global City Highlights
            </h2>
          </div>
          <span className="section-desc">Live conditions refreshed in real-time</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {METROS.map((metro) => (
            <MetroOverviewCard
              key={metro.city}
              cityName={metro.city}
              stateName={metro.state}
            />
          ))}
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="linen-card p-6 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-[var(--color-linen-panel)] text-[var(--color-terracotta)] flex items-center justify-center mb-3">
              <Zap size={18} />
            </div>
            <h3 className="font-bold text-base text-[var(--color-stone-ink)]">5-Day Predictive Outlook</h3>
            <p className="text-xs text-[var(--color-stone-muted)] mt-1.5 leading-relaxed">
              3-hour interval readings aggregated by date with min/max temperatures, precipitation probability, and wind directions.
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--color-terracotta)] mt-4 inline-block">
            Search any city above →
          </span>
        </div>

        <Link to="/compare" className="linen-card p-6 flex flex-col justify-between text-inherit no-underline group hover:border-[var(--color-stone-ink)] transition-colors">
          <div>
            <div className="w-9 h-9 rounded-lg bg-[var(--color-lake-subtle)] text-[var(--color-lake)] flex items-center justify-center mb-3">
              <ArrowLeftRight size={18} />
            </div>
            <h3 className="font-bold text-base text-[var(--color-stone-ink)] group-hover:text-[var(--color-terracotta)] transition-colors">
              Compare Two Cities
            </h3>
            <p className="text-xs text-[var(--color-stone-muted)] mt-1.5 leading-relaxed">
              Analyze climatic variance between any two locations side-by-side (e.g. London vs Tokyo humidity and temperature).
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--color-stone-ink)] group-hover:text-[var(--color-terracotta)] mt-4 inline-block">
            Launch Comparator →
          </span>
        </Link>

        <Link to="/export" className="linen-card p-6 flex flex-col justify-between text-inherit no-underline group hover:border-[var(--color-stone-ink)] transition-colors">
          <div>
            <div className="w-9 h-9 rounded-lg bg-[var(--color-amber-tint)] text-[var(--color-amber-sun)] flex items-center justify-center mb-3">
              <Download size={18} />
            </div>
            <h3 className="font-bold text-base text-[var(--color-stone-ink)] group-hover:text-[var(--color-terracotta)] transition-colors">
              Custom CSV Export Hub
            </h3>
            <p className="text-xs text-[var(--color-stone-muted)] mt-1.5 leading-relaxed">
              Generate structured, timestamped CSV reports for meteorological analysis, travel planning, or academic datasets.
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--color-stone-ink)] group-hover:text-[var(--color-terracotta)] mt-4 inline-block">
            Open Export Center →
          </span>
        </Link>
      </section>

      {/* Production Telemetry Banner */}
      <section className="bg-[var(--color-linen-panel)] border border-[var(--color-linen-border)] rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} className="text-[var(--color-sage)]" />
          <div>
            <h4 className="font-bold text-sm text-[var(--color-stone-ink)]">
              Enterprise Telemetry &amp; In-Memory Caching Enabled
            </h4>
            <p className="text-xs text-[var(--color-stone-muted)]">
              All geocoded locations cached for 24h; forecasts cached with 10-minute TTL to respect upstream quotas.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-sage)]" />
          <span className="text-xs font-bold text-[var(--color-stone-body)] uppercase tracking-wider">
            All Systems Operational
          </span>
        </div>
      </section>
    </div>
  );
}
