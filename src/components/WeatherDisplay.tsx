import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  WeatherForecastResponse,
  GeocodingResult,
} from "../types/weather";
import { WEATHER_CODES } from "../types/weather";
import { HourlyChart } from "./HourlyChart";

interface WeatherDisplayProps {
  data: WeatherForecastResponse | undefined;
  location: GeocodingResult | null;
}

export function WeatherDisplay({ data, location }: WeatherDisplayProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  if (!data || !location) return null;

  const { current, daily } = data;
  const currentWeather = current ? WEATHER_CODES[current.weather_code] : null;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getWindDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(degrees / 45) % 8];
  };

  const getPrecipIcon = (code: number) => {
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "🌩️";
    return "💧";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full flex flex-col gap-8"
    >
      {/* ── Current Conditions – Centerpiece ──────────────────────── */}
      {current && (
        <div className="glass-hero p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Left: location + temp */}
            <div className="flex-1 flex flex-col items-center md:items-start gap-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-50 tracking-tight truncate max-w-full">
                {location.name}
              </h2>
              <p className="text-purple-300/50 text-xs font-medium uppercase tracking-[0.2em]">
                {location.admin1 && `${location.admin1}, `}
                {location.country}
              </p>

              <div className="flex items-center gap-4 mt-4">
                <span className="text-7xl sm:text-8xl select-none">
                  {currentWeather?.icon || "🌡️"}
                </span>
                <div>
                  <div className="text-5xl sm:text-6xl font-light text-purple-50 tracking-tighter flex items-start">
                    {Math.round(current.temperature_2m)}
                    <span className="text-xl mt-1 font-normal text-purple-400">
                      °C
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-purple-400 tracking-[0.12em] uppercase mt-0.5">
                    {currentWeather?.description || "Unknown"}
                  </div>
                  <div className="text-[11px] text-purple-300/40 mt-1">
                    Feels like {Math.round(current.apparent_temperature)}°
                  </div>
                </div>
              </div>
            </div>

            {/* Right: stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:w-[360px]">
              <StatTile
                label="Humidity"
                value={`${current.relative_humidity_2m}`}
                unit="%"
              />
              <StatTile
                label="Wind"
                value={`${Math.round(current.wind_speed_10m)}`}
                unit="km/h"
                sub={getWindDirection(current.wind_direction_10m)}
              />
              <StatTile
                label="Gusts"
                value={`${Math.round(current.wind_gusts_10m)}`}
                unit="km/h"
              />
              <StatTile
                label="Pressure"
                value={`${Math.round(current.pressure_msl)}`}
                unit="hPa"
              />
              <StatTile
                label="Cloud Cover"
                value={`${current.cloud_cover}`}
                unit="%"
              />
              <StatTile
                label="Precipitation"
                value={`${current.precipitation}`}
                unit="mm"
              />
            </div>
          </div>

          {/* Hourly charts for today */}
          <div className="mt-6 pt-6 border-t border-purple-500/10">
            <HourlyChart data={data} />
          </div>
        </div>
      )}

      {/* ── 7-Day Forecast ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-purple-300/50 uppercase tracking-[0.25em] px-1">
          7-Day Forecast
        </h3>

        <div className="flex flex-col gap-2">
          {daily.time.map((date, index) => {
            const weatherCode = daily.weather_code?.[index] ?? 0;
            const weather = WEATHER_CODES[weatherCode];
            const maxTemp = daily.temperature_2m_max?.[index];
            const minTemp = daily.temperature_2m_min?.[index];
            const precipProb = daily.precipitation_probability_max?.[index];
            const isExpanded = expandedDay === index;

            return (
              <div key={date}>
                {/* Day row – clickable */}
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  onClick={() =>
                    setExpandedDay(isExpanded ? null : index)
                  }
                  className={`w-full glass px-4 py-3 flex items-center gap-4 text-left cursor-pointer select-none transition-all duration-200 ${
                    isExpanded
                      ? "!border-purple-500/40 !bg-purple-500/[0.08]"
                      : ""
                  }`}
                >
                  {/* Day name */}
                  <span className="w-20 text-xs font-semibold text-purple-200 tracking-wide truncate">
                    {index === 0 ? "Today" : formatDate(date)}
                  </span>

                  {/* Icon */}
                  <span className="text-2xl select-none">
                    {weather?.icon || "🌡️"}
                  </span>

                  {/* Temps */}
                  <span className="flex-1 flex items-center gap-2 justify-end text-sm">
                    <span className="text-purple-300/50 font-medium">
                      {minTemp !== undefined
                        ? `${Math.round(minTemp)}°`
                        : "--"}
                    </span>
                    <span className="w-16 h-1 rounded-full bg-gradient-to-r from-purple-500/20 via-purple-400/40 to-purple-500/20" />
                    <span className="text-purple-100 font-bold">
                      {maxTemp !== undefined
                        ? `${Math.round(maxTemp)}°`
                        : "--"}
                    </span>
                  </span>

                  {/* Precip badge */}
                  <span className="w-14 text-right">
                    {precipProb !== undefined && precipProb > 0 ? (
                      <span className="text-[10px] font-bold text-sky-300/80">
                        {getPrecipIcon(weatherCode)} {precipProb}%
                      </span>
                    ) : null}
                  </span>

                  {/* Expand chevron */}
                  <svg
                    className={`w-4 h-4 text-purple-400/50 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="overflow-hidden"
                    >
                      <div className="glass-static !rounded-t-none !border-t-0 px-4 py-5 flex flex-col gap-5">
                        {/* Detail tiles */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <DetailTile
                            label="UV Index"
                            value={`${daily.uv_index_max?.[index]?.toFixed(1) ?? "--"}`}
                          />
                          <DetailTile
                            label="Sunrise"
                            value={
                              daily.sunrise?.[index]
                                ? new Date(
                                    daily.sunrise[index],
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "--"
                            }
                          />
                          <DetailTile
                            label="Sunset"
                            value={
                              daily.sunset?.[index]
                                ? new Date(
                                    daily.sunset[index],
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "--"
                            }
                          />
                          <DetailTile
                            label="Precipitation"
                            value={`${daily.precipitation_sum?.[index] ?? 0} mm`}
                            icon={getPrecipIcon(weatherCode)}
                          />
                          <DetailTile
                            label="Max Wind"
                            value={`${Math.round(daily.wind_speed_10m_max?.[index] ?? 0)}`}
                            unit="km/h"
                          />
                          <DetailTile
                            label="Max Gusts"
                            value={`${Math.round(daily.wind_gusts_10m_max?.[index] ?? 0)}`}
                            unit="km/h"
                          />
                          <DetailTile
                            label="Wind Dir"
                            value={getWindDirection(
                              daily.wind_direction_10m_dominant?.[index] ?? 0,
                            )}
                          />
                          <DetailTile
                            label="Daylight"
                            value={
                              daily.daylight_duration?.[index]
                                ? `${(daily.daylight_duration[index] / 3600).toFixed(1)}h`
                                : "--"
                            }
                          />
                          <DetailTile
                            label="Sunshine"
                            value={
                              daily.sunshine_duration?.[index] !== undefined
                                ? `${(daily.sunshine_duration[index] / 3600).toFixed(1)}h`
                                : "--"
                            }
                          />
                          <DetailTile
                            label="Feels Max"
                            value={
                              daily.apparent_temperature_max?.[index] !== undefined
                                ? `${Math.round(daily.apparent_temperature_max[index])}°`
                                : "--"
                            }
                          />
                          <DetailTile
                            label="Feels Min"
                            value={
                              daily.apparent_temperature_min?.[index] !== undefined
                                ? `${Math.round(daily.apparent_temperature_min[index])}°`
                                : "--"
                            }
                          />
                          <DetailTile
                            label="Condition"
                            value={weather?.description ?? "Unknown"}
                          />
                        </div>

                        {/* Hourly chart for selected day */}
                        <HourlyChart data={data} dayIndex={index} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Reusable Tiles ─────────────────────────────────────────────────── */

function StatTile({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="glass-static p-3 flex flex-col items-center justify-center text-center gap-0.5">
      <span className="text-[9px] text-purple-300/40 uppercase tracking-[0.2em]">
        {label}
      </span>
      <span className="text-lg font-bold text-purple-50">
        {value}
        {unit && (
          <span className="text-[10px] font-normal text-purple-400 ml-0.5">
            {unit}
          </span>
        )}
      </span>
      {sub && (
        <span className="text-[10px] text-purple-300/40 font-medium">
          {sub}
        </span>
      )}
    </div>
  );
}

function DetailTile({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  icon?: string;
}) {
  return (
    <div className="glass-static p-3 flex flex-col gap-0.5 items-center text-center">
      <span className="text-[9px] text-purple-300/40 uppercase tracking-[0.2em]">
        {label}
      </span>
      <span className="font-bold text-purple-100 text-sm flex items-center gap-1">
        {icon && <span>{icon}</span>}
        {value}
        {unit && (
          <span className="text-[9px] font-normal text-purple-400">{unit}</span>
        )}
      </span>
    </div>
  );
}
