// SCRIPT.JS (Main application logic)
// This is the core file that orchestrates all the other modules.

import { fetchStations } from './api.js';
import { initializeFilters, applyFilter, applyAllFilters, clearAllFilters } from './filters.js';
import { elements, updateApiStatus, showLoadingSpinner, renderStations, updateStats, populateFilters, setActiveFilterTag, disableButton } from './ui.js';
import { trackEvent } from './utils.js';
import { CONFIG } from './config.js';

// Application state, managed in the main script.
let appState = {
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
    userLocation: null
};

// Initializes the application after the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    try {
        updateApiStatus('loading', 'Loading initial station data...');
        showLoadingSpinner(true);
        trackEvent('page_load');

        const stations = await fetchStations();
        if (stations && stations.length > 0) {
            appState.allStations = stations;
            updateApiStatus('success', 'Stations loaded successfully!');
        } else {
            updateApiStatus('error', 'Failed to load station data.');
        }

        // Initialize modules with the shared application state.
        initializeFilters(appState);

        // Populate filters and update stats after data is loaded.
        populateFilters(elements.stateFilters, [...new Set(stations.map(s => s.state))].sort(), (state) => applyFilter('state', state));
        populateFilters(elements.networkFilters, [...new Set(stations.map(s => s.network))].sort(), (network) => applyFilter('network', network));
        populateFilters(elements.chargerFilters, ['level1', 'level2', 'dc_fast'], (charger) => applyFilter('charger', charger));

        updateStats(appState.allStations);

        // Apply initial filters to display data
        applyAllFilters();

        setupEventListeners();

        showLoadingSpinner(false);

    } catch (error) {
        console.error('App initialization failed:', error);
        updateApiStatus('error', 'Failed to initialize the application.');
        showLoadingSpinner(false);
    }
}

// Sets up all event listeners for user interactions.
function setupEventListeners() {
    elements.searchBox.addEventListener('input', (e) => {
        applyFilter('search', e.target.value);
    });

    elements.locationBtn.addEventListener('click', async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        disableButton(elements.locationBtn, true);
        elements.locationBtn.textContent = 'Locating...';
        trackEvent('location_requested');

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            appState.userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            updateApiStatus('loading', 'Finding stations near you...');
            showLoadingSpinner(true);
            
            // Re-fetch stations based on the user's location
            const nearStations = await fetchStations(appState.userLocation);

            if (nearStations) {
                appState.allStations = nearStations;
                updateStats(appState.allStations);
                applyAllFilters();
                updateApiStatus('success', 'Found nearby stations!');
            } else {
                updateApiStatus('error', 'Could not find stations near your location.');
            }
        } catch (error) {
            console.error('Geolocation error:', error);
            updateApiStatus('error', 'Geolocation failed. Please enable location services.');
        } finally {
            elements.locationBtn.textContent = '📍 Find Near Me';
            disableButton(elements.locationBtn, false);
        }
    });

    // Add a click listener for the search box to clear the location filter
    elements.searchBox.addEventListener('focus', () => {
        if (appState.userLocation) {
            appState.userLocation = null;
            applyAllFilters();
        }
    });

    elements.clearFiltersBtn.addEventListener('click', clearAllFilters);

    elements.pagination.addEventListener('click', (e) => {
        if (e.target.id === 'prevBtn' && appState.currentPage > 1) {
            appState.currentPage--;
        } else if (e.target.id === 'nextBtn' && appState.currentPage < appState.totalPages) {
            appState.currentPage++;
        } else {
            return;
        }
        renderStations(appState.filteredStations, appState.currentPage, appState.userLocation);
    });

    // Add event listeners for the "all" filter tags
    elements.stateFilters.addEventListener('click', (e) => {
        const filterTag = e.target.closest('.filter-tag');
        if (filterTag) {
            applyFilter('state', filterTag.dataset.filter);
            setActiveFilterTag(elements.stateFilters, filterTag);
        }
    });

    elements.networkFilters.addEventListener('click', (e) => {
        const filterTag = e.target.closest('.filter-tag');
        if (filterTag) {
            applyFilter('network', filterTag.dataset.filter);
            setActiveFilterTag(elements.networkFilters, filterTag);
        }
    });

    elements.chargerFilters.addEventListener('click', (e) => {
        const filterTag = e.target.closest('.filter-tag');
        if (filterTag) {
            applyFilter('charger', filterTag.dataset.filter);
            setActiveFilterTag(elements.chargerFilters, filterTag);
        }
    });
}