(function () {
  "use strict";

  function $(sel, root = document) {
    return root.querySelector(sel);
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = text ?? "";
  }

  function formatKm(km) {
    const n = Number(km);
    if (!Number.isFinite(n)) return "";
    return n < 10 ? `${n.toFixed(1)} km` : `${Math.round(n)} km`;
  }

  function createPill(text) {
    const s = document.createElement("span");
    s.className = "pill";
    s.textContent = text;
    return s;
  }

  function createCard(st, i) {
    const card = document.createElement("div");
    card.className = "station-card";

    const title = document.createElement("div");
    title.className = "station-title";
    title.textContent = st.name || `Station #${i + 1}`;

    const address = document.createElement("div");
    address.className = "station-address";
    address.textContent = [st.address, st.city].filter(Boolean).join(", ");

    const infoRow = document.createElement("div");
    infoRow.className = "station-info-row";

    if (st.power) infoRow.appendChild(createPill(st.power));
    if (st.distanceKm != null) infoRow.appendChild(createPill(formatKm(st.distanceKm)));

    const actions = document.createElement("div");
    actions.className = "station-actions";

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.textContent = "Open in Maps";

    openBtn.addEventListener("click", () => {
      const lat = st.lat, lng = st.lng;
      if (lat == null || lng == null) {
        const q = encodeURIComponent(`${st.name || ""} ${st.address || ""}`.trim());
        if (!q) return;
        window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
        return;
      }
      const q = encodeURIComponent(`${lat},${lng}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
    });

    actions.appendChild(openBtn);

    card.appendChild(title);
    card.appendChild(address);
    if (infoRow.childNodes.length) card.appendChild(infoRow);
    card.appendChild(actions);

    return card;
  }

  function renderStations(stations, opts = {}) {
    const results = $("#results");
    const status = $("#status");

    if (!results) return;

    results.innerHTML = "";

    const list = Array.isArray(stations) ? stations : [];
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = opts.emptyText || "No stations found.";
      results.appendChild(empty);
      setText(status, opts.statusText || "No stations found.");
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach((st, i) => frag.appendChild(createCard(st, i)));
    results.appendChild(frag);

    setText(status, opts.statusText || `Showing ${list.length} station${list.length === 1 ? "" : "s"}.`);
  }

  function setStatus(text) {
    setText($("#status"), text);
  }

  function setPageInfo(text) {
    setText($("#pageInfo"), text);
  }

  function setPagerEnabled({ prevEnabled, nextEnabled }) {
    const prev = $("#prevBtn");
    const next = $("#nextBtn");
    if (prev) prev.disabled = !prevEnabled;
    if (next) next.disabled = !nextEnabled;
  }

  window.EVUI = { renderStations, setStatus, setPageInfo, setPagerEnabled };
})();
