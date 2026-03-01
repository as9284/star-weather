import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocationSearch } from "./components/LocationSearch";
import { WeatherDisplay } from "./components/WeatherDisplay";
import { useWeather } from "./hooks/useWeather";
import { weatherApi } from "./api/weather";
import type { GeocodingResult } from "./types/weather";

// fallback location used when the user denies or ignores geolocation
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
  // Restore last location from localStorage, fall back to default
  const [selectedLocation, setSelectedLocation] =
    useState<GeocodingResult | null>(() => {
      try {
        const stored = localStorage.getItem("lastLocation");
        if (stored) return JSON.parse(stored) as GeocodingResult;
      } catch {
        // ignore corrupt data
      }
      return DEFAULT_LOCATION;
    });

  const { data, isLoading, isFetching, error } = useWeather(
    selectedLocation?.latitude ?? null,
    selectedLocation?.longitude ?? null,
  );

  // True only while the browser is attempting to obtain device coordinates
  const [locating, setLocating] = useState(
    () => !localStorage.getItem("lastLocation") && !!navigator.geolocation,
  );

  // Theme state
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
    // Only auto-locate if we don't have a saved location
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

  // Persist location changes to localStorage
  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem("lastLocation", JSON.stringify(selectedLocation));
    }
  }, [selectedLocation]);

  // First-ever load with no cached data yet
  const isInitialLoading = isLoading && !data;
  // Background refetch while we already have data to show (e.g. location switch)
  const isRefreshing = isFetching && !!data;

  return (
    <div className="min-h-screen py-8 px-4 md:py-12 md:px-8 max-w-7xl mx-auto flex flex-col transition-colors duration-300">
      <header className="w-full flex flex-col md:flex-row gap-6 md:items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 neu-flat flex items-center justify-center text-accent rounded-2xl relative overflow-hidden">
            <svg
              className="w-7 h-7 relative z-10 animate-pulse drop-shadow-md"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <div className="absolute inset-0 bg-(--accent) opacity-10 rounded-2xl blur-md" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
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
            className="w-12 h-12 flex-shrink-0 neu-button flex items-center justify-center text-(--text-muted) hover:text-accent focus:outline-none focus:ring-2 focus:ring-(--accent)"
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
                  strokeWidth="4"
                  strokeOpacity="0.3"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                  d="M12 2v4"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="4" strokeWidth={2} />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 2v4m0 12v4m-10-10h4m12 0h4"
                />
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
              </svg>
            )}
          </button>

          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className="w-12 h-12 flex-shrink-0 neu-button flex items-center justify-center text-(--text-muted) hover:text-accent focus:outline-none focus:ring-2 focus:ring-(--accent)"
          >
            {theme === "light" ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {locating && (
        <div className="flex justify-center my-12">
          <p className="text-sm text-(--text-muted) animate-pulse font-medium tracking-wide">
            Detecting local atmospheric conditions...
          </p>
        </div>
      )}

      {isInitialLoading && (
        <div className="flex justify-center mt-16">
          <div className="w-12 h-12 border-4 border-(--text-muted) border-opacity-20 border-t-(--accent) rounded-full animate-spin" />
        </div>
      )}

      {error && !data && (
        <div className="mt-8 neu-flat border-l-4 border-(--text-muted) rounded-xl px-6 py-5 text-(--text-main)">
          <h3 className="font-bold text-lg mb-1">Observation Failed</h3>
          <p className="text-sm opacity-80">
            Unable to load the standard planetary data. Please try again.
          </p>
        </div>
      )}

      {data && (
        <main
          className={`flex-1 w-full transition-opacity duration-300 ${
            isRefreshing ? "opacity-60 grayscale-20" : "opacity-100"
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
