// CONFIGURATION (Centralized)
// This file stores all application-wide constants and configurations.
// It's a single source of truth for things like API keys, URLs, and settings.

// The `export const` syntax makes these variables available for other files to import.

export const CONFIG = {
    // !! WARNING: This API key is exposed in the browser. For production, use a server-side proxy.
    NREL_API_KEY: 'xwB0h4XAfDn0gDrtGYda9YheLlZBPFLsN7Pi8njh',
    NREL_BASE_URL: 'https://developer.nrel.gov/api/alt-fuel-stations/v1.json',
    
    // Application-specific settings
    ITEMS_PER_PAGE: 20,
    CACHE_DURATION: 1000 * 60 * 60, // 1 hour in milliseconds
    DEFAULT_SEARCH_RADIUS: 50, // miles for 'Find Near Me'
    MAX_INITIAL_LOAD: 200, // NREL's default limit for a broad search
};