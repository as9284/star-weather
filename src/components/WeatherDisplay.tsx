import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  WeatherForecastResponse,
  GeocodingResult,
} from "../types/weather";
import { WEATHER_CODES } from "../types/weather";

interface WeatherDisplayProps {
  data: WeatherForecastResponse | undefined;
  location: GeocodingResult | null;
}

export function WeatherDisplay({ data, location }: WeatherDisplayProps) {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);

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
      className="w-full flex flex-col lg:flex-row gap-8 lg:gap-10"
    >
      {/* ── LEFT: Current Conditions ──────────────────────────────── */}
      <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-6">
        <div className="px-1">
          <h2 className="text-3xl font-extrabold text-(--text) tracking-tight truncate">
            {location.name}
          </h2>
          <p className="text-(--text-muted) font-medium mt-1 uppercase tracking-[0.2em] text-xs">
            {location.admin1 && `${location.admin1}, `}
            {location.country}
          </p>
        </div>

        {current && (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="neu-elevated p-8 flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Accent glow orb */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-28 bg-(--accent) opacity-15 blur-3xl rounded-full pointer-events-none" />

            <div className="text-8xl mb-4 relative z-10 select-none">
              {currentWeather?.icon || "🌡️"}
            </div>

            <div className="text-6xl font-light text-(--text) tracking-tighter flex items-start">
              {Math.round(current.temperature_2m)}
              <span className="text-2xl mt-1.5 font-normal text-accent">°</span>
            </div>

            <div className="text-sm font-semibold text-accent mt-1 tracking-[0.15em] uppercase">
              {currentWeather?.description || "Unknown"}
            </div>

            <div className="neu-pressed-sm px-4 py-1.5 mt-4 rounded-full text-(--text-muted) text-xs font-semibold tracking-wider">
              Feels like {Math.round(current.apparent_temperature)}°
            </div>
          </motion.div>
        )}

        {/* ── Current Detail Tiles ───────────────────────────────── */}
        {current && (
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        )}
      </div>

      {/* ── RIGHT: 7-Day Forecast ────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-5 lg:mt-[72px]">
        <h3 className="text-xs font-bold text-(--text-muted) uppercase tracking-[0.25em] px-1">
          7-Day Projection
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {daily.time.map((date, index) => {
            const weatherCode = daily.weather_code?.[index] ?? 0;
            const weather = WEATHER_CODES[weatherCode];
            const maxTemp = daily.temperature_2m_max?.[index];
            const minTemp = daily.temperature_2m_min?.[index];
            const precipProb = daily.precipitation_probability_max?.[index];
            const isSelected = selectedDayIdx === index;

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                onClick={() => setSelectedDayIdx(isSelected ? null : index)}
                className={`p-5 flex flex-col items-center cursor-pointer select-none transition-all duration-300 ${
                  isSelected ? "neu-card-selected" : "neu-raised"
                }`}
                style={{ borderRadius: "1.25rem" }}
              >
                <div className="text-(--text-muted) text-[10px] font-bold tracking-[0.2em] uppercase text-center w-full pb-3 border-b border-(--text-muted)/10">
                  {index === 0 ? "Today" : formatDate(date)}
                </div>

                <div
                  className={`flex-1 flex items-center justify-center py-4 transition-all duration-300 ${
                    isSelected ? "text-5xl" : "text-4xl"
                  }`}
                >
                  {weather?.icon || "🌡️"}
                </div>

                <div className="w-full flex items-end justify-between pt-3 border-t border-(--text-muted)/10">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-(--text-muted) uppercase tracking-[0.2em]">
                      Low
                    </span>
                    <span className="font-medium text-(--text) text-sm">
                      {minTemp !== undefined ? `${Math.round(minTemp)}°` : "--"}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-(--text-muted) uppercase tracking-[0.2em]">
                      High
                    </span>
                    <span className="font-bold text-accent text-sm">
                      {maxTemp !== undefined ? `${Math.round(maxTemp)}°` : "--"}
                    </span>
                  </div>
                </div>

                <div className="w-full flex justify-center pt-3 min-h-[28px]">
                  {precipProb !== undefined && precipProb > 0 && (
                    <div className="neu-pressed-sm px-3 py-1 rounded-full text-[10px] font-bold text-accent flex items-center gap-1.5">
                      <span>{getPrecipIcon(weatherCode)}</span>
                      {precipProb}%
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Expanded Day Details ───────────────────────────────── */}
        <AnimatePresence>
          {selectedDayIdx !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedDayIdx(null)}
                className="absolute inset-0 neu-backdrop"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 24 }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative w-full max-w-2xl"
              >
                <div className="neu-elevated p-6 sm:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 neu-pressed flex items-center justify-center text-3xl select-none">
                        {
                          WEATHER_CODES[
                            daily.weather_code?.[selectedDayIdx] ?? 0
                          ]?.icon
                        }
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-(--text) tracking-tight">
                          {selectedDayIdx === 0
                            ? "Today"
                            : formatDate(daily.time[selectedDayIdx])}
                        </h4>
                        <span className="text-accent font-semibold uppercase tracking-[0.15em] text-xs">
                          {
                            WEATHER_CODES[
                              daily.weather_code?.[selectedDayIdx] ?? 0
                            ]?.description
                          }
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDayIdx(null)}
                      className="w-10 h-10 flex items-center justify-center neu-button text-(--text-muted) hover:text-accent rounded-full"
                      aria-label="Close"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <DetailTile
                      label="UV Index"
                      value={`${daily.uv_index_max?.[selectedDayIdx] ?? "--"}`}
                    />
                    <DetailTile
                      label="Sunrise"
                      value={
                        daily.sunrise?.[selectedDayIdx]
                          ? new Date(
                              daily.sunrise[selectedDayIdx],
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
                        daily.sunset?.[selectedDayIdx]
                          ? new Date(
                              daily.sunset[selectedDayIdx],
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--"
                      }
                    />
                    <DetailTile
                      label="Precipitation"
                      value={`${daily.precipitation_sum?.[selectedDayIdx] ?? 0} mm`}
                      icon={getPrecipIcon(
                        daily.weather_code?.[selectedDayIdx] ?? 0,
                      )}
                    />
                    <DetailTile
                      label="Max Wind"
                      value={`${daily.wind_speed_10m_max?.[selectedDayIdx] ?? 0}`}
                      unit="km/h"
                    />
                    <DetailTile
                      label="Max Gusts"
                      value={`${daily.wind_gusts_10m_max?.[selectedDayIdx] ?? 0}`}
                      unit="km/h"
                    />
                    <div className="neu-inset p-4 col-span-2 flex flex-col items-center justify-center text-center gap-1">
                      <span className="text-[10px] text-(--text-muted) uppercase tracking-[0.2em]">
                        Total Daylight
                      </span>
                      <span className="font-bold text-accent text-lg">
                        {daily.daylight_duration?.[selectedDayIdx]
                          ? `${Math.round(daily.daylight_duration[selectedDayIdx] / 3600)} Hours`
                          : "--"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
    <div className="neu-pressed p-4 flex flex-col items-center justify-center text-center gap-1">
      <span className="text-[10px] text-(--text-muted) uppercase tracking-[0.2em]">
        {label}
      </span>
      <span className="text-xl font-bold text-(--text)">
        {value}
        {unit && (
          <span className="text-xs font-normal text-accent ml-0.5">{unit}</span>
        )}
      </span>
      {sub && (
        <span className="text-[10px] text-(--text-muted) font-medium">{sub}</span>
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
    <div className="neu-flat p-4 flex flex-col gap-1 items-center text-center">
      <span className="text-[10px] text-(--text-muted) uppercase tracking-[0.2em]">
        {label}
      </span>
      <span className="font-bold text-(--text) text-base flex items-center gap-1">
        {icon && <span>{icon}</span>}
        {value}
        {unit && (
          <span className="text-[10px] font-normal text-accent">{unit}</span>
        )}
      </span>
    </div>
  );
}
