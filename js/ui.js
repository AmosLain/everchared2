import { CONFIG } from './config.js';
import { getDistance } from './utils.js';

export const elements = {
  apiStatus: document.getElementById('apiStatus'),
  stationsGrid: document.getElementById('stationsGrid'),
  totalStations: document.getElementById('totalStations'),
  totalNetworks: document.getElementById('totalNetworks'),
  totalStates: document.getElementById('totalStates'),
  fastChargers: document.getElementById('fastChargers'),
  stateFilters: document.getElementById('stateFilters'),
  networkFilters: document.getElementById('networkFilters'),
  chargerFilters: document.getElementById('chargerFilters'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  pageInfo: document.getElementById('pageInfo'),
  locationBtn: document.getElementById('locationBtn'),
  loadingSpinner: document.getElementById('loadingSpinner'),
  searchInput: document.getElementById('searchBox'),
  pagination: document.getElementById('pagination'),
  noResults: document.getElementById('noResults')
};

export function updateApiStatus(type, msg) {
  if (!elements.apiStatus) return;
  elements.apiStatus.className = `api-status ${type}`;
  elements.apiStatus.textContent = msg;
}

export function showLoadingSpinner(show) {
  if (!elements.loadingSpinner) return;
  elements.loadingSpinner.classList.toggle('hidden', !show);
}

export function disableButton(btn, state) {
  if (!btn) return;
  btn.disabled = state;
}

export function showError(msg) {
  alert(msg);
}

export function updateStats(stations) {
  elements.totalStations.textContent = stations.length;
  elements.totalNetworks.textContent = new Set(stations.map(s => s.network)).size;
  elements.totalStates.textContent = new Set(stations.map(s => s.state)).size;

  const fast = stations.filter(s =>
    s.connectors?.some(c => c.type.toLowerCase().includes('dc fast'))
  ).length;

  elements.fastChargers.textContent = fast;
}

export function renderStations(stations, page, userLocation) {
  elements.stationsGrid.innerHTML = '';

  if (!stations.length) {
    elements.noResults.style.display = 'block';
    return;
  }

  elements.noResults.style.display = 'none';

  const start = (page - 1) * CONFIG.ITEMS_PER_PAGE;
  const end = start + CONFIG.ITEMS_PER_PAGE;
  const pageItems = stations.slice(start, end);

  pageItems.forEach(station => {
    const card = document.createElement('div');
    card.className = 'station-card';

    let distance = '';
    if (userLocation) {
      const d = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        station.latitude,
        station.longitude
      );
      distance = ` • ${d.toFixed(1)} miles`;
    }

    card.innerHTML = `
      <h3>${station.name}</h3>
      <div class="station-meta">
        ${station.address}, ${station.city}, ${station.state}${distance}
      </div>
    `;

    elements.stationsGrid.appendChild(card);
  });

  elements.pagination.classList.remove('hidden');
}
