// src/App.jsx
import { useState, useEffect } from 'react';
import { Container, Card, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch('/api/status');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setStatus(data);
                setError(null);
            } catch (error) {
                console.error('Error fetching status:', error);
                setError(error.message || 'An error occurred');
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Container className="mt-4">
            <h1>Retro Launcher</h1>

            {error && (
                <Alert variant="danger" className="mt-3">
                    Error: {error}
                </Alert>
            )}

            {status && (
                <Card className="mt-3">
                    <Card.Body>
                        <Card.Title>Emulator Status</Card.Title>
                        <Alert variant={status.running ? 'success' : 'warning'}>
                            Status: {status.running ? 'Running' : 'Stopped'}
                        </Alert>
                        {status.currentDemo && <p>Current Demo: {status.currentDemo}</p>}
                        <p>Uptime: {Math.floor(status.uptime / 5000)} seconds</p>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
}

export default App;