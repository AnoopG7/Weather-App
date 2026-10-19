import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-[#E2DACD] bg-white/50 mt-16 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <div>
          <p className="font-bold text-stone-900 text-sm">Weather Forecast</p>
          <p className="text-stone-500 mt-0.5">Real-time observations and 5-day predictive meteorological telemetry.</p>
        </div>

        <div className="flex items-center gap-6 font-semibold">
          <Link to="/" className="text-stone-600 hover:text-stone-900 transition-colors">
            Forecast
          </Link>
          <Link to="/compare" className="text-stone-600 hover:text-stone-900 transition-colors">
            Compare Cities
          </Link>
          <Link to="/export" className="text-stone-600 hover:text-stone-900 transition-colors">
            CSV Export Hub
          </Link>
        </div>

        <div className="text-right text-[11px] text-stone-400">
          <p>Coordinates via OpenStreetMap Nominatim</p>
          <p>Atmospheric telemetry via OpenWeatherMap API</p>
        </div>
      </div>
    </footer>
  );
}
