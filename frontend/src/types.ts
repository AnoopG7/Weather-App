// ─── Weather API Response Types ────────────────────────

/** Coordinates returned by Nominatim / stored on weather response */
export interface LocationInfo {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

/** Single weather condition entry from OWM */
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

/** Current weather data (from OWM /weather endpoint) */
export interface CurrentWeather {
  dt: number;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  clouds: number;
  weather: WeatherCondition[];
  sunrise: number;
  sunset: number;
  timezone: number;
}

/** Single 3-hour forecast slot from OWM */
export interface ForecastSlot {
  dt: number;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  clouds: number;
  pop: number; // probability of precipitation (0-1)
  rain_3h?: number; // rain volume for 3h, mm
  snow_3h?: number; // snow volume for 3h, mm
  weather: WeatherCondition[];
  dt_txt: string;
}

/** Full API response from our backend */
export interface WeatherResponse {
  location: LocationInfo;
  current: CurrentWeather;
  forecast: ForecastSlot[];
}

/** Comparison response for 2 cities */
export interface CompareResponse {
  city1: WeatherResponse;
  city2: WeatherResponse;
  comparison: {
    tempDiff: number;
    warmerCity: string;
    humidityDiff: number;
    moreHumidCity: string;
  };
}

// ─── Component Prop Types ──────────────────────────────

export interface Toast {
  id: number;
  message: string;
  type: "error" | "success" | "info";
}

/** Grouped forecast: one day with its 3-hour slots */
export interface DayForecast {
  label: string;
  date: string;
  slots: ForecastSlot[];
  tempMin: number;
  tempMax: number;
  avgHumidity: number;
  maxPop: number;
  dominantWeather: WeatherCondition;
}
