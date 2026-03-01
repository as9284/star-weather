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
  const today = daily;

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
    // Basic snow check, otherwise rain
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "🌩️";
    return "💧";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12"
    >
      {/* LEFT COLUMN: Current conditions */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <div className="pl-2">
          <h2 className="text-4xl font-extrabold text-(--text-main) tracking-tight truncate">
            {location.name}
          </h2>
          <p className="text-(--text-muted) font-medium mt-1 uppercase tracking-widest text-sm">
            {location.admin1 && `${location.admin1}, `}
            {location.country}
          </p>
        </div>

        {current && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="neu-flat p-8 flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Subtle glow orb behind icon */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-(--accent) opacity-20 blur-3xl rounded-full pointer-events-none" />

            <div className="text-9xl mb-6 relative z-10 drop-shadow-2xl">
              {currentWeather?.icon || "🌡️"}
            </div>

            <div className="text-7xl font-light text-(--text-main) mb-2 tracking-tighter self-center flex items-start">
              {Math.round(current.temperature_2m)}
              <span className="text-3xl mt-2 font-normal text-accent">°</span>
            </div>

            <div className="text-xl font-medium text-accent mb-2 tracking-wide uppercase text-center">
              {currentWeather?.description || "Unknown Data"}
            </div>

            <div className="text-(--text-muted) text-sm font-semibold tracking-wider">
              Feels like {Math.round(current.apparent_temperature)}°
            </div>
          </motion.div>
        )}

        {/* Current Details grid */}
        {current && (
          <div className="grid grid-cols-2 gap-4">
            <div className="neu-pressed p-5 flex flex-col items-center justify-center text-center">
              <span className="text-(--text-muted) text-xs tracking-widest uppercase mb-2">
                Humidity
              </span>
              <span className="text-2xl font-bold text-(--text-main)">
                {current.relative_humidity_2m}
                <span className="text-sm font-normal text-accent ml-1">%</span>
              </span>
            </div>
            <div className="neu-pressed p-5 flex flex-col items-center justify-center text-center">
              <span className="text-(--text-muted) text-xs tracking-widest uppercase mb-2">
                Wind
              </span>
              <span className="text-2xl font-bold text-(--text-main)">
                {Math.round(current.wind_speed_10m)}
                <span className="text-sm font-normal text-accent ml-1">
                  km/h
                </span>
              </span>
              <span className="text-xs text-(--text-muted) mt-1">
                {getWindDirection(current.wind_direction_10m)}
              </span>
            </div>
            <div className="neu-pressed p-5 flex flex-col items-center justify-center text-center">
              <span className="text-(--text-muted) text-xs tracking-widest uppercase mb-2">
                Gusts
              </span>
              <span className="text-2xl font-bold text-(--text-main)">
                {Math.round(current.wind_gusts_10m)}
                <span className="text-sm font-normal text-accent ml-1">
                  km/h
                </span>
              </span>
            </div>
            <div className="neu-pressed p-5 flex flex-col items-center justify-center text-center">
              <span className="text-(--text-muted) text-xs tracking-widest uppercase mb-2">
                Pressure
              </span>
              <span className="text-xl font-bold text-(--text-main)">
                {Math.round(current.pressure_msl)}{" "}
                <span className="text-xs font-normal text-accent">hPa</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Forecast */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6 lg:mt-24">
        <h3 className="text-lg font-bold text-(--text-main) uppercase tracking-widest mb-2 pl-2">
          7-Day Projection
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {today.time.map((date, index) => {
            const weatherCode = daily.weather_code?.[index] ?? 0;
            const weather = WEATHER_CODES[weatherCode];
            const maxTemp = daily.temperature_2m_max?.[index];
            const minTemp = daily.temperature_2m_min?.[index];
            const precipProb = daily.precipitation_probability_max?.[index];
            const isSelected = selectedDayIdx === index;

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedDayIdx(isSelected ? null : index)}
                className={`neu-button p-5 flex flex-col items-center relative border-2 transition-all ${
                  isSelected
                    ? "border-accent ring-2 ring-accent ring-opacity-20 scale-105 z-10"
                    : "border-transparent"
                }`}
              >
                <div className="text-(--text-muted) text-xs font-bold tracking-widest uppercase text-center w-full pb-3 border-b border-(--text-muted) border-opacity-10">
                  {index === 0 ? "Today" : formatDate(date)}
                </div>

                <div
                  className={`flex-1 flex items-center justify-center drop-shadow-md py-4 transition-all duration-300 ${isSelected ? "text-5xl" : "text-4xl"}`}
                >
                  {weather?.icon || "🌡️"}
                </div>

                <div className="w-full flex items-end justify-between pt-3 border-t border-(--text-muted) border-opacity-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-(--text-muted) uppercase tracking-widest">
                      Low
                    </span>
                    <span className="font-medium text-(--text-main)">
                      {minTemp !== undefined ? `${Math.round(minTemp)}°` : "--"}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-(--text-muted) uppercase tracking-widest">
                      High
                    </span>
                    <span className="font-bold text-accent">
                      {maxTemp !== undefined ? `${Math.round(maxTemp)}°` : "--"}
                    </span>
                  </div>
                </div>

                <div className="w-full flex justify-center pt-3 pb-1 min-h-[28px]">
                  {precipProb !== undefined && precipProb > 0 && (
                    <div className="text-[10px] font-bold text-accent neu-pressed px-3 py-1.5 flex items-center gap-1.5 rounded-full">
                      <span>{getPrecipIcon(weatherCode)}</span>
                      {precipProb}%
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Expanded Day Details Modal */}
        <AnimatePresence>
          {selectedDayIdx !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDayIdx(null)}
                className="absolute inset-0 bg-black/10 backdrop-blur-sm dark:bg-black/40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl"
              >
                <div className="neu-panel p-6 sm:p-8 rounded-[2rem] border border-white/20 dark:border-white/5 overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 neu-pressed rounded-2xl flex items-center justify-center text-3xl">
                        {
                          WEATHER_CODES[
                            daily.weather_code?.[selectedDayIdx] ?? 0
                          ]?.icon
                        }
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-(--text-main) tracking-tight">
                          {selectedDayIdx === 0
                            ? "Today"
                            : formatDate(today.time[selectedDayIdx])}
                        </h4>
                        <span className="text-accent font-medium uppercase tracking-widest text-sm">
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
                      className="w-10 h-10 flex items-center justify-center neu-button text-(--text-muted) hover:text-accent rounded-full transition-colors"
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

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="neu-flat p-4 rounded-2xl flex flex-col gap-1 items-center text-center">
                      <span className="text-[10px] text-(--text-muted) uppercase tracking-widest">
                        UV Index
                      </span>
                      <span className="font-bold text-(--text-main) text-lg">
                        {daily.uv_index_max?.[selectedDayIdx] ?? "--"}
                      </span>
                    </div>
                    <div className="neu-flat p-4 rounded-2xl flex flex-col gap-1 items-center text-center">
                      <span className="text-[10px] text-(--text-muted) uppercase tracking-widest">
                        Sunrise
                      </span>
                      <span className="font-bold text-(--text-main) text-lg">
                        {daily.sunrise?.[selectedDayIdx]
                          ? new Date(
                              daily.sunrise[selectedDayIdx],
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--"}
                      </span>
                    </div>
                    <div className="neu-flat p-4 rounded-2xl flex flex-col gap-1 items-center text-center">
                      <span className="text-[10px] text-(--text-muted) uppercase tracking-widest">
                        Sunset
                      </span>
                      <span className="font-bold text-(--text-main) text-lg">
                        {daily.sunset?.[selectedDayIdx]
                          ? new Date(
                              daily.sunset[selectedDayIdx],
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--"}
                      </span>
                    </div>
                    <div className="neu-flat p-4 rounded-2xl flex flex-col gap-1 items-center text-center">
                      <span className="text-[10px] text-(--text-muted) uppercase tracking-widest">
                        Precipitation
                      </span>
                      <span className="font-bold text-(--text-main) text-lg flex items-center gap-1">
                        {getPrecipIcon(
                          daily.weather_code?.[selectedDayIdx] ?? 0,
                        )}
                        {daily.precipitation_sum?.[selectedDayIdx] ?? 0} mm
                      </span>
                    </div>
                    <div className="neu-flat p-4 rounded-2xl flex flex-col gap-1 items-center text-center">
                      <span className="text-[10px] text-(--text-muted) uppercase tracking-widest">
                        Max Wind
                      </span>
                      <span className="font-bold text-(--text-main) text-lg">
                        {daily.wind_speed_10m_max?.[selectedDayIdx] ?? 0} km/h
                      </span>
                    </div>
                    <div className="neu-flat p-4 rounded-2xl flex flex-col gap-1 items-center text-center">
                      <span className="text-[10px] text-(--text-muted) uppercase tracking-widest">
                        Max Gusts
                      </span>
                      <span className="font-bold text-(--text-main) text-lg">
                        {daily.wind_gusts_10m_max?.[selectedDayIdx] ?? 0} km/h
                      </span>
                    </div>
                    <div className="neu-flat p-4 col-span-2 rounded-2xl flex flex-col gap-1 items-center justify-center text-center">
                      <span className="text-[10px] text-(--text-muted) uppercase tracking-widest">
                        Total Daylight
                      </span>
                      <span className="font-bold text-accent text-xl">
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
