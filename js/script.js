// script.js
import { fetchStations } from './api.js';
import { initializeFilters, applyFilter, applyAllFilters, clearAllFilters } from './filters.js';
import { elements, updateApiStatus, showLoadingSpinner, renderStations, updateStats, populateFilters, setActiveFilterTag, disableButton } from './ui.js';
import { trackEvent } from './utils.js';
import { CONFIG } from './config.js';

// Application state - shared
export const appState = {
  allStations: [],
  filteredStations: [],
  currentFilters: {
    state: 'all',
    network: 'all',
    charger: 'all',
    search: ''
  },
  currentPage: 1,
  totalPages: 1,
  userLocation: null,
  isInitialized: false
};

window.appState = appState;

// DOM Readiness Check
function ensureCriticalDOMReady() {
  return new Promise(resolve => {
    if (document.readyState === 'complete' && 
        elements.stationsGrid && 
        elements.pagination) {
      resolve();
      return;
    }

    const checkInterval = setInterval(() => {
      if (elements.stationsGrid && elements.pagination) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 50);
  });
}

// Event Listeners
function setupEventListeners() {
  let searchTimeout;
  if (elements.searchBox) {
    elements.searchBox.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        applyFilter('search', e.target.value);
      }, 300);
    });
  }

  if (elements.locationBtn) {
    elements.locationBtn.addEventListener('click', handleLocationClick);
  }

  if (elements.clearFiltersBtn) {
    elements.clearFiltersBtn.addEventListener('click', () => {
      clearAllFilters();
    });
  }

  if (elements.prevBtn) {
    elements.prevBtn.addEventListener('click', () => {
      if (appState.currentPage > 1) {
        appState.currentPage--;
        renderStations(appState.filteredStations, appState.currentPage, appState.userLocation);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  if (elements.nextBtn) {
    elements.nextBtn.addEventListener('click', () => {
      if (appState.currentPage < appState.totalPages) {
        appState.currentPage++;
        renderStations(appState.filteredStations, appState.currentPage, appState.userLocation);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  if (elements.stateFilters) {
    elements.stateFilters.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-tag')) {
        applyFilter('state', e.target.dataset.filter);
        setActiveFilterTag(elements.stateFilters, e.target);
      }
    });
  }

  if (elements.networkFilters) {
    elements.networkFilters.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-tag')) {
        applyFilter('network', e.target.dataset.filter);
        setActiveFilterTag(elements.networkFilters, e.target);
      }
    });
  }

  if (elements.chargerFilters) {
    elements.chargerFilters.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-tag')) {
        applyFilter('charger', e.target.dataset.filter);
        setActiveFilterTag(elements.chargerFilters, e.target);
      }
    });
  }
}

async function handleLocationClick() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }

  const btn = elements.locationBtn;
  disableButton(btn, true);
  const original = btn ? btn.textContent : '';
  if (btn) btn.textContent = '📍 Locating...';

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });

    appState.userLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    updateApiStatus('loading', 'Finding nearby stations...');
    showLoadingSpinner(true);

    const nearbyStations = await fetchStations(
      appState.userLocation.latitude,
      appState.userLocation.longitude,
      CONFIG.DEFAULT_SEARCH_RADIUS * 2
    );

    if (nearbyStations && nearbyStations.length > 0) {
      appState.allStations = nearbyStations;
      appState.filteredStations = [...nearbyStations];

      const states = [...new Set(nearbyStations.map(s => s.state).filter(Boolean))].sort();
      const networks = [...new Set(nearbyStations.map(s => s.network).filter(Boolean))].sort();

      populateFilters(elements.stateFilters, states, (state) => applyFilter('state', state));
      populateFilters(elements.networkFilters, networks, (network) => applyFilter('network', network));

      updateStats(appState.allStations);
      applyAllFilters();
      updateApiStatus('success', `Found ${nearbyStations.length} nearby stations!`);
    } else {
      updateApiStatus('error', 'No stations found nearby');
    }
  } catch (error) {
    console.error('Location error:', error);
    updateApiStatus('error', 'Could not get your location');
  } finally {
    if (btn) btn.textContent = original || '📍 Find Near Me';
    disableButton(btn, false);
    showLoadingSpinner(false);
  }
}

async function initializeApp() {
  console.log('🚀 Initializing EV Map Finder...');
  try {
    updateApiStatus('loading', 'Loading station data...');
    showLoadingSpinner(true);
    trackEvent('page_load');

    // Wait for DOM and critical elements
    await ensureCriticalDOMReady();
    
    const stations = await fetchStations();
    console.log(`✅ Loaded ${stations?.length || 0} stations`);

    if (!stations || stations.length === 0) {
      throw new Error('No stations loaded');
    }

    // Update state
    appState.allStations = stations;
    appState.filteredStations = [...stations];
    appState.totalPages = Math.ceil(stations.length / CONFIG.ITEMS_PER_PAGE);

    // Initialize filters
    initializeFilters(appState);

    // Extract filter values
    const states = [...new Set(stations.map(s => s.state).filter(Boolean))].sort();
    const networks = [...new Set(stations.map(s => s.network).filter(Boolean))].sort();

    // Populate filters
    if (elements.stateFilters && states.length > 0) {
      populateFilters(elements.stateFilters, states, (state) => {
        applyFilter('state', state);
      });
    }

    if (elements.networkFilters && networks.length > 0) {
      populateFilters(elements.networkFilters, networks, (network) => {
        applyFilter('network', network);
      });
    }

    updateStats(appState.allStations);

    // CRITICAL: Force initial render before applying filters
    console.log('🎨 Performing initial render...');
    renderStations(appState.filteredStations, 1, null);

    // Now apply filters (will trigger re-render if needed)
    console.log('🔧 Applying initial filters...');
    applyAllFilters();

    // Set up event listeners
    setupEventListeners();

    appState.isInitialized = true;
    showLoadingSpinner(false);
    updateApiStatus('success', `${stations.length} stations ready!`);
    console.log('✅ App initialized successfully!');

    // Temporary debug check
    setTimeout(() => {
      if (appState.filteredStations.length > 0 && 
          elements.stationsGrid.children.length === 0) {
        console.warn('Emergency re-render triggered');
        renderStations(appState.filteredStations, 1, null);
      }
    }, 500);

  } catch (error) {
    console.error('❌ Initialization error:', error);
    updateApiStatus('error', 'Failed to load stations');
    showLoadingSpinner(false);

    if (appState.allStations?.length > 0) {
      renderStations(appState.allStations, 1, null);
    }
  }
}

// Start the app with DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  if (!elements.stationsGrid) {
    console.error('Stations grid element not found!');
    return;
  }
  
  // Small delay to ensure all CSS is loaded
  setTimeout(() => {
    initializeApp();
  }, 50);
});

// Emergency render function for debugging
window.emergencyRender = function() {
  if (window.appState && window.appState.allStations.length > 0) {
    console.log('🚨 Emergency render of', window.appState.allStations.length, 'stations');
    renderStations(window.appState.allStations, 1, null);
  } else {
    console.error('No stations available to render');
  }
};