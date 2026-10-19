import "dotenv/config";
import axios, { AxiosError } from "axios";
import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { Parser } from "json2csv";
import { cacheService } from "./services/cacheService.js";
import type {
  CurrentWeather,
  ForecastSlot,
  NominatimPlace,
  OpenWeatherCurrentRaw,
  OpenWeatherForecastRaw,
  OpenWeatherForecastItemRaw,
  WeatherResponse,
} from "./types.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const openWeatherBase = "https://api.openweathermap.org/data/2.5";

const nominatim = axios.create({
  headers: {
    "User-Agent": "Weather-Forecast-App/1.0",
    Accept: "application/json",
  },
  timeout: 10000,
});

app.use(cors());
app.use(express.json());

// Request rate limiting: 120 requests per minute
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please wait a moment before trying again." },
  })
);

function validateCity(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const city = value.trim();
  if (city.length < 2 || city.length > 100 || !/^[a-zA-Z\s.,\-']+$/.test(city)) {
    return null;
  }
  return city;
}

function mapCurrent(data: OpenWeatherCurrentRaw): CurrentWeather {
  return {
    dt: data.dt,
    temp: Math.round(data.main.temp * 10) / 10,
    feels_like: Math.round(data.main.feels_like * 10) / 10,
    temp_min: Math.round(data.main.temp_min * 10) / 10,
    temp_max: Math.round(data.main.temp_max * 10) / 10,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    visibility: data.visibility ?? 0,
    wind_speed: Math.round((data.wind?.speed ?? 0) * 10) / 10,
    wind_deg: data.wind?.deg ?? 0,
    wind_gust: data.wind?.gust !== undefined ? Math.round(data.wind.gust * 10) / 10 : undefined,
    clouds: data.clouds?.all ?? 0,
    weather: data.weather,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    timezone: data.timezone,
  };
}

function mapForecast(item: OpenWeatherForecastItemRaw): ForecastSlot {
  return {
    dt: item.dt,
    temp: Math.round(item.main.temp * 10) / 10,
    feels_like: Math.round(item.main.feels_like * 10) / 10,
    temp_min: Math.round(item.main.temp_min * 10) / 10,
    temp_max: Math.round(item.main.temp_max * 10) / 10,
    humidity: item.main.humidity,
    pressure: item.main.pressure,
    wind_speed: Math.round((item.wind?.speed ?? 0) * 10) / 10,
    wind_deg: item.wind?.deg ?? 0,
    wind_gust: item.wind?.gust !== undefined ? Math.round(item.wind.gust * 10) / 10 : undefined,
    clouds: item.clouds?.all ?? 0,
    pop: item.pop ?? 0,
    rain_3h: item.rain?.["3h"],
    snow_3h: item.snow?.["3h"],
    weather: item.weather,
    dt_txt: item.dt_txt,
  };
}

async function getWeather(city: string): Promise<WeatherResponse> {
  const normalizedKey = city.toLowerCase().trim();
  const cacheKey = `weather:${normalizedKey}`;

  // 1. Check in-memory TTL cache (10 min expiry)
  const cached = cacheService.get<WeatherResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();
  if (!apiKey) {
    const err = new Error("OpenWeatherMap API key is missing. Add OPENWEATHER_API_KEY in backend/.env");
    (err as { status?: number }).status = 500;
    throw err;
  }

  // 2. Geocode city globally via Nominatim, cached for 24h
  const geoCacheKey = `geo:${normalizedKey}`;
  let location = cacheService.get<NominatimPlace>(geoCacheKey);

  if (!location) {
    try {
      // Search globally; users can disambiguate duplicate names with a country.
      const res = await nominatim.get<NominatimPlace[]>(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: city,
            format: "jsonv2",
            limit: 1,
            addressdetails: 1,
          },
        }
      );
      location = res.data[0];

      if (location) {
        // Cache coordinates for 24 hours (86,400 seconds)
        cacheService.set(geoCacheKey, location, 86400);
      }
    } catch (geoErr) {
      console.error("Nominatim geocoding error:", geoErr);
    }
  }

  if (!location) {
    const error = new Error(`Could not find "${city}". Please check the spelling.`);
    (error as { status?: number }).status = 404;
    throw error;
  }

  const lat = Number(location.lat);
  const lon = Number(location.lon);

  // 3. Fetch current weather and 5-day forecast from OpenWeatherMap
  const params = {
    lat,
    lon,
    units: "metric",
    appid: apiKey,
  };

  const [currentResponse, forecastResponse] = await Promise.all([
    axios.get<OpenWeatherCurrentRaw>(`${openWeatherBase}/weather`, { params, timeout: 10000 }),
    axios.get<OpenWeatherForecastRaw>(`${openWeatherBase}/forecast`, { params, timeout: 10000 }),
  ]);

  const cityName =
    location.address?.city ||
    location.address?.town ||
    location.address?.village ||
    location.name ||
    city;

  const result: WeatherResponse = {
    location: {
      name: cityName,
      state: location.address?.state,
      country: location.address?.country || "Unknown",
      lat,
      lon,
    },
    current: mapCurrent(currentResponse.data),
    forecast: forecastResponse.data.list.map(mapForecast),
  };

  // Cache full response for 10 minutes (600 seconds)
  cacheService.set(cacheKey, result, 600);

  return result;
}

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "Weather Forecast API",
    hasApiKey: Boolean(process.env.OPENWEATHER_API_KEY?.trim()),
    cache: cacheService.getStats(),
    timestamp: new Date().toISOString(),
  });
});

