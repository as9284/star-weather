import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { WeatherForecastResponse } from "../types/weather";

interface HourlyChartProps {
  data: WeatherForecastResponse;
  /** Show hours for this day index (0 = today). Defaults to next 24 h. */
  dayIndex?: number;
}

export function HourlyChart({ data, dayIndex }: HourlyChartProps) {
  const { hourly } = data;
  if (!hourly?.time?.length) return null;

  // Determine the time slice to display
  const now = new Date();
  let startIdx = 0;
  let endIdx = 24;

  if (dayIndex !== undefined) {
    // Show 24 hours for a specific day
    startIdx = dayIndex * 24;
    endIdx = startIdx + 24;
  } else {
    // Show next 24 hours from now
    startIdx = hourly.time.findIndex((t) => new Date(t) >= now);
    if (startIdx < 0) startIdx = 0;
    endIdx = Math.min(startIdx + 24, hourly.time.length);
  }

  const chartData = hourly.time.slice(startIdx, endIdx).map((t, i) => {
    const idx = startIdx + i;
    return {
      time: new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      temp: hourly.temperature_2m?.[idx],
      feelsLike: hourly.apparent_temperature?.[idx],
      precip: hourly.precipitation_probability?.[idx] ?? 0,
      humidity: hourly.relative_humidity_2m?.[idx],
    };
  });

  if (chartData.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Temperature chart */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-purple-300/70 font-semibold mb-2 pl-1">
          Temperature (°C)
        </h4>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="feelsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(139,92,246,0.1)"
              />
              <XAxis
                dataKey="time"
                tick={{ fill: "rgba(196,181,253,0.5)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "rgba(196,181,253,0.5)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(30,20,60,0.95)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  borderRadius: "0.75rem",
                  color: "#e0d4ff",
                  fontSize: "0.75rem",
                }}
                labelStyle={{ color: "#c4b5fd" }}
              />
              <Area
                type="monotone"
                dataKey="feelsLike"
                stroke="#818cf8"
                strokeWidth={1.5}
                fill="url(#feelsGrad)"
                name="Feels Like"
                dot={false}
                strokeDasharray="4 2"
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#a78bfa"
                strokeWidth={2}
                fill="url(#tempGrad)"
                name="Temperature"
                dot={false}
                activeDot={{ r: 3, fill: "#c4b5fd" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Precipitation probability chart */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-purple-300/70 font-semibold mb-2 pl-1">
          Precipitation Probability (%)
        </h4>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(139,92,246,0.1)"
              />
              <XAxis
                dataKey="time"
                tick={{ fill: "rgba(196,181,253,0.5)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "rgba(196,181,253,0.5)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(30,20,60,0.95)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  borderRadius: "0.75rem",
                  color: "#e0d4ff",
                  fontSize: "0.75rem",
                }}
                labelStyle={{ color: "#c4b5fd" }}
              />
              <Area
                type="monotone"
                dataKey="precip"
                stroke="#7dd3fc"
                strokeWidth={2}
                fill="url(#precipGrad)"
                name="Precipitation %"
                dot={false}
                activeDot={{ r: 3, fill: "#bae6fd" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
