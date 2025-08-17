// UI.JS FUNCTIONS (Handles all DOM manipulation and user interface updates)
// This module contains functions that directly interact with the HTML elements.

import { trackEvent, getDistance } from './utils.js';
import { CONFIG } from './config.js';

// Centralized object to hold references to all relevant DOM elements.
export const elements = {
    apiStatus: document.getElementById('apiStatus'),
    stationsGrid: document.getElementById('stationsGrid'),
    totalStations: document.getElementById('totalStations'),
    totalNetworks: document.getElementById('totalNetworks'),
    totalStates: document.getElementById('totalStates'),
    fastChargers: document.getElementById('fastChargers'),
    lastUpdatedStations: document.getElementById('lastUpdatedStations'),
    lastUpdatedNetworks: document.getElementById('lastUpdatedNetworks'),
    lastUpdatedStates: document.getElementById('lastUpdatedStates'),
    stateFilters: document.getElementById('stateFilters'),
    networkFilters: document.getElementById('networkFilters'),
    chargerFilters: document.getElementById('chargerFilters'),
    pagination: document.getElementById('pagination'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    pageInfo: document.getElementById('pageInfo'),
    noResults: document.getElementById('noResults'),
    locationBtn: document.getElementById('locationBtn'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn')
};

/**
 * Updates the API status indicator.
 * @param {string} status 'loading', 'success', or 'error'.
 * @param {string} message The message to display.
 */
export function updateApiStatus(status, message) {
    const apiStatusDiv = elements.apiStatus;
    if (!apiStatusDiv) return;

    apiStatusDiv.className = 'api-status ' + status;
    const messageSpan = apiStatusDiv.querySelector('span:last-child');
    if (messageSpan) {
        messageSpan.textContent = message;
    }
    
    // Hide status message after 5 seconds for success/error
    if (status === 'success' || status === 'error') {
        setTimeout(() => {
            apiStatusDiv.classList.remove(status);
            if (messageSpan) {
                messageSpan.textContent = '';
            }
        }, 5000);
    }
}

/**
 * Displays a visual loading spinner in the station grid.
 * @param {boolean} show Whether to show or hide the spinner.
 */
export function showLoadingSpinner(show) {
    const loadingDiv = elements.stationsGrid.querySelector('.loading');
    if (loadingDiv) {
        loadingDiv.style.display = show ? 'flex' : 'none';
    }
    elements.stationsGrid.innerHTML = show ? '<div class="loading"><div class="spinner"></div><span>Loading charging stations...</span></div>' : '';
    // Also hide pagination and no-results when loading
    if (show) {
        elements.pagination.style.display = 'none';
        elements.noResults.style.display = 'none';
    }
}

/**
 * Renders a paginated list of stations to the grid.
 * @param {Array<object>} stationsToRender The array of station objects to render.
 * @param {number} currentPage The current page number.
 * @param {object} userLocation The user's coordinates for distance calculation.
 */
export function renderStations(stationsToRender, currentPage, userLocation) {
    elements.stationsGrid.innerHTML = '';
    showLoadingSpinner(false);

    const startIndex = (currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
    const endIndex = startIndex + CONFIG.ITEMS_PER_PAGE;
    const paginatedStations = stationsToRender.slice(startIndex, endIndex);

    if (paginatedStations.length === 0 && stationsToRender.length > 0) {
        // If the current page is empty but there's data, go back to page 1
        return renderStations(stationsToRender, 1, userLocation);
    }

    if (paginatedStations.length === 0) {
        elements.noResults.style.display = 'block';
        elements.pagination.style.display = 'none';
        return;
    }

    elements.noResults.style.display = 'none';

    const fragment = document.createDocumentFragment();
    paginatedStations.forEach(station => {
        const card = createStationCard(station, userLocation);
        fragment.appendChild(card);
    });
    elements.stationsGrid.appendChild(fragment);

    updatePagination(currentPage, Math.ceil(stationsToRender.length / CONFIG.ITEMS_PER_PAGE));
}

/**
 * Creates an HTML element for a single station card.
 * @param {object} station The station object.
 * @param {object} userLocation The user's coordinates for distance calculation.
 * @returns {HTMLElement} The created station card element.
 */
export function createStationCard(station, userLocation) {
    const card = document.createElement('div');
    card.className = 'station-card lazy-load';
    card.setAttribute('data-station-id', station.id);

    // Build the list of charger types and port counts
    const chargerTypes = station.connectors.map(c => {
        const type = c.type === 'J1772' ? 'J1772 (Level 2)' : c.type;
        return `<strong>${type}</strong>: ${c.ports} port${c.ports !== 1 ? 's' : ''}`;
    }).join('<br>');

    // Build the list of feature tags
    const features = [];
    if (station.access && station.access !== 'unknown') features.push(station.access.replace('_', ' '));
    if (station.connectors.some(c => c.type.includes('DC Fast'))) features.push('DC Fast Charger');
    if (station.connectors.some(c => c.type.includes('Tesla'))) features.push('Tesla Compatible');

    // Calculate distance if user location is available
    let distanceHtml = '';
    if (userLocation && station.latitude && station.longitude) {
        const distance = getDistance(userLocation.latitude, userLocation.longitude, station.latitude, station.longitude);
        distanceHtml = `<div class="station-distance">~${distance.toFixed(1)} miles away</div>`;
    }

    card.innerHTML = `
        <div class="station-header">
            <h2 class="station-name">${station.name}</h2>
            ${distanceHtml}
        </div>
        <div class="station-content">
            <div class="station-address">📍 ${station.address}, ${station.city}, ${station.state} ${station.zip}</div>
            <div class="station-details">
                <div class="detail-item"><span class="detail-icon">🔌</span> <strong>Network:</strong> ${station.network || 'Unknown'}</div>
                <div class="detail-item"><span class="detail-icon">⚡</span> <strong>Chargers:</strong> <br>${chargerTypes || 'N/A'}</div>
                <div class="detail-item"><span class="detail-icon">🕒</span> <strong>Hours:</strong> ${station.hours || '24/7'}</div>
                <div class="detail-item"><span class="detail-icon">📞</span> <strong>Phone:</strong> ${station.phone || 'N/A'}</div>
            </div>
            <div class="station-features">
                ${features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
            </div>
            <div class="station-actions">
                <a href="https://maps.google.com/?q=${station.latitude},${station.longitude}" target="_blank" rel="noopener" class="action-btn btn-directions">
                    🗺️ Get Directions
                </a>
                ${station.website ? `<a href="${station.website}" target="_blank" rel="noopener" class="action-btn btn-website">
                    🌐 Visit Website
                </a>` : ''}
            </div>
        </div>
    `;

    // Add lazy-loading/intersection observer for a smoother feel
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    observer.observe(card);

    return card;
}

/**
 * Updates the main statistics section of the page.
 * @param {Array<object>} stations The array of all stations to calculate stats from.
 */
export function updateStats(stations) {
    const { totalStations, totalNetworks, totalStates, fastChargers, lastUpdatedStations, lastUpdatedNetworks, lastUpdatedStates } = elements;

    totalStations.textContent = stations.length.toLocaleString();

    const networks = new Set(stations.map(s => s.network).filter(n => n && n !== 'Unknown'));
    totalNetworks.textContent = networks.size.toLocaleString();

    const states = new Set(stations.map(s => s.state).filter(s => s && s !== 'Unknown State'));
    totalStates.textContent = states.size.toLocaleString();

    const fastChargersCount = stations.filter(s => s.connectors.some(c => c.type.includes('DC Fast'))).length;
    fastChargers.textContent = fastChargersCount.toLocaleString();

    const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    lastUpdatedStations.textContent = `Updated: ${lastUpdated}`;
    lastUpdatedNetworks.textContent = `Updated: ${lastUpdated}`;
    lastUpdatedStates.textContent = `Updated: ${lastUpdated}`;
}

/**
 * Populates a filter section with dynamic options.
 * @param {HTMLElement} container The DOM element to populate.
 * @param {Array<string>} options An array of filter option strings.
 * @param {Function} clickHandler The function to call when an option is clicked.
 */
export function populateFilters(container, options, clickHandler) {
    const existingOptions = container.querySelectorAll('.filter-tag:not([data-filter="all"])');
    existingOptions.forEach(el => el.remove());

    const fragment = document.createDocumentFragment();
    options.forEach(option => {
        if (!option || option === 'Unknown' || option === 'Unknown State' || option.trim() === '') return;
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.dataset.filter = option;
        tag.textContent = option;
        tag.addEventListener('click', () => {
            clickHandler(option);
            setActiveFilterTag(container, tag);
        });
        fragment.appendChild(tag);
    });
    container.appendChild(fragment);
}

/**
 * Sets the 'active' class on a filter tag.
 * @param {HTMLElement} container The container of the filter tags.
 * @param {HTMLElement} activeTag The tag to set as active.
 */
export function setActiveFilterTag(container, activeTag) {
    container.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    if (activeTag) {
        activeTag.classList.add('active');
    }
}

/**
 * Updates the pagination controls based on the current page and total pages.
 * @param {number} currentPage The current page number.
 * @param {number} totalPages The total number of pages.
 */
export function updatePagination(currentPage, totalPages) {
    if (totalPages <= 1) {
        elements.pagination.style.display = 'none';
        return;
    }
    elements.pagination.style.display = 'flex';
    elements.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    elements.prevBtn.disabled = currentPage === 1;
    elements.nextBtn.disabled = currentPage === totalPages;
}

/**
 * Toggles the visibility of the "no results" message.
 * @param {boolean} show True to show, false to hide.
 */
export function toggleNoResults(show) {
    elements.noResults.style.display = show ? 'block' : 'none';
    elements.pagination.style.display = show ? 'none' : (elements.filteredStations.length > CONFIG.ITEMS_PER_PAGE ? 'flex' : 'none');
}

/**
 * Disables or enables a button.
 * @param {HTMLElement} button The button element.
 * @param {boolean} disable True to disable, false to enable.
 */
export function disableButton(button, disable) {
    button.disabled = disable;
}