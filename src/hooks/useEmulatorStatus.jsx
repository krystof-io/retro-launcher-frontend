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
                const message = JSON.parse(event.data);
                console.log('Received message:', message);

                switch (message.type) {
                    case 'STATUS_UPDATE':
                        setStatus(message.payload);
                        setError(null);
                        break;
                    case 'ERROR':
                        setError(message.payload);
                        break;
                    default:
                        console.warn('Unknown message type:', message.type);
                }
            } catch (err) {
                console.error('Error parsing WebSocket message:', err);
                setError({
                    code: 'PARSE_ERROR',
                    message: 'Failed to parse status update',
                    details: { error: err.message }
                });
            }
        };

        ws.onerror = (event) => {
            console.error('WebSocket error:', event);
            setError({
                code: 'CONNECTION_ERROR',
                message: 'WebSocket connection error',
                details: { event }
            });
            setIsConnected(false);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        return () => ws.close();
    }, []);

    return { status, error, isConnected };
};