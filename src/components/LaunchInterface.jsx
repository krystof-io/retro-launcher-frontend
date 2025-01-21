import React from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { Play, Square } from 'lucide-react';
import { useEmulatorStatus } from '../hooks/useEmulatorStatus';

const LaunchInterface = ({ program, onClose }) => {
    const { status, error, isConnected } = useEmulatorStatus();
    const [isLaunching, setIsLaunching] = React.useState(false);
    const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

    // Handle precise elapsed time tracking
    React.useEffect(() => {
        let animationFrameId;
        let startTime;

        const updateElapsedTime = () => {
            if (status?.running) {
                const elapsed = (Date.now() - startTime) / 1000;
                setElapsedSeconds(Math.floor(elapsed));
                animationFrameId = requestAnimationFrame(updateElapsedTime);
            }
        };

        if (status?.running && !startTime) {
            startTime = Date.now();
            animationFrameId = requestAnimationFrame(updateElapsedTime);
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [status?.running]);

    // Launch the program
    const handleLaunch = async () => {
        try {
            setIsLaunching(true);
            const response = await fetch(`/api/launch/${program.id}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to launch program');
        } catch (err) {
            console.error('Launch error:', err);
        } finally {
            setIsLaunching(false);
        }
    };

    // Stop the current playback
    const handleStop = async () => {
        try {
            await fetch('/api/program/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ force: false })
            });
            setElapsedSeconds(0);
        } catch (err) {
            console.error('Stop error:', err);
        }
    };

    // Format seconds as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl">
                <Card.Header className="bg-green-500 ">
                    <h3 className="text-xl font-semibold">Launching: {program.title}</h3>
                </Card.Header>

                <Card.Body>
                    {/* Status Section */}
                    <div className="mb-4">
                        {!isConnected && (
                            <Alert variant="warning">
                                Not connected to emulator - updates paused
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="danger">
                                {error.message}
                            </Alert>
                        )}

                        <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
                            <div>
                                <div className="font-semibold">
                                    Status: {status?.running ? 'Running' : 'Stopped'}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Elapsed: {formatTime(elapsedSeconds)}
                                </div>
                            </div>

                            <div className="space-x-2">
                                {!status?.running ? (
                                    <Button
                                        variant="success"
                                        onClick={handleLaunch}
                                        disabled={isLaunching}
                                        className="flex items-center gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        {isLaunching ? 'Launching...' : 'Start Program'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="danger"
                                        onClick={handleStop}
                                        className="flex items-center gap-2"
                                    >
                                        <Square className="w-4 h-4" />
                                        Stop
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card.Body>

                <Card.Footer className="flex justify-between">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </Card.Footer>
            </Card>
        </div>
    );
};

export default LaunchInterface;