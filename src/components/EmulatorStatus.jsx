import React, {useEffect, useState} from 'react';
import { Container, Card, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import { useEmulatorStatus } from '../hooks/useEmulatorStatus';


const SystemStats = ({ stats }) => {
    if (!stats) return null;

    const getProgressVariant = (value) => {
        if (value > 80) return 'danger';
        if (value > 60) return 'warning';
        return 'success';
    };

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>System Stats</Card.Title>
                <Row className="mb-2">
                    <Col>
                        <label>CPU Usage</label>
                        <ProgressBar
                            now={stats.cpuUsage}
                            variant={getProgressVariant(stats.cpuUsage)}
                            label={`${stats.cpuUsage.toFixed(1)}%`}
                        />
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <label>Memory Usage</label>
                        <ProgressBar
                            now={stats.memoryUsage}
                            variant={getProgressVariant(stats.memoryUsage)}
                            label={`${stats.memoryUsage.toFixed(1)}%`}
                        />
                    </Col>
                </Row>
                {stats.temperature && (
                    <Row>
                        <Col>
                            <label>Temperature</label>
                            <ProgressBar
                                now={(stats.temperature / 100) * 100}
                                variant={getProgressVariant((stats.temperature / 100) * 100)}
                                label={`${stats.temperature.toFixed(1)}°C`}
                            />
                        </Col>
                    </Row>
                )}
            </Card.Body>
        </Card>
    );
};

const ProcessStats = ({ process }) => {
    if (!process) return null;

    return (
        <Card className="mt-3">
            <Card.Body>
                <Card.Title>Process Information</Card.Title>
                <p className="mb-1">PID: {process.pid}</p>
                <p className="mb-1">CPU Usage: {process.cpu_percent.toFixed(1)}%</p>
                <p className="mb-0">Memory Usage: {process.memory_percent.toFixed(1)}%</p>
            </Card.Body>
        </Card>
    );
};

const ErrorDisplay = ({ error }) => {
    if (!error) return null;

    return (
        <Alert variant="danger" className="mt-3">
            <Alert.Heading>{error.code}</Alert.Heading>
            <p>{error.message}</p>
            {error.details && (
                <pre className="mt-2 mb-0 small">
          {JSON.stringify(error.details, null, 2)}
        </pre>
            )}
        </Alert>
    );
};

const EmulatorStatus = () => {
    const { status, error, isConnected } = useEmulatorStatus();
    const [buildInfo, setBuildInfo] = useState(null);
    const version = import.meta.env.VITE_APP_VERSION || 'dev';

    const formatUptime = (seconds) => {
        if (!seconds) return '0s';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        parts.push(`${remainingSeconds}s`);
        return parts.join(' ');
    };

    useEffect(() => {
        // Fetch build info on component mount
        fetch('/api/build-info')
            .then(res => res.json())
            .then(info => setBuildInfo(info));
    }, []);


    return (
        <Container className="mt-4">
            <h1>Retro Launcher</h1>

            {!isConnected && (
                <Alert variant="warning" className="mt-3">
                    Not connected to emulator - updates paused
                </Alert>
            )}

            <ErrorDisplay error={error} />

            {status && (
                <>
                    <Card className="mt-3">
                        <Card.Body>
                            <Card.Title>Emulator Status</Card.Title>
                            <Alert variant={status.running ? 'success' : 'warning'}>
                                Status: {status.running ? 'Running' : 'Stopped'}
                            </Alert>
                            <p className="mb-2">State: {status.state}</p>
                            <p className="mb-2">Monitor Mode: {status.monitorMode}</p>
                            {status.currentDemo && (
                                <p className="mb-2">Current Demo: {status.currentDemo}</p>
                            )}
                            <p className="mb-0">
                                Uptime: {formatUptime(Math.floor(status.uptime))}
                            </p>
                        </Card.Body>
                    </Card>

                    <SystemStats stats={status.systemStats}/>
                    <ProcessStats process={status.process}/>
                    <div className="version-info">
                        <div>Frontend Version: {version}</div>
                        {buildInfo && (
                            <>
                                <div>Controller Version: {buildInfo.controllerVersion}</div>
                                <div>Agent Version: {buildInfo.agentVersion}</div>
                            </>
                        )}
                        {/* Rest of status display */}
                    </div>
                </>
            )}
        </Container>
    );
};

export default EmulatorStatus;