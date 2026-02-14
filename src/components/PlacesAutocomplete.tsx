"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Place } from "@/lib/types";

interface Props {
  onSelect: (place: Place) => void;
  selected: Place | null;
}

export default function PlacesAutocomplete({ onSelect, selected }: Props) {
  const [query, setQuery] = useState(selected?.displayName || "");
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.data || []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  }

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <input
          type="text"
          placeholder="Where are you going?"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full px-4 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all hover:border-accent/40"
        />
        <span className="absolute left-4 top-2.5 text-xs text-text-secondary">
          Destination
        </span>
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-border-custom border-t-accent rounded-full animate-spin" />
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-custom rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
          {results.map((place) => (
            <li key={place.placeId}>
              <button
                type="button"
                onClick={() => {
                  onSelect(place);
                  setQuery(place.displayName);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-accent-bg transition-colors text-sm"
              >
                <span className="font-medium text-foreground">
                  {place.displayName}
                </span>
                <span className="text-text-secondary ml-2 text-xs">
                  {place.formattedAddress}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
