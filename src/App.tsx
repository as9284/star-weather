import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocationSearch } from "./components/LocationSearch";
import { WeatherDisplay } from "./components/WeatherDisplay";
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

  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    return (
      (localStorage.getItem("theme") as "light" | "dark" | "system") || "system"
    );
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light", "dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "light"
          : "dark",
      );
    } else {
      setTheme(theme === "light" ? "dark" : "light");
    }
  };

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
    <div className="min-h-screen py-8 px-5 md:py-12 md:px-10 max-w-6xl mx-auto flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="w-full flex flex-col md:flex-row gap-5 md:items-center justify-between mb-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 neu-raised flex items-center justify-center text-accent relative overflow-hidden">
            <svg
              className="w-6 h-6 relative z-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <div className="absolute inset-0 bg-(--accent) opacity-10 blur-md rounded-[inherit]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-(--text)">
            Star Weather
          </h1>
        </div>

        <div className="w-full md:max-w-md flex gap-3 items-center">
          <div className="flex-1">
            <LocationSearch
              selectedLocation={selectedLocation}
              onSelect={(loc) => setSelectedLocation(loc)}
            />
          </div>

          <button
            onClick={fetchCurrentLocation}
            title="Use current location"
            className="w-11 h-11 flex-shrink-0 neu-button flex items-center justify-center text-(--text-muted) hover:text-accent"
            aria-label="Use current location"
          >
            {locating ? (
              <svg
                className="w-5 h-5 animate-spin"
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
                  strokeOpacity="0.25"
                />
                <path
                  strokeLinecap="round"
                  strokeWidth="3"
                  d="M12 2v4"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
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

          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className="w-11 h-11 flex-shrink-0 neu-button flex items-center justify-center text-(--text-muted) hover:text-accent"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
              >
                <circle cx="12" cy="12" r="4" />
                <path
                  strokeLinecap="round"
                  d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ── States ─────────────────────────────────────────────────── */}
      {locating && (
        <div className="flex justify-center my-16">
          <p className="text-sm text-(--text-muted) animate-pulse font-medium tracking-[0.15em]">
            Detecting local conditions...
          </p>
        </div>
      )}

      {isInitialLoading && (
        <div className="flex justify-center mt-20">
          <div className="neu-pressed w-16 h-16 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-(--text-muted) border-opacity-20 border-t-(--accent) rounded-full animate-spin" />
          </div>
        </div>
      )}

      {error && !data && (
        <div className="mt-8 neu-raised px-6 py-5 text-(--text) flex gap-4 items-start">
          <div className="w-10 h-10 flex-shrink-0 neu-pressed flex items-center justify-center text-(--text-muted)">
            <svg
              className="w-5 h-5"
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
            <h3 className="font-bold text-base">Observation Failed</h3>
            <p className="text-sm text-(--text-muted) mt-0.5">
              Unable to load planetary data. Please try again.
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
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherApp />
    </QueryClientProvider>
  );
}
