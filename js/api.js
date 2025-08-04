// API.JS FUNCTIONS (Handles data fetching and caching)
// This module centralizes all interactions with external APIs and localStorage.

import { CONFIG } from './config.js';
import { processRawStations, trackEvent } from './utils.js';

/**
 * Fetches EV charging station data from the NREL API, using a cache for performance.
 * It first tries a Vercel serverless function proxy, then falls back to a direct NREL call,
 * and finally to local sample data if all else fails.
 * @param {number} [latitude=null] Latitude for a location-based search.
 * @param {number} [longitude=null] Longitude for a location-based search.
 * @param {number} [radius=null] Search radius in miles.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of processed station objects.
 */
export async function fetchStations(latitude = null, longitude = null, radius = null) {
    const cacheKey = 'nrel_stations_cache';
    const cacheTime = 'nrel_cache_time';
    
    // Create a unique cache key for location-based searches
    const currentCacheKey = latitude && longitude && radius 
        ? `${cacheKey}_${latitude}_${longitude}_${radius}` 
        : cacheKey + '_all';

    const cachedData = localStorage.getItem(currentCacheKey);
    const cacheTimestamp = localStorage.getItem(cacheTime);
    
    // Check if cached data is still valid
    if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < CONFIG.CACHE_DURATION) {
            console.log('✅ Loading stations from cache for', currentCacheKey);
            trackEvent('data_source', { source: 'cache', cached_age_ms: age, type: currentCacheKey.includes('all') ? 'initial' : 'location_based' });
            return JSON.parse(cachedData);
        }
    }

    let data = null;
    let dataSource = 'sample';
    
    // API endpoint parameters
    const params = new URLSearchParams({
        api_key: CONFIG.NREL_API_KEY,
        fuel_type: 'ELEC',
        status: 'E',
        format: 'json'
    });

    // Add location-based parameters if provided
    if (latitude && longitude && radius) {
        params.append('latitude', latitude);
        params.append('longitude', longitude);
        params.append('radius', radius);
        params.append('limit', 'all'); // Request all stations within the radius
    } else {
        params.append('limit', String(CONFIG.MAX_INITIAL_LOAD));
    }

    // Attempt 1: Try Vercel serverless function (for production API key security)
    try {
        console.log('🚀 Trying Vercel serverless function with params:', params.toString());
        const response = await fetch(`/api/stations?${params.toString()}`);
        
        if (response.ok) {
            const apiData = await response.json();
            // Assuming the Vercel function returns a specific structure
            if (apiData.success && apiData.stations) {
                data = { fuel_stations: apiData.stations };
                dataSource = 'vercel_api';
                console.log(`✅ Vercel API successful: ${apiData.stations.length} stations for ${latitude ? 'location' : 'initial'} query`);
            } else {
                console.log('❌ Vercel API returned no success or stations data:', apiData);
            }
        } else {
            console.log('❌ Vercel API failed:', response.status, response.statusText);
        }
    } catch (vercelError) {
        console.warn('❌ Vercel API error (likely no Vercel function running or network issue):', vercelError.message);
    }

    // Attempt 2: Fallback to direct NREL API if Vercel fails
    if (!data) { 
        try {
            console.log('🔄 Trying direct NREL API...');
            const response = await fetch(CONFIG.NREL_BASE_URL + '?' + params);
            
            if (response.ok) {
                data = await response.json();
                dataSource = 'nrel_direct';
                console.log('✅ Direct NREL API successful');
            } else {
                console.log('❌ Direct NREL API failed:', response.status, response.statusText);
            }
        } catch (directError) {
            console.warn('❌ Direct NREL API failed:', directError.message);
        }
    }

    // Attempt 3: Fallback to local sample data if all API methods fail
    if (!data || !data.fuel_stations || data.fuel_stations.length === 0) {
        console.log('🔄 All API methods failed or returned no data, using enhanced sample data');
        trackEvent('data_source', { source: 'sample_fallback' });
        try {
            const sampleDataResponse = await fetch('/data/sample_stations.json'); 
            const sampleData = await sampleDataResponse.json();
            data = { fuel_stations: sampleData };
            dataSource = 'sample_fallback';
        } catch (sampleError) {
            console.error('❌ Failed to load sample data:', sampleError);
            throw new Error('Failed to load any station data.');
        }
    }

    trackEvent('data_source', { source: dataSource, stations_count: data.fuel_stations.length, location_based: !!(latitude && longitude && radius) });
    
    // Process the raw data and cache it
    const processedStations = processRawStations(data.fuel_stations);
    try {
        localStorage.setItem(currentCacheKey, JSON.stringify(processedStations));
        localStorage.setItem(cacheTime, String(Date.now()));
        console.log('Data cached successfully.');
    } catch (e) {
        console.warn('Local storage full or inaccessible, cannot cache data:', e);
    }
    
    return processedStations;
}