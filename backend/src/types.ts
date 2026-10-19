export interface LocationInfo {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

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
  pop: number;
  rain_3h?: number;
  snow_3h?: number;
  weather: WeatherCondition[];
  dt_txt: string;
}

export interface WeatherResponse {
  location: LocationInfo;
  current: CurrentWeather;
  forecast: ForecastSlot[];
}

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

export interface NominatimPlace {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

export interface OpenWeatherCurrentRaw {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility?: number;
  wind?: {
    speed?: number;
    deg?: number;
    gust?: number;
  };
  clouds?: {
    all?: number;
  };
  weather: WeatherCondition[];
  sys: {
    sunrise: number;
    sunset: number;
  };
  timezone: number;
}

export interface OpenWeatherForecastItemRaw {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind?: {
    speed?: number;
    deg?: number;
    gust?: number;
  };
  clouds?: {
    all?: number;
  };
  pop?: number;
  rain?: {
    "3h"?: number;
  };
  snow?: {
    "3h"?: number;
  };
  weather: WeatherCondition[];
  dt_txt: string;
}

export interface OpenWeatherForecastRaw {
  cod: string;
  message: number;
  cnt: number;
  list: OpenWeatherForecastItemRaw[];
}
