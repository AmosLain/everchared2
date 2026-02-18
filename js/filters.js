// FILTERS.JS FUNCTIONS (Manages filter logic and state updates)
// This module contains the logic for filtering the station data based on user input.

import { elements, setActiveFilterTag, renderStations, toggleNoResults } from './ui.js';
import { trackEvent, getDistance } from './utils.js';
import { CONFIG } from './config.js';

// The application's state, including all stations and current filters.
// This is now passed from script.js, not a global variable.
let appState;

/**
 * Initializes the filters module with the application state.
 * @param {object} state The shared application state object.
 */
export function initializeFilters(state) {
    appState = state;
}

/**
 * Applies a specific filter and triggers a re-render.
 * @param {string} filterType The type of filter ('state', 'network', 'charger', 'search').
 * @param {string} value The value of the filter.
 */
export function applyFilter(filterType, value) {
    appState.currentFilters[filterType] = value;
    appState.currentPage = 1;
    applyAllFilters();
    trackEvent('filter_applied', { type: filterType, value: value });
}

/**
 * Applies all active filters to the station data.
 */
export function applyAllFilters() {
    let tempStations = [...appState.allStations];
    const filters = appState.currentFilters;

    // Search filter
    if (filters.search) {
        const lowerCaseQuery = filters.search.toLowerCase();
        tempStations = tempStations.filter(station =>
            station.name.toLowerCase().includes(lowerCaseQuery) ||
            station.address.toLowerCase().includes(lowerCaseQuery) ||
            station.city.toLowerCase().includes(lowerCaseQuery) ||
            station.zip.toLowerCase().includes(lowerCaseQuery) ||
            station.network.toLowerCase().includes(lowerCaseQuery)
        );
    }

    // State filter
    if (filters.state !== 'all') {
        tempStations = tempStations.filter(station => station.state === filters.state);
    } else {
        const allStatesTag = elements.stateFilters.querySelector('[data-filter="all"]');
        if (allStatesTag) setActiveFilterTag(elements.stateFilters, allStatesTag);
    }

    // Network filter
    if (filters.network !== 'all') {
        tempStations = tempStations.filter(station => station.network === filters.network);
    } else {
        const allNetworksTag = elements.networkFilters.querySelector('[data-filter="all"]');
        if (allNetworksTag) setActiveFilterTag(elements.networkFilters, allNetworksTag);
    }

    // Charger filter
    if (filters.charger !== 'all') {
        const chargerType = filters.charger;
        tempStations = tempStations.filter(station =>
            station.connectors.some(conn => {
                if (chargerType === 'dc_fast') return conn.type.includes('DC Fast');
                if (chargerType === 'level2') return conn.type.includes('Level 2');
                if (chargerType === 'level1') return conn.type.includes('Level 1');
                return false;
            })
        );
    } else {
        const allTypesTag = elements.chargerFilters.querySelector('[data-filter="all"]');
        if (allTypesTag) setActiveFilterTag(elements.chargerFilters, allTypesTag);
    }

    // Apply location filter (if user location is available and not an explicit search)
    if (appState.userLocation && !appState.currentFilters.search) {
        tempStations = tempStations.filter(station => {
            const distance = getDistance(
                appState.userLocation.latitude, appState.userLocation.longitude,
                station.latitude, station.longitude
            );
            return distance <= CONFIG.DEFAULT_SEARCH_RADIUS;
        });
    }

    // Sort by distance if user location is active
    if (appState.userLocation) {
        tempStations.sort((a, b) => {
            const distA = getDistance(appState.userLocation.latitude, appState.userLocation.longitude, a.latitude, a.longitude);
            const distB = getDistance(appState.userLocation.latitude, appState.userLocation.longitude, b.latitude, b.longitude);
            return distA - distB;
        });
    }

    appState.filteredStations = tempStations;
    appState.totalPages = Math.ceil(appState.filteredStations.length / CONFIG.ITEMS_PER_PAGE);
    renderStations(appState.filteredStations, appState.currentPage, appState.userLocation);
    toggleNoResults(appState.filteredStations.length === 0, appState.filteredStations.length);
}

/**
 * Resets all filters to their default state.
 */
export function clearAllFilters() {
    appState.currentFilters = {
        state: 'all',
        network: 'all',
        charger: 'all',
        search: ''
    };
    appState.userLocation = null;

    if (elements.searchBox) {
        elements.searchBox.value = '';
    }

    // Explicitly set the 'all' filter tags as active
    setActiveFilterTag(elements.stateFilters, elements.stateFilters.querySelector('[data-filter="all"]'));
    setActiveFilterTag(elements.networkFilters, elements.networkFilters.querySelector('[data-filter="all"]'));
    setActiveFilterTag(elements.chargerFilters, elements.chargerFilters.querySelector('[data-filter="all"]'));

    applyAllFilters();
    trackEvent('clear_filters');
}