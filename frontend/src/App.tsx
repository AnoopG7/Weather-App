import {
  AlertCircle,
  Check,
  CloudSun,
  Download,
  Loader2,
  MapPin,
  RefreshCw,
  Umbrella,
  X,
} from "lucide-react";
import CurrentWeatherCard from "./components/CurrentWeatherCard";
import SearchBar from "./components/SearchBar";
import { useWeather } from "./hooks/useWeather";
import { getWeatherEmoji, groupForecastByDay } from "./lib/utils";
import type { DayForecast, Toast } from "./types";

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const isSuccess = toast.type === "success";
  return (
    <div className={`toast toast-${toast.type}`} role="status">
      {isSuccess ? <Check size={16} /> : <AlertCircle size={16} />}
      <span className="flex-1">{toast.message}</span>
      <button type="button" onClick={() => onRemove(toast.id)} aria-label="Dismiss notification">
        <X size={15} />
      </button>
    </div>
  );
}

function ForecastDay({ day }: { day: DayForecast }) {
  return (
    <article className="forecast-day">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="forecast-day-label">{day.label}</p>
          <p className="forecast-day-date">{day.date}</p>
        </div>
        <span className="text-4xl" aria-hidden="true">
          {getWeatherEmoji(day.dominantWeather.id, day.dominantWeather.icon)}
        </span>
      </div>
      <p className="mt-5 text-sm capitalize text-dark-text">{day.dominantWeather.description}</p>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold text-(--color-linen-100)">{day.tempMax}°</p>
          <p className="text-xs text-dark-muted">high / {day.tempMin}° low</p>
        </div>
        <div className="text-right text-xs text-dark-muted">
          <p className="flex items-center justify-end gap-1"><Umbrella size={13} /> {day.maxPop}% rain</p>
          <p className="mt-1">{day.avgHumidity}% humidity</p>
        </div>
      </div>
    </article>
  );
}

function ForecastSection({ days }: { days: DayForecast[] }) {
  return (
    <section className="section-block" aria-labelledby="forecast-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Plan ahead</p>
          <h2 id="forecast-heading">Five-day outlook</h2>
        </div>
        <span className="section-meta">3-hour readings, grouped by day</span>
      </div>
      <div className="forecast-grid">
        {days.map((day) => <ForecastDay key={day.date} day={day} />)}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="empty-state" aria-label="No weather selected">
      <div className="empty-icon"><CloudSun size={34} strokeWidth={1.5} /></div>
      <p className="eyebrow">Your forecast, at a glance</p>
      <h2>Search a city to see what the sky has planned.</h2>
      <p>Get current conditions, a five-day outlook, and a tidy CSV export for your next decision.</p>
    </section>
  );
}

export default function App() {
  const {
    city,
    setCity,
    searchedCity,
    weatherData,
    loading,
    error,
    exportDays,
    setExportDays,
    exporting,
    toasts,
    searchWeather,
    exportCSV,
    clearWeather,
    removeToast,
  } = useWeather();

  const groupedForecast = weatherData ? groupForecastByDay(weatherData.forecast) : [];

  return (
    <div className="app-shell">
      <div className="bg-grid" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="/" aria-label="Aakaash home">
          <span className="brand-mark"><CloudSun size={20} /></span>
          <span>Aakaash<span className="brand-dot">.</span></span>
        </a>
        <div className="header-note"><MapPin size={14} /> Global weather desk</div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Weather, without the guesswork</p>
            <h1>Read the sky<br /><em>before you step out.</em></h1>
            <p className="hero-description">Live conditions and a considered forecast for every city across India.</p>
          </div>
          <SearchBar city={city} onCityChange={setCity} onSearch={() => searchWeather()} loading={loading} error={error} />
          <div className="search-hint"><span /> Try Mumbai, Bengaluru, Jaipur, or Kochi</div>
        </section>

        {loading && (
          <div className="loading-state" role="status"><Loader2 className="animate-spin" size={20} /> Looking up {city.trim() || "your city"}...</div>
        )}

        {weatherData ? (
          <div className="weather-content animate-fade-in-up">
            <div className="result-toolbar">
              <div><span className="live-dot" /> Live report <span className="toolbar-city">/ {searchedCity}</span></div>
              <button type="button" className="icon-button" onClick={clearWeather} aria-label="Clear weather report" title="Clear report"><RefreshCw size={16} /></button>
            </div>
            <CurrentWeatherCard current={weatherData.current} location={weatherData.location} />
            <ForecastSection days={groupedForecast} />
            <section className="export-strip" aria-labelledby="export-heading">
              <div className="flex items-start gap-3">
                <div className="export-icon"><Download size={18} /></div>
                <div><p className="eyebrow">Take it with you</p><h2 id="export-heading">Export this forecast</h2><p>Download a clean CSV for your plans or analysis.</p></div>
              </div>
              <div className="export-actions">
                <label htmlFor="export-days">Days</label>
                <select id="export-days" className="select-custom" value={exportDays} onChange={(event) => setExportDays(Number(event.target.value))}>
                  {[1, 2, 3, 4, 5].map((days) => <option key={days} value={days}>{days} day{days > 1 ? "s" : ""}</option>)}
                </select>
                <button type="button" className="btn-primary" onClick={exportCSV} disabled={exporting}>
                  {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {exporting ? "Preparing..." : "Download CSV"}
                </button>
              </div>
            </section>
          </div>
        ) : !loading ? <EmptyState /> : null}
      </main>

      <footer className="site-footer"><span>Data from OpenWeatherMap + OpenStreetMap</span><span className="footer-rule" /><span>Built for clear decisions</span></footer>
      <div className="toast-container">{toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />)}</div>
    </div>
  );
}
