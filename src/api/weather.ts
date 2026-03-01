import axios from "axios";
import type {
  WeatherForecastResponse,
  GeocodingResult,
} from "../types/weather";

const BASE_URL = "https://api.open-meteo.com/v1";

export const weatherApi = {
  async getForecast(
    latitude: number,
    longitude: number,
    timezone: string = "auto",
  ): Promise<WeatherForecastResponse> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      timezone,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "weather_code",
        "cloud_cover",
        "pressure_msl",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
      ].join(","),
      hourly: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation_probability",
        "precipitation",
        "weather_code",
        "cloud_cover",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "sunrise",
        "sunset",
        "daylight_duration",
        "sunshine_duration",
        "uv_index_max",
        "precipitation_sum",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "wind_gusts_10m_max",
        "wind_direction_10m_dominant",
      ].join(","),
      forecast_days: "7",
    });

    const response = await axios.get<WeatherForecastResponse>(
      `${BASE_URL}/forecast?${params}`,
    );
    return response.data;
  },

  async searchLocations(query: string): Promise<GeocodingResult[]> {
    if (!query || query.length < 2) return [];

    const params = new URLSearchParams({
      name: query,
      count: "10",
      language: "en",
      format: "json",
    });

    const response = await axios.get<{ results: GeocodingResult[] }>(
      `https://geocoding-api.open-meteo.com/v1/search?${params}`,
    );
    return response.data.results || [];
  },
  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<GeocodingResult | null> {
    // Open-Meteo's geocoding API only does text search, not reverse lookup.
    // Use Nominatim (OSM) for proper reverse geocoding.
    const response = await axios.get<{
      lat: string;
      lon: string;
      address: {
        city?: string;
        town?: string;
        village?: string;
        hamlet?: string;
        state?: string;
        country?: string;
        country_code?: string;
      };
    }>("https://nominatim.openstreetmap.org/reverse", {
      params: { lat: latitude, lon: longitude, format: "json" },
      headers: { "User-Agent": "StarWeather/1.0" },
    });

    const { address, lat, lon } = response.data;
    const name =
      address.city ?? address.town ?? address.village ?? address.hamlet;
    if (!name) return null;

    return {
      id: 0,
      name,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      country: address.country ?? "",
      country_code: (address.country_code ?? "").toUpperCase(),
      admin1: address.state,
    };
  },
};
