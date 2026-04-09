import { useState, useEffect, useRef } from "react";
import { useLocationSearch } from "../hooks/useWeather";
import type { GeocodingResult } from "../types/weather";

interface LocationSearchProps {
  onSelect: (location: GeocodingResult) => void;
  selectedLocation: GeocodingResult | null;
}

const formatLocation = (loc: GeocodingResult): string =>
  `${loc.name}${loc.country ? `, ${loc.country}` : ""}`;

export function LocationSearch({
  onSelect,
  selectedLocation,
}: LocationSearchProps) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const displayValue = isEditing
    ? inputValue
    : selectedLocation
      ? formatLocation(selectedLocation)
      : "";

  useEffect(() => {
    if (!isEditing) return;
    const timer = setTimeout(() => setDebouncedQuery(inputValue), 1000);
    return () => clearTimeout(timer);
  }, [inputValue, isEditing]);

  const { data: results, isLoading: isSearching } = useLocationSearch(
    isEditing ? debouncedQuery : "",
  );

  useEffect(() => {
    function handleClickOutside(evt: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(evt.target as Node)
      ) {
        setShowResults(false);
        setIsEditing(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedLocation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsEditing(true);
    setShowResults(true);
  };

  const handleSelect = (location: GeocodingResult) => {
    setInputValue(formatLocation(location));
    setIsEditing(false);
    setShowResults(false);
    onSelect(location);
  };

  const showDropdown =
    showResults && isEditing && !!results && results.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        {/* Search icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50 pointer-events-none">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35"
            />
          </svg>
        </div>

        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => {
            if (isEditing && results && results.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder="Search for a city..."
          className="w-full pl-9 pr-9 py-2.5 text-sm cosmic-input"
        />

        {isSearching && isEditing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 cosmic-dropdown z-50 py-1">
          {results!.map((location) => (
            <button
              key={location.id}
              onClick={() => handleSelect(location)}
              className="w-full px-4 py-2.5 text-left cosmic-dropdown-item flex flex-col focus:outline-none"
            >
              <span className="font-semibold text-purple-100 text-sm">
                {location.name}
              </span>
              <span className="text-xs text-purple-300/40 mt-0.5">
                {location.admin1 && `${location.admin1}, `}
                {location.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
