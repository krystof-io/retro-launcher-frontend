import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { Play, Square, FastForward, Keyboard, Save, Plus } from 'lucide-react';
import { useEmulatorStatus } from '../hooks/useEmulatorStatus';

const CurationInterface = ({ program, onUpdateTimeline, onClose }) => {
    const { status, error, isConnected } = useEmulatorStatus();
    const [isLaunching, setIsLaunching] = useState(false);
    const [events, setEvents] = useState([]);  // Always start with empty timeline in curation mode
    const [startTime, setStartTime] = useState(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Handle precise elapsed time tracking
    useEffect(() => {
        let animationFrameId;
        let lastTimestamp;

        const updateElapsedTime = (timestamp) => {
            if (startTime && status?.running) {
                if (!lastTimestamp) lastTimestamp = timestamp;

                // Calculate precise elapsed time
                const elapsed = (Date.now() - startTime) / 1000;
                setElapsedSeconds(Math.floor(elapsed));

                // Request next frame
                animationFrameId = requestAnimationFrame(updateElapsedTime);
            }
        };

        if (startTime && status?.running) {
            animationFrameId = requestAnimationFrame(updateElapsedTime);
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [startTime, status?.running]);

    // Launch the program for curation
    const handleLaunch = async () => {
        try {
            setIsLaunching(true);
            const response = await fetch(`/api/curate/${program.id}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to launch program');
            setStartTime(Date.now());
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
            setStartTime(null);
            setElapsedSeconds(0);
        } catch (err) {
            console.error('Stop error:', err);
        }
    };

    // Add a disk change event and execute it
    const handleNextDisk = async () => {
        try {
            // Execute the command on the agent
            const response = await fetch('/api/program/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    command: 'MOUNT_NEXT_DISK'
                })
            });

            if (!response.ok) throw new Error('Failed to execute disk change');

            // Record the event with precise timing
            const newEvent = {
                sequenceNumber: events.length + 1,
                eventType: 'MOUNT_NEXT_DISK',
                timeOffsetSeconds: elapsedSeconds
            };
            setEvents([...events, newEvent]);
        } catch (err) {
            console.error('Error executing disk change:', err);
        }
    };

    // Add a keypress event and execute it
    const handleAddKeypress = async () => {
        const keySequence = prompt('Enter key sequence (e.g., <F1>, <RETURN>):');
        if (keySequence) {
            try {
                // Execute the command on the agent
                const response = await fetch('/api/program/command', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        command: 'PRESS_KEYS',
                        data: { keys: keySequence }
                    })
                });

                if (!response.ok) throw new Error('Failed to execute keypress');

                // Record the event with precise timing
                const newEvent = {
                    sequenceNumber: events.length + 1,
                    eventType: 'PRESS_KEYS',
                    timeOffsetSeconds: elapsedSeconds,
                    eventData: { keys: keySequence }
                };
                setEvents([...events, newEvent]);
            } catch (err) {
                console.error('Error executing keypress:', err);
            }
        }
    };

    // Handle finish curation
    const handleFinish = async () => {
        try {
            // Send finish command to agent
            const response = await fetch('/api/program/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    command: 'END_PLAYBACK'
                })
            });

            if (!response.ok) throw new Error('Failed to execute finish command');

            // Record the final event with precise timing
            const newEvent = {
                sequenceNumber: events.length + 1,
                eventType: 'END_PLAYBACK',
                timeOffsetSeconds: elapsedSeconds
            };
            setEvents([...events, newEvent]);

            // Stop playback
            await handleStop();


        } catch (err) {
            console.error('Error finishing curation:', err);
        }
    };

    // Save timeline and exit curation mode
    const handleSave = async () => {
        // Add final end event
        const finalEvents = [
            ...events,
            {
                sequenceNumber: events.length + 1,
                eventType: 'END_PLAYBACK',
                timeOffsetSeconds: elapsedSeconds
            }
        ];

        // Save back to parent
        onUpdateTimeline(finalEvents);

        // Stop playback if running
        if (status?.running) {
            await handleStop();
        }

        onClose();
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
                <Card.Header className="bg-blue-500">
                    <h3 className="text-xl font-semibold">Curating: {program.title}</h3>
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
                                        {isLaunching ? 'Launching...' : 'Start Playback'}
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

                    {/* Timeline Controls */}
                    {status?.running && (
                        <div className="mb-4 flex gap-2">
                            <Button
                                variant="outline-primary"
                                onClick={handleNextDisk}
                                className="flex items-center gap-2"
                            >
                                <FastForward className="w-4 h-4" />
                                Next Disk
                            </Button>
                            <Button
                                variant="outline-primary"
                                onClick={handleAddKeypress}
                                className="flex items-center gap-2"
                            >
                                <Keyboard className="w-4 h-4" />
                                Add Keypress
                            </Button>
                            {/*<Button*/}
                            {/*    variant="outline-danger"*/}
                            {/*    onClick={handleFinish}*/}
                            {/*    className="flex items-center gap-2 ml-auto"*/}
                            {/*>*/}
                            {/*    <Square className="w-4 h-4" />*/}
                            {/*    Finish Curation*/}
                            {/*</Button>*/}
                        </div>
                    )}

                    {/* Timeline Events */}
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">Timeline Events</h4>
                        <div className="space-y-2">
                            {events.length === 0 ? (
                                <div className="text-gray-500 italic">
                                    No events recorded yet
                                </div>
                            ) : (
                                events.map((event, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                    >
                                        <div>
                                            <span className="font-mono">
                                                {formatTime(event.timeOffsetSeconds)}
                                            </span>
                                            <span className="mx-2">-</span>
                                            <span className="font-medium">
                                                {event.eventType}
                                            </span>
                                            {event.eventData?.keys && (
                                                <span className="ml-2 text-gray-600">
                                                    ({event.eventData.keys})
                                                </span>
                                            )}
                                        </div>
                                        <Button
                                            variant="link"
                                            className="text-red-500"
                                            onClick={() => setEvents(events.filter((_, i) => i !== index))}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Card.Body>

                <Card.Footer className="flex justify-between">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        className="flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Timeline
                    </Button>
                </Card.Footer>
            </Card>
        </div>
    );
};

export default CurationInterface;