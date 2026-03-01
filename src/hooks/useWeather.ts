import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { weatherApi } from "../api/weather";

export function useWeather(latitude: number | null, longitude: number | null) {
  return useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: () => weatherApi.getForecast(latitude!, longitude!),
    enabled: latitude !== null && longitude !== null,
    // Keep data fresh for 5 minutes; hold in cache for 30
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    // Show previous location's data while the new location loads — prevents blank flashes
    placeholderData: keepPreviousData,
  });
}

export function useLocationSearch(query: string) {
  return useQuery({
    queryKey: ["locations", query],
    queryFn: () => weatherApi.searchLocations(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });
}
