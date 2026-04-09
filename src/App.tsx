import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocationSearch } from "./components/LocationSearch";
import { WeatherDisplay } from "./components/WeatherDisplay";
import { StarBackground } from "./components/StarBackground";
import { useWeather } from "./hooks/useWeather";
import { weatherApi } from "./api/weather";
import type { GeocodingResult } from "./types/weather";

const DEFAULT_LOCATION: GeocodingResult = {
  id: 1,
  name: "New York",
  latitude: 40.7128,
  longitude: -74.006,
  country: "United States",
  country_code: "US",
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

function WeatherApp() {
  const [selectedLocation, setSelectedLocation] =
    useState<GeocodingResult | null>(() => {
      try {
        const stored = localStorage.getItem("lastLocation");
        if (stored) return JSON.parse(stored) as GeocodingResult;
      } catch {
        // ignore
      }
      return DEFAULT_LOCATION;
    });

  const { data, isLoading, isFetching, error } = useWeather(
    selectedLocation?.latitude ?? null,
    selectedLocation?.longitude ?? null,
  );

  const [locating, setLocating] = useState(
    () => !localStorage.getItem("lastLocation") && !!navigator.geolocation,
  );

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const geo = await weatherApi.reverseGeocode(latitude, longitude);
          setSelectedLocation(
            geo ?? {
              id: 0,
              name: "Current Location",
              latitude,
              longitude,
              country: "",
              country_code: "",
            },
          );
        } catch {
          setSelectedLocation({
            id: 0,
            name: "Current Location",
            latitude,
            longitude,
            country: "",
            country_code: "",
          });
        }
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation unavailable:", err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    if (!localStorage.getItem("lastLocation") && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude, longitude } }) => {
          try {
            const geo = await weatherApi.reverseGeocode(latitude, longitude);
            setSelectedLocation(
              geo ?? {
                id: 0,
                name: "Current Location",
                latitude,
                longitude,
                country: "",
                country_code: "",
              },
            );
          } catch {
            setSelectedLocation({
              id: 0,
              name: "Current Location",
              latitude,
              longitude,
              country: "",
              country_code: "",
            });
          }
          setLocating(false);
        },
        (err) => {
          console.warn("Geolocation unavailable:", err.message);
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem("lastLocation", JSON.stringify(selectedLocation));
    }
  }, [selectedLocation]);

  const isInitialLoading = isLoading && !data;
  const isRefreshing = isFetching && !!data;

  return (
    <div className="relative min-h-screen">
      <StarBackground />

      <div className="relative z-10 min-h-screen py-6 px-4 md:py-10 md:px-8 max-w-5xl mx-auto flex flex-col">
        {/* ── Header ───────────────────────────────────────────── */}
        <header className="w-full flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/10 border border-purple-500/20">
              <svg
                className="w-5 h-5 text-purple-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-purple-100">
              Star Weather
            </h1>
          </div>

          <div className="w-full sm:max-w-sm flex gap-2.5 items-center">
            <div className="flex-1">
              <LocationSearch
                selectedLocation={selectedLocation}
                onSelect={(loc) => setSelectedLocation(loc)}
              />
            </div>

            <button
              onClick={fetchCurrentLocation}
              title="Use current location"
              className="w-10 h-10 flex-shrink-0 cosmic-btn flex items-center justify-center"
              aria-label="Use current location"
            >
              {locating ? (
                <svg
                  className="w-4.5 h-4.5 animate-spin text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeOpacity="0.2"
                  />
                  <path
                    strokeLinecap="round"
                    strokeWidth="3"
                    d="M12 2v4"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.75}
                >
                  <circle cx="12" cy="12" r="3" />
                  <path
                    strokeLinecap="round"
                    d="M12 2v4m0 12v4m-10-10h4m12 0h4"
                  />
                  <circle cx="12" cy="12" r="8" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* ── States ───────────────────────────────────────────── */}
        {locating && (
          <div className="flex justify-center my-16">
            <p className="text-sm text-purple-300/60 animate-pulse font-medium tracking-[0.15em]">
              Detecting local conditions...
            </p>
          </div>
        )}

        {isInitialLoading && (
          <div className="flex justify-center mt-20">
            <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
          </div>
        )}

        {error && !data && (
          <div className="mt-8 glass-static px-6 py-5 flex gap-4 items-start">
            <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <svg
                className="w-4.5 h-4.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-purple-100">
                Observation Failed
              </h3>
              <p className="text-xs text-purple-300/50 mt-0.5">
                Unable to load weather data. Please try again.
              </p>
            </div>
          </div>
        )}

        {data && (
          <main
            className={`flex-1 w-full transition-opacity duration-300 ${
              isRefreshing ? "opacity-50" : "opacity-100"
            }`}
          >
            <WeatherDisplay data={data} location={selectedLocation} />
          </main>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherApp />
    </QueryClientProvider>
  );
}
