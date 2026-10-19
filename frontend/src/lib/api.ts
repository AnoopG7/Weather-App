import axios from "axios";
import type { WeatherResponse, CompareResponse } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Search for weather data by city name.
 * Calls backend to geocode via Nominatim and fetch OWM data.
 */
export async function fetchWeatherByCity(city: string): Promise<WeatherResponse> {
  const trimmed = city.trim();
  if (!trimmed) {
    throw new Error("Please enter a city name.");
  }

  try {
    const response = await api.get<WeatherResponse>("/weather", {
      params: { city: trimmed },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data && typeof error.response.data === "object") {
        const errorData = error.response.data as { error?: string };
        if (errorData.error) {
          throw new Error(errorData.error);
        }
      }

      if (error.code === "ECONNABORTED") {
        throw new Error("Weather request timed out. Please try again.");
      }

      if (!error.response) {
        throw new Error(
          "Cannot reach the backend server. Please ensure the backend is running on port 3001 (or run `npm run dev` from the project root)."
        );
      }

      if (error.response.status === 404) {
        throw new Error(`Could not find "${trimmed}". Please check the spelling or add a country.`);
      }

      if (error.response.status === 500) {
        throw new Error("Server error while fetching weather data. Please try again.");
      }
    }

    throw new Error("An unexpected error occurred while fetching weather data.");
  }
}

/**
 * Compare weather between two cities.
 */
export async function compareCities(city1: string, city2: string): Promise<CompareResponse> {
  const c1 = city1.trim();
  const c2 = city2.trim();
  if (!c1 || !c2) {
    throw new Error("Please provide two cities to compare.");
  }

  try {
    const response = await api.get<CompareResponse>("/compare", {
      params: { city1: c1, city2: c2 },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as { error?: string };
      if (errorData.error) throw new Error(errorData.error);
    }
    throw new Error("Unable to compare weather for the selected cities.");
  }
}

/**
 * Download forecast data as a CSV file.
 */
export async function downloadForecastCSV(city: string, days: number = 5): Promise<void> {
  const trimmed = city.trim();
  if (!trimmed) {
    throw new Error("City name is required for export.");
  }

  try {
    const response = await api.get("/export/csv", {
      params: { city: trimmed, days },
      responseType: "blob",
    });

    const blob = new Blob([response.data as BlobPart], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${trimmed.toLowerCase().replace(/\s+/g, "_")}_weather_${days}day.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      try {
        const text = await (error.response.data as Blob).text();
        const data = JSON.parse(text) as { error?: string };
        throw new Error(data.error ?? "Failed to export forecast CSV.");
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message !== "Failed to export forecast CSV.") {
          throw new Error("Failed to export forecast CSV.");
        }
        throw parseError;
      }
    }
    throw new Error("Unable to download CSV. Please check that the server is running.");
  }
}
