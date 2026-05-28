import { useState, useRef, useEffect, useCallback } from "react";
import { Search, MapPin, Loader2, AlertCircle, RotateCcw } from "lucide-react";

// In-memory client-side cache to avoid redundant requests
const clientCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = clientCache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL_MS) {
    return entry.data;
  }
  clientCache.delete(key);
  return null;
}

function setCache(key, data) {
  clientCache.set(key, { data, time: Date.now() });
}

/**
 * Strategy 1: Django backend proxy (via Vite dev proxy at /api/geocode/)
 */
async function fetchFromProxy(query, signal) {
  const response = await fetch(`/api/geocode/?q=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) throw new Error(`Proxy ${response.status}`);
  const data = await response.json();
  return data.results || [];
}

/**
 * Strategy 2: Photon geocoder (Komoot) — generous rate limits, no auth
 */
async function fetchFromPhoton(query, signal) {
  const response = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`,
    {
      headers: { 'Accept': 'application/json' },
      signal,
    }
  );
  if (!response.ok) throw new Error(`Photon ${response.status}`);
  const data = await response.json();
  if (!data.features || data.features.length === 0) return [];

  return data.features.map(f => {
    const p = f.properties || {};
    const coords = f.geometry?.coordinates || [0, 0];
    const parts = [p.name, p.street, p.city, p.state, p.country];
    return {
      display_name: parts.filter(Boolean).join(', '),
      lat: coords[1],
      lon: coords[0],
    };
  });
}

/**
 * Strategy 3: Nominatim (OpenStreetMap) — last resort fallback
 */
async function fetchFromNominatim(query, signal) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
    {
      headers: {
        'User-Agent': 'RakshakPath/1.0 (road-safety-project)',
        'Accept': 'application/json',
      },
      signal,
    }
  );
  if (!response.ok) throw new Error(`Nominatim ${response.status}`);
  const data = await response.json();
  return data.map(item => ({
    display_name: item.display_name || '',
    lat: parseFloat(item.lat) || 0,
    lon: parseFloat(item.lon) || 0,
  }));
}

/**
 * Try all strategies in order, return first success
 */
async function geocodeWithFallback(query, signal) {
  // Check client cache first
  const cacheKey = query.toLowerCase().trim();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const strategies = [fetchFromProxy, fetchFromPhoton, fetchFromNominatim];
  let lastError = null;

  for (const strategy of strategies) {
    try {
      const results = await strategy(query, signal);
      if (results && results.length > 0) {
        setCache(cacheKey, results);
        return results;
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err; // Don't swallow aborts
      lastError = err;
      // Continue to next strategy
    }
  }

  // All strategies returned empty or failed
  if (lastError) throw lastError;
  return [];
}

function LocationSearch({ placeholder, setLocation }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSuggestions([]);
        setError(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = useCallback(async (searchQuery) => {
    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const results = await geocodeWithFallback(searchQuery, controller.signal);
      if (!controller.signal.aborted) {
        setSuggestions(results);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error("All geocoding strategies failed:", err);
      if (!controller.signal.aborted) {
        setSuggestions([]);
        setError("Search failed. Check your connection and try again.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  function handleSearch(value) {
    setQuery(value);

    if (value.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Debounce API calls by 500ms
    if (debounceRef.current) clearTimeout(debounceRef.current);

    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  }

  function handleRetry() {
    if (query.length >= 3) {
      performSearch(query);
    }
  }

  function selectLocation(place) {
    setQuery(place.display_name);
    setLocation({
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      name: place.display_name,
    });
    setSuggestions([]);
    setError(null);
  }

  return (
    <div ref={dropdownRef} style={{ position: "relative", marginBottom: "10px" }}>
      <div style={{ position: "relative" }}>
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: error ? "#f87171" : isFocused ? "#38bdf8" : "#64748b",
            transition: "color 0.2s",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: "100%",
            padding: "12px 40px 12px 36px",
            borderRadius: "10px",
            border: error
              ? "1px solid #f87171"
              : isFocused
              ? "1px solid #38bdf8"
              : "1px solid #334155",
            background: "rgba(15, 23, 42, 0.8)",
            color: "#e2e8f0",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: error
              ? "0 0 0 3px rgba(248, 113, 113, 0.15)"
              : isFocused
              ? "0 0 0 3px rgba(56, 189, 248, 0.15)"
              : "none",
            boxSizing: "border-box",
          }}
        />
        {isLoading && (
          <Loader2
            size={16}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#38bdf8",
              animation: "spin 1s linear infinite",
            }}
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(12px)",
            width: "100%",
            border: "1px solid #334155",
            borderRadius: "10px",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 9999,
            marginTop: "4px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          {suggestions.map((place, index) => (
            <div
              key={index}
              onClick={() => selectLocation(place)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                borderBottom:
                  index < suggestions.length - 1
                    ? "1px solid rgba(51, 65, 85, 0.5)"
                    : "none",
                color: "#cbd5e1",
                fontSize: "13px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                transition: "background 0.15s",
              }}
            >
              <MapPin
                size={14}
                style={{ color: "#38bdf8", marginTop: "2px", flexShrink: 0 }}
              />
              <span>{place.display_name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error state with retry */}
      {error && !isLoading && (
        <div
          style={{
            position: "absolute",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(12px)",
            width: "100%",
            border: "1px solid rgba(248, 113, 113, 0.3)",
            borderRadius: "10px",
            padding: "14px",
            zIndex: 9999,
            marginTop: "4px",
            color: "#f87171",
            fontSize: "13px",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRetry}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(248, 113, 113, 0.4)",
              background: "rgba(248, 113, 113, 0.1)",
              color: "#fca5a5",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(248, 113, 113, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)";
            }}
          >
            <RotateCcw size={12} />
            Retry
          </button>
        </div>
      )}

      {/* No results state */}
      {query.length >= 3 &&
        !isLoading &&
        !error &&
        suggestions.length === 0 &&
        isFocused && (
          <div
            style={{
              position: "absolute",
              background: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(12px)",
              width: "100%",
              border: "1px solid #334155",
              borderRadius: "10px",
              padding: "14px",
              zIndex: 9999,
              marginTop: "4px",
              color: "#64748b",
              fontSize: "13px",
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
            }}
          >
            No locations found. Try a different search.
          </div>
        )}
    </div>
  );
}

export default LocationSearch;