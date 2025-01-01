
/**
 * Configuration for WebSocket connections
 */
const config = {
    // Base WebSocket URL determined by environment
    baseUrl: import.meta.env.DEV
        ? 'ws://localhost:8080'
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`,

    // WebSocket endpoints
    endpoints: {
        status: '/ws/status'
    },

    // Connection settings
    settings: {
        reconnectInterval: 5000,  // Time to wait before reconnecting (ms)
        maxReconnectAttempts: 5   // Maximum number of reconnection attempts
    }
};

// Helper to get full WebSocket URLs
export const getWebSocketUrl = (endpoint) => {
    const path = config.endpoints[endpoint];
    if (!path) {
        throw new Error(`Unknown WebSocket endpoint: ${endpoint}`);
    }
    return `${config.baseUrl}${path}`;
};

// Export the config for reference
export const wsConfig = config;

// Export specific endpoints for convenience
export const WS_ENDPOINTS = {
    STATUS: 'status'
};