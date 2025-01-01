import { useState, useEffect } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { getWebSocketUrl, WS_ENDPOINTS } from '../config/websocket';

export const useEmulatorStatus = () => {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new ReconnectingWebSocket(
            getWebSocketUrl(WS_ENDPOINTS.STATUS),
            undefined,
            {
                maxRetries: 10,
                minReconnectionDelay: 2000,
                maxReconnectionDelay: 10000,
                debug: false
            }
        );

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setError(null);
        };

        ws.onmessage = (event) => {
            try {
                console.log(event);
                const data = JSON.parse(event.data);
                console.log(data);
                setStatus(data);
                setError(null);
            } catch (err) {
                console.error('Error parsing WebSocket message:', err);
                setError('Failed to parse status update');
            }
        };

        ws.onerror = (event) => {
            console.error('WebSocket error:', event);
            setError('WebSocket connection error');
            setIsConnected(false);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        return () => ws.close();
    }, []);

    console.log("Asking to return emulator status")
    return { status, error, isConnected };
}