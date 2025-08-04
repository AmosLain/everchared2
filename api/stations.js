// This is the Vercel Serverless Function that acts as a proxy for the NREL API.

import fetch from 'node-fetch';

export default async (req, res) => {
    // Check for the API key in the environment variables
    const apiKey = process.env.NREL_API_KEY;

    if (!apiKey) {
        res.status(500).json({ success: false, message: 'NREL_API_KEY environment variable not set.' });
        return;
    }

    const NREL_BASE_URL = 'https://developer.nrel.gov/api/alt-fuel-stations/v1.json';

    // Extract parameters from the incoming request query
    const { latitude, longitude, radius, limit, ...otherParams } = req.query;

    const params = new URLSearchParams({
        ...otherParams,
        api_key: apiKey,
        fuel_type: 'ELEC',
        status: 'E',
        format: 'json',
    });

    // Add location-specific parameters if they exist
    if (latitude && longitude) {
        params.append('latitude', latitude);
        params.append('longitude', longitude);
        params.append('radius', radius || '50'); // Default to 50 miles if not specified
    }

    // Add a limit, defaulting to 200
    params.append('limit', limit || '200');

    const apiUrl = `${NREL_BASE_URL}?${params.toString()}`;

    try {
        const nrelResponse = await fetch(apiUrl);
        const data = await nrelResponse.json();

        if (nrelResponse.ok) {
            res.status(200).json({ success: true, stations: data.fuel_stations });
        } else {
            res.status(nrelResponse.status).json({ success: false, message: data.errors || 'API error' });
        }
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ success: false, message: 'Server proxy error.' });
    }
};