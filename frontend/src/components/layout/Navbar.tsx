import { NavLink, Link, useNavigate } from "react-router-dom";
import { CloudSun, ArrowLeftRight, Download, Star, MapPin } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";
import { Badge } from "../ui/badge";

export default function Navbar() {
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  return (
    <header className="relative z-10 w-full border-b border-[#E2DACD] bg-white/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-16 py-2 flex flex-wrap items-center justify-between gap-y-2">
        {/* Brand */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center gap-2.5 text-stone-900 font-bold text-lg tracking-tight no-underline">
            <span className="w-8 h-8 rounded-lg bg-stone-900 text-[#F8F5EE] flex items-center justify-center shadow-xs">
              <CloudSun size={18} />
            </span>
            <span>Weather Forecast</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex w-full items-center gap-1 sm:w-auto" aria-label="Main Navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  isActive
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-[#F2ECE1] hover:text-stone-900"
                }`
              }
            >
              Forecast
            </NavLink>
            <NavLink
              to="/compare"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  isActive
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-[#F2ECE1] hover:text-stone-900"
                }`
              }
            >
              <ArrowLeftRight size={13} />
              <span>Compare</span>
            </NavLink>
            <NavLink
              to="/export"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  isActive
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-[#F2ECE1] hover:text-stone-900"
                }`
              }
            >
              <Download size={13} />
              <span>Export Hub</span>
            </NavLink>
          </nav>
        </div>

        {/* Right side: Saved cities & Region badge */}
        <div className="flex items-center gap-3">
          {favorites.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 bg-[#F2ECE1] border border-[#E2DACD] py-1 px-3 rounded-full text-xs">
              <Star size={12} className="text-[#D97706] fill-[#D97706]" />
              <span className="text-stone-500 font-medium">Saved:</span>
              {favorites.slice(0, 3).map((fav) => (
                <button
                  key={fav}
                  type="button"
                  onClick={() => navigate(`/city/${encodeURIComponent(fav)}`)}
                  className="font-semibold text-stone-900 hover:text-[#C25E34] hover:underline px-1 transition-colors cursor-pointer"
                >
                  {fav}
                </button>
              ))}
            </div>
          )}

          <Badge variant="secondary" className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-stone-700 uppercase tracking-wider">
            <MapPin size={11} className="text-[#C25E34]" />
            <span>Global coverage</span>
          </Badge>
        </div>
      </div>
    </header>
  );
}
