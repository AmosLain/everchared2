// SCRIPT.JS (Main application entry point)
// This file initializes the application, sets up event listeners, and manages the global state.

import { CONFIG } from './config.js';
import { fetchStations } from './api.js';
import * as ui from './ui.js';
import * as filters from './filters.js';
import { trackEvent, getUserLocation, getDistance } from './utils.js';

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

        ui.updateApiStatus('success', `Loaded ${appState.allStations.length} initial stations.`);
    } catch (error) {
        console.error('Failed to initialize app:', error);
        ui.updateApiStatus('error', 'Failed to load stations. Please try refreshing.');
        ui.showError('Failed to load station data. Please refresh the page.');
    } finally {
        ui.showLoadingSpinner(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();

    // Refresh button - forces a re-fetch
    ui.elements.refreshBtn.addEventListener('click', async () => {
        ui.disableButton(ui.elements.refreshBtn, true);
        ui.updateApiStatus('loading', 'Refreshing station data...');
        ui.showLoadingSpinner(true);

        try {
            appState.allStations = await fetchStations(null, null, null);
            appState.filteredStations = [...appState.allStations];
            appState.currentPage = 1;

            ui.populateFilters(ui.elements.stateFilters, [...new Set(appState.allStations.map(s => s.state))].sort(), (filterValue) => filters.applyFilter('state', filterValue));
            ui.populateFilters(ui.elements.networkFilters, [...new Set(appState.allStations.map(s => s.network))].sort(), (filterValue) => filters.applyFilter('network', filterValue));

            filters.applyAllFilters();
            ui.updateStats(appState.allStations);
            ui.updateApiStatus('success', `Refreshed ${appState.allStations.length} stations!`);
            trackEvent('refresh_data', { count: appState.allStations.length });
        } catch (error) {
            console.error('Refresh failed:', error);
            ui.updateApiStatus('error', 'Refresh failed. Please try again.');
            ui.showError('Could not refresh station data.');
        } finally {
            ui.disableButton(ui.elements.refreshBtn, false);
            ui.showLoadingSpinner(false);
        }
    });

    // ✅ FIXED: Find Near Me button
    const locationBtn = ui.elements.locationBtn;
    locationBtn.addEventListener('click', async () => {
        ui.disableButton(ui.elements.locationBtn, true);
        ui.updateApiStatus('loading', 'Finding your location and nearby stations...');
        ui.showLoadingSpinner(true);

        try {
            appState.userLocation = await getUserLocation();

            if (!appState.userLocation) {
                ui.updateApiStatus('error', 'Location permission denied or failed.');
                ui.showError('Location access denied. Please enable location services in your browser settings to use "Find Near Me".');
                return;
            }

            ui.updateApiStatus('loading', 'Fetching stations near you...');

            // Fetch stations within the configured radius (miles)
            const radiusMiles = CONFIG.DEFAULT_SEARCH_RADIUS;

            const fetchedStations = await fetchStations(
                appState.userLocation.latitude,
                appState.userLocation.longitude,
                radiusMiles
            );

            // Safety: ensure we only show stations that are truly within radius + sort by nearest first
            const nearbyStations = fetchedStations
                .map(station => ({
                    ...station,
                    _distanceMiles: getDistance(
                        appState.userLocation.latitude,
                        appState.userLocation.longitude,
                        station.latitude,
                        station.longitude
                    )
                }))
                .filter(station => Number.isFinite(station._distanceMiles) && station._distanceMiles <= radiusMiles)
                .sort((a, b) => a._distanceMiles - b._distanceMiles)
                .map(({ _distanceMiles, ...station }) => station);

            // Update state
            appState.allStations = nearbyStations;
            appState.filteredStations = [...nearbyStations];
            appState.currentPage = 1;

            // Re-populate filters based on the new set of stations
            ui.populateFilters(
                ui.elements.stateFilters,
                [...new Set(appState.allStations.map(s => s.state))].sort(),
                (filterValue) => filters.applyFilter('state', filterValue)
            );
            ui.populateFilters(
                ui.elements.networkFilters,
                [...new Set(appState.allStations.map(s => s.network))].sort(),
                (filterValue) => filters.applyFilter('network', filterValue)
            );

            ui.updateApiStatus('success', `Found ${nearbyStations.length} stations within ${radiusMiles} miles`);
            filters.applyAllFilters();
            ui.updateStats(appState.allStations);
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
        // handled by populateFilters
    });

    // Search input
    ui.elements.searchInput.addEventListener('input', (e) => {
        filters.applySearch(e.target.value);
    });

    // Pagination
    ui.elements.prevBtn.addEventListener('click', () => {
        if (appState.currentPage > 1) {
            appState.currentPage--;
            ui.renderStations(appState.filteredStations, appState.currentPage, appState.userLocation);
            ui.updatePaginationInfo(appState.currentPage, Math.ceil(appState.filteredStations.length / CONFIG.ITEMS_PER_PAGE));
        }
    });

    ui.elements.nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(appState.filteredStations.length / CONFIG.ITEMS_PER_PAGE);
        if (appState.currentPage < totalPages) {
            appState.currentPage++;
            ui.renderStations(appState.filteredStations, appState.currentPage, appState.userLocation);
            ui.updatePaginationInfo(appState.currentPage, totalPages);
        }
    });
});
