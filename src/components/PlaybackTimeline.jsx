import React from 'react';
import { Clock, HardDrive, Keyboard, XSquare } from 'lucide-react';

const PlaybackTimeline = ({ program, isEditing, onUpdateEvents }) => {
    // Helper to format seconds into MM:SS, also include seconds as a whole number
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')} (${seconds}s)`;
    };

    // Get icon for event type
    const getEventIcon = (eventType) => {
        switch (eventType) {
            case 'MOUNT_NEXT_DISK':
                return <HardDrive className="w-4 h-4" />;
            case 'PRESS_KEYS':
                return <Keyboard className="w-4 h-4" />;
            case 'END_PLAYBACK':
                return <XSquare className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    // Get event description
    const getEventDescription = (event) => {
        switch (event.eventType) {
            case 'MOUNT_NEXT_DISK':
                return 'Mount next disk';
            case 'PRESS_KEYS':
                return `Press keys: ${event.eventData?.keys || 'Unknown'}`;
            case 'END_PLAYBACK':
                return 'End playback';
            default:
                return event.description || 'Unknown event';
        }
    };

    if (!program?.playbackTimelineEvents?.length) {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <div className="text-gray-500">
                    No timeline events configured
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Playback Timeline</h3>
            </div>

            <div className="p-4">
                <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

                    {/* Timeline events */}
                    <div className="space-y-8">
                        {program.playbackTimelineEvents.map((event, index) => (
                            <div key={event.id} className={`relative flex items-start ${index % 2 === 0 ? 'bg-secondary-subtle' : 'bg-white'}`}>
                                {/* Event time */}
                                <div className="flex-none w-24 pt-1 text-sm text-gray-500">
                                    {formatTime(event.timeOffsetSeconds)}
                                    &nbsp;&nbsp;
                                    {getEventIcon(event.eventType)}
                                    <div className="flex-grow pt-1">
                                        <div className="font-medium">
                                            {getEventDescription(event)}
                                        </div>
                                        {event.description && (
                                            <div className="mt-1 text-sm text-gray-500">
                                                {event.description}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Event content */}

                                {/* Edit/Delete buttons if editing */}
                                {isEditing && (
                                    <div className="flex-none pl-4">
                                        <button
                                            className="text-gray-400 hover:text-gray-600"
                                            onClick={() => {/* Add edit handler */
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaybackTimeline;