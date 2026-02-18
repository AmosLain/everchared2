(function () {
  "use strict";

  const PAGE_SIZE = 12;

  const state = {
    all: [],
    filtered: [],
    page: 1,
    userPos: null, // { lat, lng }
    lastQuery: "",
  };

  function $(sel, root = document) {
    return root.querySelector(sel);
  }

  function safeOn(el, event, handler) {
    if (!el) return;
    el.addEventListener(event, handler);
  }

  function normalizeStation(raw) {
    // Keep only what we use; tolerate missing fields
    return {
      id: raw.id ?? raw.station_id ?? null,
      name: raw.name ?? raw.title ?? "",
      address: raw.address ?? raw.location ?? "",
      city: raw.city ?? "",
      power: raw.power ?? raw.kW ?? raw.speed ?? "",
      lat: raw.lat ?? raw.latitude ?? null,
      lng: raw.lng ?? raw.lon ?? raw.longitude ?? null,
      distanceKm: null,
    };
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function computeDistances() {
    if (!state.userPos) return;

    const { lat, lng } = state.userPos;
    state.filtered = state.filtered.map((s) => {
      if (s.lat == null || s.lng == null) return { ...s, distanceKm: null };
      const d = haversineKm(lat, lng, Number(s.lat), Number(s.lng));
      return { ...s, distanceKm: d };
    });

    // Sort by distance when available
    state.filtered.sort((a, b) => {
      const da = a.distanceKm, db = b.distanceKm;
      if (da == null && db == null) return 0;
      if (da == null) return 1;
      if (db == null) return -1;
      return da - db;
    });
  }

  function applySearch(query) {
    const q = (query || "").trim().toLowerCase();
    state.lastQuery = q;

    if (!q) {
      state.filtered = [...state.all];
    } else {
      state.filtered = state.all.filter((s) => {
        const hay = `${s.name} ${s.address} ${s.city} ${s.power}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // Keep distance sorting if we already have user position
    if (state.userPos) computeDistances();

    state.page = 1;
    render();
  }

  function getPageSlice() {
    const total = state.filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    state.page = Math.min(Math.max(1, state.page), totalPages);

    const start = (state.page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return { slice: state.filtered.slice(start, end), total, totalPages };
  }

  function render() {
    const { slice, total, totalPages } = getPageSlice();

    const statusText = total
      ? `Results: ${total} • Page ${state.page}/${totalPages}`
      : "No stations found.";

    window.EVUI?.renderStations(slice, {
      statusText,
      emptyText: state.lastQuery ? "No matches for your search." : "No stations available.",
    });

    window.EVUI?.setPageInfo(`Page ${state.page} / ${totalPages}`);
    window.EVUI?.setPagerEnabled({
      prevEnabled: state.page > 1,
      nextEnabled: state.page < totalPages,
    });
  }

  async function loadStations() {
    window.EVUI?.setStatus("Loading stations...");

    // Swap this to your real data source later.
    const res = await fetch("data/stations.sample.json", { cache: "no-store" });
    const raw = await res.json();

    const arr = Array.isArray(raw) ? raw : (raw.stations || raw.results || []);
    state.all = arr.map(normalizeStation);
    state.filtered = [...state.all];

    window.EVUI?.setStatus(`Loaded ${state.all.length} stations.`);
    render();
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      window.EVUI?.setStatus("Geolocation not supported in this browser.");
      return;
    }

    window.EVUI?.setStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.userPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // Re-apply current filter and compute distances
        state.filtered = state.lastQuery ? state.filtered : [...state.filtered];
        computeDistances();

        state.page = 1;
        window.EVUI?.setStatus("Showing stations near you (sorted by distance).");
        render();
      },
      (err) => {
        window.EVUI?.setStatus(`Location error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function wireEvents() {
    const searchBox = $("#searchBox");
    const nearBtn = $("#findNearMeBtn");
    const prevBtn = $("#prevBtn");
    const nextBtn = $("#nextBtn");

    safeOn(searchBox, "input", (e) => applySearch(e.target.value));
    safeOn(nearBtn, "click", requestLocation);

    safeOn(prevBtn, "click", () => {
      state.page -= 1;
      render();
    });

    safeOn(nextBtn, "click", () => {
      state.page += 1;
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    wireEvents();
    try {
      await loadStations();
    } catch (e) {
      console.error(e);
      window.EVUI?.setStatus("Failed to load stations data.");
      window.EVUI?.renderStations([], { emptyText: "Data load failed." });
    }
  });
})();
