// src/components/EmulatorStatus.jsx
import { Container, Card, Alert } from 'react-bootstrap';
import { useEmulatorStatus } from '../hooks/useEmulatorStatus.jsx';

const EmulatorStatus = () => {
    const { status, error, isConnected } = useEmulatorStatus();

    return (
        <Container className="mt-4">
            <h1>Retro Launcher</h1>

            {!isConnected && (
                <Alert variant="warning" className="mt-3">
                    Not connected to emulator - updates paused
                </Alert>
            )}

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
                        {status.currentDemo && (
                            <p className="mb-2">Current Demo: {status.currentDemo}</p>
                        )}
                        <p className="mb-0">
                            Uptime: {Math.floor(status.uptime)} seconds
                        </p>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default EmulatorStatus;