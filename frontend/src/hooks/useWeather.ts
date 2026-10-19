import { useState, useCallback } from "react";
import { fetchWeatherByCity, downloadForecastCSV } from "../lib/api";
import { validateCityInput } from "../lib/utils";
import type { WeatherResponse, Toast } from "../types";

interface UseWeatherReturn {
  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;
  searchedCity: string;
  weatherData: WeatherResponse | null;
  loading: boolean;
  error: string | null;
  exportDays: number;
  setExportDays: React.Dispatch<React.SetStateAction<number>>;
  exporting: boolean;
  toasts: Toast[];
  searchWeather: (searchCity?: string) => Promise<void>;
  exportCSV: () => Promise<void>;
  clearWeather: () => void;
  removeToast: (id: number) => void;
}

/**
 * Custom hook managing all weather state and operations.
 */
export function useWeather(): UseWeatherReturn {
  const [city, setCity] = useState("");
  const [searchedCity, setSearchedCity] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportDays, setExportDays] = useState(5);
  const [exporting, setExporting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "error") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const searchWeather = useCallback(
    async (searchCity?: string) => {
      const cityToSearch = searchCity ?? city;
      const validation = validateCityInput(cityToSearch);

      if (!validation.valid) {
        setError(validation.error ?? "Invalid input");
        addToast(validation.error ?? "Invalid input", "error");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchWeatherByCity(cityToSearch);
        setWeatherData(data);
        setSearchedCity(cityToSearch.trim());
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
        setWeatherData(null);
        addToast(message, "error");
      } finally {
        setLoading(false);
      }
    },
    [city, addToast]
  );

  const exportCSV = useCallback(async () => {
    if (!searchedCity) {
      addToast("Search for a city first before exporting", "error");
      return;
    }

    setExporting(true);

    try {
      await downloadForecastCSV(searchedCity, exportDays);
      addToast(`${exportDays}-day forecast CSV downloaded!`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed";
      addToast(message, "error");
    } finally {
      setExporting(false);
    }
  }, [searchedCity, exportDays, addToast]);

  const clearWeather = useCallback(() => {
    setWeatherData(null);
    setSearchedCity("");
    setCity("");
    setError(null);
  }, []);

  return {
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
  };
}
