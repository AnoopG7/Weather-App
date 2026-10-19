import { Search, Loader2, X } from "lucide-react";
import type { FormEvent, ChangeEvent } from "react";

interface SearchBarProps {
  city: string;
  onCityChange: (value: string) => void;
  onSearch: (selectedCity?: string) => void;
  loading: boolean;
  error: string | null;
}

const POPULAR_CITIES = [
  "Mumbai",
  "Bengaluru",
  "Delhi",
  "Jaipur",
  "Kochi",
  "Kolkata",
];

export default function SearchBar({
  city,
  onCityChange,
  onSearch,
  loading,
  error,
}: SearchBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onCityChange(e.target.value);
  };

  const handleChipClick = (cityName: string) => {
    onCityChange(cityName);
    onSearch(cityName);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} role="search" aria-label="Search cities worldwide">
        <div className="search-box">
          <div className="search-icon-wrapper" aria-hidden="true">
            {loading ? (
              <Loader2 size={18} className="animate-spin text-[var(--color-terracotta)]" />
            ) : (
              <Search size={18} />
            )}
          </div>

          <input
            id="city-search-input"
            type="text"
            className="search-input"
            placeholder="Search any city (e.g. Mumbai, London, Tokyo)..."
            value={city}
            onChange={handleChange}
            disabled={loading}
            autoComplete="off"
            aria-label="Enter a city name"
            aria-invalid={!!error}
            aria-describedby={error ? "search-error" : undefined}
          />

          {city && !loading && (
            <button
              type="button"
              onClick={() => onCityChange("")}
              className="absolute right-28 text-[var(--color-stone-muted)] hover:text-[var(--color-stone-ink)] p-1.5 transition-colors"
              aria-label="Clear input"
            >
              <X size={15} />
            </button>
          )}

          <button
            id="search-button"
            type="submit"
            disabled={loading || !city.trim()}
            className="search-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Searching</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>

        {error && (
          <p
            id="search-error"
            className="mt-2.5 text-xs font-medium text-[var(--color-error-warm)] bg-[var(--color-error-tint)] py-1.5 px-3 rounded-md inline-block"
            role="alert"
          >
            {error}
          </p>
        )}
      </form>

      {/* Suggested Quick Cities */}
      <div className="quick-chips-wrapper" aria-label="Popular cities">
        <span className="quick-chips-label">Popular:</span>
        {POPULAR_CITIES.map((name) => (
          <button
            key={name}
            type="button"
            className="city-chip"
            onClick={() => handleChipClick(name)}
            disabled={loading}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
