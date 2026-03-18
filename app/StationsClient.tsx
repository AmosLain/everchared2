"use client";
// ✅ Only interactive logic lives here — the search, filters, geolocation
// This keeps the main page.tsx as a Server Component (indexable by Google)

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Station } from "@/lib/types";
import { haversineKm } from "@/lib/haversine";
import StationCard from "@/components/StationCard";
import Pagination from "@/components/Pagination";
import SearchBar, { CITY_LIST } from "@/components/SearchBar";
import StatusBar from "@/components/StatusBar";

const PAGE_SIZE = 12;

type GeoState = { lat: number; lng: number } | null;

export default function StationsClient({
  initialStations,
}: {
  initialStations: Station[];
}) {
  const [allStations, setAllStations] = useState<Station[]>(initialStations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [geo, setGeo] = useState<GeoState>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(
    "Type a city/address (min 3 chars) to search worldwide, or click Find near me."
  );
  const [page, setPage] = useState(1);

  const abortRef = useRef<AbortController | null>(null);

  const fetchStations = useCallback(
    async (opts?: { lat?: number; lng?: number; search?: string }) => {
      // Cancel previous request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("limit", "200");
      if (opts?.lat != null && opts?.lng != null) {
        params.set("lat", String(opts.lat));
        params.set("lng", String(opts.lng));
        params.set("distanceKm", "15");
      } else if (opts?.search) {
        params.set("search", opts.search);
        params.set("distanceKm", "15");
      }
      const url = `/api/stations?${params.toString()}`;
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        if (data?.error?.message) {
          setAllStations([]);
          setError(data.error.message);
        } else {
          setAllStations(Array.isArray(data?.stations) ? data.stations : []);
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return; // ignore cancelled requests
        setError(err instanceof Error ? err.message : "Failed to load stations");
        setAllStations([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleCityClick = useCallback((cityName: string) => {
    setGeo(null);
    setQuery(cityName);
    setGeoStatus(null);
    setPage(1);
    // fetch directly with the city name
    fetchStations({ search: cityName });
  }, [fetchStations]);

  const handleSearch = useCallback((overrideQuery?: string) => {
    const q = (overrideQuery ?? query).trim();
    if (!q || q.length < 3) return;
    setGeo(null);
    setSearchedQuery(q);
    setPage(1);
    setGeoStatus(null);
    fetchStations({ search: q });
  }, [query, fetchStations]);

  useEffect(() => {
    if (geo) return;
    const q = searchedQuery.trim();
    if (!q) {
      setAllStations(initialStations);
      setError(null);
      setGeoStatus("Type a city/address and click Search, or click Find near me.");
    }
  }, [searchedQuery, geo, initialStations]);

  const handleFindNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation is not supported by this browser");
      return;
    }
    setGeoLoading(true);
    setGeoStatus("Requesting location permission…");
    setQuery("");
    setSearchedQuery("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGeo({ lat, lng });
        setGeoStatus(null);
        setGeoLoading(false);
        setPage(1);
        fetchStations({ lat, lng });
      },
      (err) => {
        setGeo(null);
        setGeoLoading(false);
        setGeoStatus(err?.message || "Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [fetchStations]);

  const processedStations = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withDistance = allStations.map((s) => ({
      ...s,
      distance:
        geo && s.lat != null && s.lng != null
          ? haversineKm(geo.lat, geo.lng, s.lat, s.lng)
          : undefined,
    }));
    const filtered =
      q.length === 0
        ? withDistance
        : withDistance.filter((s) =>
            `${s.name} ${s.address} ${s.city} ${s.country}`.toLowerCase().includes(q)
          );
    if (geo) filtered.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    return filtered;
  }, [allStations, geo, query]);

  const total = processedStations.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return processedStations.slice(start, start + PAGE_SIZE);
  }, [processedStations, currentPage]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  return (
    <>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        onSearch={handleSearch}
        onFindNearMe={handleFindNearMe}
        geoLoading={geoLoading}
      />
      <div className="mt-4">
        <StatusBar loading={loading} error={error} total={total} geoStatus={geoStatus} hasLocation={!!geo} />
      </div>
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageStations.map((s) => (
          <StationCard key={s.id} station={s} />
        ))}
      </section>
      <div className="mt-8">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Browse by City</h2>
        <div className="flex flex-wrap gap-2">
          {CITY_LIST.map((c) => (
            <button
              key={c.slug}
              onClick={() => handleCityClick(c.name)}
              className="inline-block px-3 py-1.5 rounded-xl text-sm text-teal-50 bg-teal-400/10 border border-teal-300/16 hover:bg-teal-400/16 hover:text-white transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
