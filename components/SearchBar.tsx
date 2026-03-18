"use client";

import { useEffect, useRef, useState } from "react";

export const CITY_LIST = [
  { slug: "tel-aviv", name: "Tel Aviv" },
  { slug: "jerusalem", name: "Jerusalem" },
  { slug: "haifa", name: "Haifa" },
  { slug: "rishon-lezion", name: "Rishon LeZion" },
  { slug: "petah-tikva", name: "Petah Tikva" },
  { slug: "beer-sheva", name: "Be'er Sheva" },
  { slug: "netanya", name: "Netanya" },
  { slug: "ashdod", name: "Ashdod" },
  { slug: "eilat", name: "Eilat" },
  { slug: "los-angeles", name: "Los Angeles" },
  { slug: "san-francisco", name: "San Francisco" },
  { slug: "san-diego", name: "San Diego" },
  { slug: "san-jose", name: "San Jose" },
  { slug: "sacramento", name: "Sacramento" },
  { slug: "fresno", name: "Fresno" },
  { slug: "long-beach", name: "Long Beach" },
  { slug: "oakland", name: "Oakland" },
  { slug: "anaheim", name: "Anaheim" },
  { slug: "santa-ana", name: "Santa Ana" },
  { slug: "irvine", name: "Irvine" },
  { slug: "palo-alto", name: "Palo Alto" },
  { slug: "santa-monica", name: "Santa Monica" },
  { slug: "pasadena", name: "Pasadena" },
  { slug: "berkeley", name: "Berkeley" },
  { slug: "austin", name: "Austin" },
  { slug: "houston", name: "Houston" },
  { slug: "dallas", name: "Dallas" },
  { slug: "san-antonio", name: "San Antonio" },
  { slug: "fort-worth", name: "Fort Worth" },
  { slug: "el-paso", name: "El Paso" },
  { slug: "plano", name: "Plano" },
  { slug: "miami", name: "Miami" },
  { slug: "orlando", name: "Orlando" },
  { slug: "tampa", name: "Tampa" },
  { slug: "jacksonville", name: "Jacksonville" },
  { slug: "fort-lauderdale", name: "Fort Lauderdale" },
  { slug: "st-petersburg", name: "St. Petersburg" },
  { slug: "new-york", name: "New York" },
  { slug: "buffalo", name: "Buffalo" },
  { slug: "boston", name: "Boston" },
  { slug: "philadelphia", name: "Philadelphia" },
  { slug: "washington-dc", name: "Washington D.C." },
  { slug: "baltimore", name: "Baltimore" },
  { slug: "newark", name: "Newark" },
  { slug: "chicago", name: "Chicago" },
  { slug: "detroit", name: "Detroit" },
  { slug: "indianapolis", name: "Indianapolis" },
  { slug: "columbus", name: "Columbus" },
  { slug: "cleveland", name: "Cleveland" },
  { slug: "minneapolis", name: "Minneapolis" },
  { slug: "milwaukee", name: "Milwaukee" },
  { slug: "kansas-city", name: "Kansas City" },
  { slug: "st-louis", name: "St. Louis" },
  { slug: "omaha", name: "Omaha" },
  { slug: "seattle", name: "Seattle" },
  { slug: "portland", name: "Portland" },
  { slug: "denver", name: "Denver" },
  { slug: "phoenix", name: "Phoenix" },
  { slug: "tucson", name: "Tucson" },
  { slug: "las-vegas", name: "Las Vegas" },
  { slug: "salt-lake-city", name: "Salt Lake City" },
  { slug: "albuquerque", name: "Albuquerque" },
  { slug: "boise", name: "Boise" },
  { slug: "atlanta", name: "Atlanta" },
  { slug: "charlotte", name: "Charlotte" },
  { slug: "raleigh", name: "Raleigh" },
  { slug: "nashville", name: "Nashville" },
  { slug: "memphis", name: "Memphis" },
  { slug: "new-orleans", name: "New Orleans" },
  { slug: "louisville", name: "Louisville" },
  { slug: "richmond", name: "Richmond" },
  { slug: "virginia-beach", name: "Virginia Beach" },
  { slug: "london", name: "London" },
  { slug: "manchester", name: "Manchester" },
  { slug: "birmingham", name: "Birmingham" },
  { slug: "amsterdam", name: "Amsterdam" },
  { slug: "rotterdam", name: "Rotterdam" },
  { slug: "utrecht", name: "Utrecht" },
  { slug: "the-hague", name: "The Hague" },
  { slug: "berlin", name: "Berlin" },
  { slug: "munich", name: "Munich" },
  { slug: "hamburg", name: "Hamburg" },
  { slug: "frankfurt", name: "Frankfurt" },
  { slug: "cologne", name: "Cologne" },
  { slug: "paris", name: "Paris" },
  { slug: "lyon", name: "Lyon" },
  { slug: "marseille", name: "Marseille" },
  { slug: "toulouse", name: "Toulouse" },
  { slug: "oslo", name: "Oslo" },
  { slug: "bergen", name: "Bergen" },
  { slug: "stockholm", name: "Stockholm" },
  { slug: "gothenburg", name: "Gothenburg" },
  { slug: "copenhagen", name: "Copenhagen" },
  { slug: "zurich", name: "Zurich" },
  { slug: "geneva", name: "Geneva" },
  { slug: "milan", name: "Milan" },
  { slug: "rome", name: "Rome" },
  { slug: "turin", name: "Turin" },
  { slug: "madrid", name: "Madrid" },
  { slug: "barcelona", name: "Barcelona" },
  { slug: "valencia", name: "Valencia" },
  { slug: "lisbon", name: "Lisbon" },
  { slug: "dublin", name: "Dublin" },
  { slug: "brussels", name: "Brussels" },
  { slug: "warsaw", name: "Warsaw" },
  { slug: "krakow", name: "Krakow" },
  { slug: "prague", name: "Prague" },
  { slug: "vienna", name: "Vienna" },
  { slug: "helsinki", name: "Helsinki" },
  { slug: "toronto", name: "Toronto" },
  { slug: "vancouver", name: "Vancouver" },
  { slug: "montreal", name: "Montreal" },
  { slug: "sydney", name: "Sydney" },
  { slug: "melbourne", name: "Melbourne" },
  { slug: "brisbane", name: "Brisbane" },
  { slug: "tokyo", name: "Tokyo" },
  { slug: "osaka", name: "Osaka" },
  { slug: "nagoya", name: "Nagoya" },
  { slug: "seoul", name: "Seoul" },
  { slug: "busan", name: "Busan" },
  { slug: "singapore", name: "Singapore" },
  { slug: "hong-kong", name: "Hong Kong" },
  { slug: "shanghai", name: "Shanghai" },
  { slug: "beijing", name: "Beijing" },
  { slug: "shenzhen", name: "Shenzhen" },
  { slug: "guangzhou", name: "Guangzhou" },
  { slug: "hangzhou", name: "Hangzhou" },
  { slug: "dubai", name: "Dubai" },
  { slug: "abu-dhabi", name: "Abu Dhabi" },
];

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onFindNearMe: () => void;
  geoLoading: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onFindNearMe,
  geoLoading,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<{ slug: string; name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    if (val.trim().length >= 2) {
      const q = val.toLowerCase();
      const matches = CITY_LIST.filter((c) =>
        c.name.toLowerCase().startsWith(q)
      ).slice(0, 6);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (name: string) => {
    onChange(name);
    setSuggestions([]);
    setShowSuggestions(false);
    setTimeout(() => onSearch(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      onSearch();
    }
    if (e.key === "Escape") setShowSuggestions(false);
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto relative"
      translate="no"
    >
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          placeholder="Search by name, address, city…"
          translate="no"
          className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors bg-[#17323c]/78 backdrop-blur-md border border-teal-200/10 text-slate-100 placeholder-slate-300/55 focus:border-teal-300/40 focus:ring-1 focus:ring-teal-300/30"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-50 top-full mt-1 w-full rounded-2xl overflow-hidden border border-teal-200/10 bg-[#14303a]/96 backdrop-blur-md shadow-2xl">
            {suggestions.map((c) => (
              <li
                key={c.slug}
                onMouseDown={() => handleSelect(c.name)}
                className="px-4 py-2.5 text-sm text-white hover:bg-teal-400/10 cursor-pointer flex items-center gap-2"
              >
                <span className="text-teal-200/75">📍</span>
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={() => { setShowSuggestions(false); onSearch(); }}
        disabled={!value.trim()}
        translate="no"
        className="flex items-center justify-center gap-2 bg-teal-400/14 hover:bg-teal-400/22 disabled:opacity-40 disabled:cursor-not-allowed text-teal-50 border border-teal-300/18 font-medium px-5 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
      >
        <span aria-hidden="true">🔍</span>
        <span>Search</span>
      </button>
      <button
        onClick={onFindNearMe}
        disabled={geoLoading}
        translate="no"
        className="flex items-center justify-center gap-2 bg-emerald-400/12 hover:bg-emerald-400/18 disabled:opacity-60 disabled:cursor-wait text-emerald-50 border border-emerald-300/18 font-medium px-5 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
      >
        {geoLoading ? (
          <>
            <span className="animate-spin" aria-hidden="true">⏳</span>
            <span>Locating…</span>
          </>
        ) : (
          <>
            <span aria-hidden="true">📍</span>
            <span>Find near me</span>
          </>
        )}
      </button>
    </div>
  );
}
