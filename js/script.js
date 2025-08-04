// SCRIPT.JS (Main application entry point)
// This file initializes the application, sets up event listeners, and manages the global state.

import { CONFIG } from './config.js';
import { fetchStations } from './api.js';
import * as ui from './ui.js';
import * as filters from './filters.js';
import { trackEvent, getUserLocation } from './utils.js';

// GLOBAL APP STATE
// This object holds all the dynamic data and state of the application.
const appState = {
    allStations: [],
    filteredStations: [],
    currentPage: 1,
    currentFilters: {
        state: 'all',
        network: 'all',
        charger: 'all',
        search: ''
    },
    userLocation: null,
    totalPages: 1
};

// Initialize filters with the app state
filters.initializeFilters(appState);

/**
 * The main function to initialize the application.
 * It's called once the DOM content is fully loaded.
 */
async function initializeApp() {
    try {
        ui.updateApiStatus('loading', 'Loading initial station data...');
        ui.showLoadingSpinner(true);

        // Fetch initial set of stations
        appState.allStations = await fetchStations();
        appState.filteredStations = [...appState.allStations];

        // Populate filters and update stats based on the initial data
        ui.populateFilters(ui.elements.stateFilters, [...new Set(appState.allStations.map(s => s.state))].sort(), (filterValue) => filters.applyFilter('state', filterValue));
        ui.populateFilters(ui.elements.networkFilters, [...new Set(appState.allStations.map(s => s.network))].sort(), (filterValue) => filters.applyFilter('network', filterValue));

        filters.applyAllFilters();
        ui.updateStats(appState.allStations);

        ui.updateApiStatus('success', `Loaded ${appState.allStations.length} initial stations`);
        ui.showLoadingSpinner(false);

        trackEvent('page_load', { 'stations_loaded': appState.allStations.length });

        setupEventListeners();

    } catch (error) {
        console.error('App initialization failed:', error);
        ui.updateApiStatus('error', 'Failed to load initial station data');
        alert('Unable to load charging station data. Please try again later.');
        ui.showLoadingSpinner(false);
    }
}

/**
 * Sets up all the event listeners for user interactions.
 */
function setupEventListeners() {
    const searchBox = document.getElementById('searchBox');
    let searchDebounceTimeout;
    searchBox.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimeout);
        searchDebounceTimeout = setTimeout(() => {
            filters.applyFilter('search', e.target.value);
        }, 300);
    });

    // Event listener for the "Find Near Me" button
    ui.elements.locationBtn.addEventListener('click', async () => {
        ui.disableButton(ui.elements.locationBtn, true);
        ui.updateApiStatus('loading', 'Finding your location and nearby stations...');
        ui.showLoadingSpinner(true);

        try {
            appState.userLocation = await getUserLocation();
            if (appState.userLocation) {
                ui.updateApiStatus('loading', 'Fetching stations near you...');
                // Fetch a large number of stations around the user's location
                appState.allStations = await fetchStations(
                    appState.userLocation.latitude,
                    appState.userLocation.longitude,
                    CONFIG.DEFAULT_SEARCH_RADIUS * 2
                );

                // Re-populate filters based on the new set of stations
                ui.populateFilters(ui.elements.stateFilters, [...new Set(appState.allStations.map(s => s.state))].sort(), (filterValue) => filters.applyFilter('state', filterValue));
                ui.populateFilters(ui.elements.networkFilters, [...new Set(appState.allStations.map(s => s.network))].sort(), (filterValue) => filters.applyFilter('network', filterValue));

                ui.updateApiStatus('success', `Found ${appState.allStations.length} stations near you!`);
                filters.applyAllFilters();
                ui.updateStats(appState.allStations);
            } else {
                ui.updateApiStatus('error', 'Location permission denied or failed.');
                ui.showError('Location access denied. Please enable location services in your browser settings to use "Find Near Me".');
            }
        } catch (error) {
            console.error('Error getting location or fetching nearby stations:', error);
            ui.updateApiStatus('error', 'Could not get location or fetch nearby stations.');
            ui.showError('Error finding your location or fetching nearby stations. Please ensure location services are enabled.');
        } finally {
            ui.disableButton(ui.elements.locationBtn, false);
            ui.showLoadingSpinner(false);
        }
    });

    ui.elements.chargerFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-tag')) {
            filters.applyFilter('charger', e.target.dataset.filter);
            ui.setActiveFilterTag(ui.elements.chargerFilters, e.target);
        }
    });

    ui.elements.stateFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-tag')) {
            filters.applyFilter('state', e.target.dataset.filter);
            ui.setActiveFilterTag(ui.elements.stateFilters, e.target);
        }
    });

    ui.elements.networkFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-tag')) {
            filters.applyFilter('network', e.target.dataset.filter);
            ui.setActiveFilterTag(ui.elements.networkFilters, e.target);
        }
    });

    ui.elements.prevBtn.addEventListener('click', () => {
        appState.currentPage -= 1;
        ui.renderStations(appState.filteredStations, appState.currentPage, appState.userLocation);
        trackEvent('pagination_change', { page: appState.currentPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    ui.elements.nextBtn.addEventListener('click', () => {
        appState.currentPage += 1;
        ui.renderStations(appState.filteredStations, appState.currentPage, appState.userLocation);
        trackEvent('pagination_change', { page: appState.currentPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    ui.elements.clearFiltersBtn.addEventListener('click', () => filters.clearAllFilters());
}

// Start the application after the DOM has fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);