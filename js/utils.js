// UTILS.JS FUNCTIONS (Helper functions)
// This file provides reusable, general-purpose functions.
// We export each function individually so they can be imported where needed.

/**
 * Tracks a custom event using Google Analytics 4 (gtag.js).
 * @param {string} eventName The name of the event.
 * @param {object} parameters An object containing event parameters.
 */
export function trackEvent(eventName, parameters) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, parameters);
        console.log(`GA Event: ${eventName}`, parameters);
    } else {
        console.warn('gtag is not defined. Google Analytics not loaded.');
    }
}

/**
 * Cleans up a station name by removing common prefixes.
 * @param {string} name The raw station name.
 * @returns {string} The cleaned station name.
 */
export function cleanStationName(name) {
    if (!name) return 'Unnamed Station';
    let cleaned = name.replace(/^(EVgo|ChargePoint|Electrify America|Tesla Supercharger|ChargePoint Network|EV Connect|Shell Recharge|Blink)\s-\s/i, '');
    cleaned = cleaned.replace(/\sEV Station$/, '');
    cleaned = cleaned.trim();
    return cleaned || 'Unnamed Station';
}

/**
 * Cleans up a network name.
 * @param {string} network The raw network name.
 * @returns {string} The cleaned network name.
 */
export function cleanNetworkName(network) {
    if (!network) return 'Unknown Network';
    return network.replace(/Network$/, '').trim() || 'Unknown Network';
}

/**
 * Parses and normalizes connector information from the raw NREL API response.
 * @param {object} station The raw station object from the NREL API.
 * @returns {Array<object>} An array of connector objects.
 */
export function parseConnectors(station) {
    const connectors = [];
    if (station.ev_level1_evse_num) {
        connectors.push({ type: 'Level 1', ports: station.ev_level1_evse_num });
    }
    if (station.ev_level2_evse_num) {
        connectors.push({ type: 'Level 2', ports: station.ev_level2_evse_num });
    }
    if (station.ev_dc_fast_num) {
        connectors.push({ type: 'DC Fast Charging', ports: station.ev_dc_fast_num });
    }

    // Add specific connector types for better detail, if available
    const portTypes = station.ev_connector_types || [];
    portTypes.forEach(type => {
        const portCount = station.ev_level2_evse_num || station.ev_dc_fast_num || 1; // Fallback to 1 if not specified
        if (type === 'J1772') {
            if (!connectors.some(c => c.type === 'Level 2 (J1772)')) {
                connectors.push({ type: 'Level 2 (J1772)', ports: portCount });
            }
        } else if (type === 'CHADEMO') {
            if (!connectors.some(c => c.type === 'DC Fast (CHAdeMO)')) {
                connectors.push({ type: 'DC Fast (CHAdeMO)', ports: portCount });
            }
        } else if (type === 'CCS' || type === 'J1772COMBO') {
            if (!connectors.some(c => c.type.includes('CCS Combo'))) {
                connectors.push({ type: 'DC Fast (CCS Combo)', ports: portCount });
            }
        } else if (type === 'TESLA') {
            if (!connectors.some(c => c.type.includes('Tesla Supercharger'))) {
                connectors.push({ type: 'Tesla Supercharger', ports: portCount });
            }
        }
    });

    return connectors.length > 0 ? connectors : [{ type: 'Unknown', ports: 1 }];
}

/**
 * Processes a raw station object from the NREL API into a consistent, normalized format.
 * @param {Array<object>} rawStations An array of raw station objects.
 * @returns {Array<object>} An array of processed station objects.
 */
export function processRawStations(rawStations) {
    return rawStations.map(station => {
        return {
            id: station.id || 'unknown-' + Math.random().toString(36).substr(2, 9),
            name: cleanStationName(station.station_name),
            address: station.street_address || 'Address not available',
            city: station.city || 'Unknown City',
            state: station.state || 'Unknown State',
            zip: station.zip || '',
            latitude: parseFloat(station.latitude) || 0,
            longitude: parseFloat(station.longitude) || 0,
            network: cleanNetworkName(station.ev_network),
            connectors: parseConnectors(station),
            access: station.access_code || 'unknown',
            hours: station.access_days_time || '24/7',
            phone: station.station_phone || 'N/A',
            website: station.ev_network_web || '',
        };
    });
}

/**
 * Promisifies the browser's Geolocation API.
 * @returns {Promise<object>} A promise that resolves with the user's latitude and longitude.
 */
export function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                console.error('Geolocation error:', error);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    });
}

/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @param {number} lat1 Latitude of the first point.
 * @param {number} lon1 Longitude of the first point.
 * @param {number} lat2 Latitude of the second point.
 * @param {number} lon2 Longitude of the second point.
 * @returns {number} The distance in miles.
 */
export function getDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}