// Weather API
app.get("/api/weather", async (req: Request, res: Response): Promise<void> => {
  const city = validateCity(req.query.city);
  if (!city) {
    res.status(400).json({ error: "Please enter a valid city name (letters only)." });
    return;
  }

  if (!process.env.OPENWEATHER_API_KEY?.trim()) {
    res.status(500).json({
      error: "OpenWeatherMap API key is missing. Add OPENWEATHER_API_KEY in backend/.env",
    });
    return;
  }

  try {
    const data = await getWeather(city);
    res.json(data);
  } catch (err: unknown) {
    const axiosError = err as AxiosError<{ message?: string; cod?: string }>;
    const customStatus = (err as { status?: number }).status;

    let status = customStatus || axiosError.response?.status || 500;
    let message = (err as Error).message || "Unable to fetch weather data right now.";

    if (axiosError.response?.status === 401) {
      status = 401;
      message = "The OpenWeatherMap API key in backend/.env is invalid or still activating.";
    } else if (axiosError.response?.status === 429) {
      status = 429;
      message = "OpenWeatherMap API rate limit exceeded. Please wait a minute and retry.";
    }

    res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
  }
});

// Compare Weather API (Compares two cities side-by-side)
app.get("/api/compare", async (req: Request, res: Response): Promise<void> => {
  const city1 = validateCity(req.query.city1);
  const city2 = validateCity(req.query.city2);

  if (!city1 || !city2) {
    res.status(400).json({ error: "Please provide both city1 and city2 query parameters." });
    return;
  }

  try {
    const [data1, data2] = await Promise.all([getWeather(city1), getWeather(city2)]);
    res.json({
      city1: data1,
      city2: data2,
      comparison: {
        tempDiff: Math.round((data1.current.temp - data2.current.temp) * 10) / 10,
        warmerCity: data1.current.temp >= data2.current.temp ? data1.location.name : data2.location.name,
        humidityDiff: data1.current.humidity - data2.current.humidity,
        moreHumidCity: data1.current.humidity >= data2.current.humidity ? data1.location.name : data2.location.name,
      },
    });
  } catch (err: unknown) {
    const message = (err as Error).message || "Unable to compare cities.";
    res.status(500).json({ error: message });
  }
});

// CSV Export API
app.get("/api/export/csv", async (req: Request, res: Response): Promise<void> => {
  const city = validateCity(req.query.city);
  const days = Number(req.query.days);

  if (!city) {
    res.status(400).json({ error: "Please provide a valid city name." });
    return;
  }

  if (!Number.isInteger(days) || days < 1 || days > 5) {
    res.status(400).json({ error: "Export duration must be between 1 and 5 days." });
    return;
  }

  if (!process.env.OPENWEATHER_API_KEY?.trim()) {
    res.status(500).json({
      error: "Weather service key is missing on the server.",
    });
    return;
  }

  try {
    const weather = await getWeather(city);
    const cutoffTimestamp = weather.current.dt + days * 24 * 60 * 60;
    const filteredSlots = weather.forecast.filter((slot) => slot.dt <= cutoffTimestamp);

    const rows = filteredSlots.map((slot) => ({
      City: weather.location.name,
      State: weather.location.state || "N/A",
      Country: weather.location.country,
      "Date Time": slot.dt_txt,
      "Temperature (°C)": slot.temp,
      "Feels Like (°C)": slot.feels_like,
      "Min Temp (°C)": slot.temp_min,
      "Max Temp (°C)": slot.temp_max,
      "Humidity (%)": slot.humidity,
      "Precipitation Probability (%)": Math.round(slot.pop * 100),
      "Weather Condition": slot.weather[0]?.description || "Unknown",
      "Wind Speed (m/s)": slot.wind_speed,
      "Cloud Cover (%)": slot.clouds,
      "Pressure (hPa)": slot.pressure,
    }));

    const parser = new Parser();
    const csv = parser.parse(rows);

    const sanitizedCity = weather.location.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const filename = `${sanitizedCity}_weather_${days}day_forecast.csv`;

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(filename);
    res.send(csv);
  } catch (err: unknown) {
    console.error("CSV Export error:", err);
    const message = (err as Error).message || "Unable to generate CSV export.";
    res.status(500).json({ error: message });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`\n=================================================`);
  console.log(` Weather Forecast API (TypeScript) Running`);
  console.log(` Port: ${port}`);
  console.log(` Local:   http://localhost:${port}/api/health`);
  console.log(` Network: http://127.0.0.1:${port}/api/health`);
  console.log(`=================================================\n`);
});
