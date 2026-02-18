import { CONFIG } from './config.js';
import { fetchStations } from './api.js';
import * as ui from './ui.js';
import { getUserLocation, getDistance } from './utils.js';

const appState = {
  allStations: [],
  filteredStations: [],
  currentPage: 1,
  userLocation: null
};

async function initializeApp() {
  ui.updateApiStatus('loading', 'Loading stations...');
  ui.showLoadingSpinner(true);

  try {
    appState.allStations = await fetchStations();
    appState.filteredStations = [...appState.allStations];

    ui.renderStations(appState.filteredStations, 1, null);
    ui.updateStats(appState.allStations);
    ui.updateApiStatus('success', 'Stations loaded');
  } catch (e) {
    ui.updateApiStatus('error', 'Failed loading stations');
  } finally {
    ui.showLoadingSpinner(false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();

  // FIND NEAR ME
  if (ui.elements.locationBtn) {
    ui.elements.locationBtn.addEventListener('click', async () => {
      ui.disableButton(ui.elements.locationBtn, true);
      ui.updateApiStatus('loading', 'Finding nearby stations...');
      ui.showLoadingSpinner(true);

      try {
        appState.userLocation = await getUserLocation();

        const radius = CONFIG.DEFAULT_SEARCH_RADIUS;

        const nearby = appState.allStations
          .map(s => ({
            ...s,
            distance: getDistance(
              appState.userLocation.latitude,
              appState.userLocation.longitude,
              s.latitude,
              s.longitude
            )
          }))
          .filter(s => s.distance <= radius)
          .sort((a, b) => a.distance - b.distance);

        appState.filteredStations = nearby;
        appState.currentPage = 1;

        ui.renderStations(nearby, 1, appState.userLocation);
        ui.updateApiStatus('success', `Found ${nearby.length} nearby stations`);
      } catch (e) {
        ui.updateApiStatus('error', 'Location failed');
      } finally {
        ui.disableButton(ui.elements.locationBtn, false);
        ui.showLoadingSpinner(false);
      }
    });
  }

  // SEARCH
  if (ui.elements.searchInput) {
    ui.elements.searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();

      const filtered = appState.allStations.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q)
      );

      appState.filteredStations = filtered;
      ui.renderStations(filtered, 1, appState.userLocation);
    });
  }
});
