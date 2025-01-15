import React, { useState } from 'react';
import { Clock, HardDrive, Keyboard, XSquare, Plus, Edit2, Trash2, CheckCircle, X, ArrowUp, ArrowDown } from 'lucide-react';

const PlaybackTimeline = ({ program, isEditing, onUpdateEvents }) => {
    const [showNewEventForm, setShowNewEventForm] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [newEvent, setNewEvent] = useState({
        eventType: 'MOUNT_NEXT_DISK',
        timeOffsetSeconds: 0,
        eventData: {}
    });
    const [editingEvent, setEditingEvent] = useState(null);

    const handleMoveEvent = (direction, currentEvent) => {
        // Create a deep copy of the events array with all properties
        const events = program.playbackTimelineEvents.map(event => ({...event}));
        const currentIndex = events.findIndex(e => e.sequenceNumber === currentEvent.sequenceNumber);

        if (direction === 'up' && currentIndex > 0) {
            // Swap sequence numbers with the previous event
            const tempNumber = events[currentIndex].sequenceNumber;
            events[currentIndex].sequenceNumber = events[currentIndex - 1].sequenceNumber;
            events[currentIndex - 1].sequenceNumber = tempNumber;
        } else if (direction === 'down' && currentIndex < events.length - 1) {
            // Swap sequence numbers with the next event
            const tempNumber = events[currentIndex].sequenceNumber;
            events[currentIndex].sequenceNumber = events[currentIndex + 1].sequenceNumber;
            events[currentIndex + 1].sequenceNumber = tempNumber;
        }

        // Sort events by sequence number before updating state
        const sortedEvents = events.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
        onUpdateEvents(sortedEvents);
    };

    // Helper to format seconds into MM:SS
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

    const getNextSequenceNumber = () => {
        if (!program.playbackTimelineEvents || program.playbackTimelineEvents.length === 0) {
            return 1;
        }
        return Math.max(...program.playbackTimelineEvents.map(e => e.sequenceNumber)) + 1;
    };

    const handleAddEvent = (newEventData) => {
        if (!program.playbackTimelineEvents) {
            program.playbackTimelineEvents = [];
        }

        const nextSequenceNumber = getNextSequenceNumber();

        const newEventWithSequence = {
            ...newEventData,
            sequenceNumber: nextSequenceNumber
        };

        const updatedEvents = [...program.playbackTimelineEvents, newEventWithSequence]
            .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

        onUpdateEvents(updatedEvents);
        setShowNewEventForm(false);
        setNewEvent({
            eventType: 'MOUNT_NEXT_DISK',
            timeOffsetSeconds: 0,
            eventData: {}
        });
    };

    const handleUpdateEvent = (originalEvent, updatedEventData) => {
        const updatedEvents = program.playbackTimelineEvents.map(event =>
            event.sequenceNumber === originalEvent.sequenceNumber
                ? { ...updatedEventData, sequenceNumber: originalEvent.sequenceNumber }
                : event
        ).sort((a, b) => a.sequenceNumber - b.sequenceNumber);

        onUpdateEvents(updatedEvents);
        setEditingEventId(null);
        setEditingEvent(null);
    };

    const handleDeleteEvent = (eventToDelete) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            // First, remove the event to delete
            const filteredEvents = program.playbackTimelineEvents
                .filter(event => event !== eventToDelete);

            // Then resequence remaining events to ensure sequential numbering
            const updatedEvents = filteredEvents
                .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                .map((event, idx) => ({
                    ...event,
                    sequenceNumber: idx + 1
                }));

            onUpdateEvents(updatedEvents);
        }
    };

    const handleStartEdit = (event) => {
        setEditingEventId(event.sequenceNumber);
        setEditingEvent({ ...event });
    };

    const EventForm = ({ event, onSave, onCancel }) => {
        const [localEvent, setLocalEvent] = useState(event);

        const handleChange = (changes) => {
            setLocalEvent(prev => ({
                ...prev,
                ...changes
            }));
        };

        return (
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Event Type</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={localEvent.eventType}
                            onChange={(e) => handleChange({
                                eventType: e.target.value,
                                eventData: e.target.value === 'PRESS_KEYS' ? { keys: '' } : {}
                            })}
                        >
                            <option value="MOUNT_NEXT_DISK">Mount Next Disk</option>
                            <option value="PRESS_KEYS">Press Keys</option>
                            <option value="END_PLAYBACK">End Playback</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Time Offset (seconds)</label>
                        <input
                            type="number"
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={localEvent.timeOffsetSeconds}
                            onChange={(e) => handleChange({
                                timeOffsetSeconds: parseInt(e.target.value, 10)
                            })}
                        />
                    </div>

                    {localEvent.eventType === 'PRESS_KEYS' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Keys to Press</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={localEvent.eventData?.keys || ''}
                                onChange={(e) => handleChange({
                                    eventData: { ...localEvent.eventData, keys: e.target.value }
                                })}
                                placeholder="e.g., <F1>"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            onClick={onCancel}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            onClick={() => onSave(localEvent)}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (!program?.playbackTimelineEvents?.length && !isEditing) {
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
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Playback Timeline</h3>
                {isEditing && (
                    <button
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        onClick={() => setShowNewEventForm(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Event
                    </button>
                )}
            </div>

            <div className="p-4">
                {showNewEventForm && (
                    <div className="mb-6">
                        <h4 className="text-md font-semibold mb-2">Add New Event</h4>
                        <EventForm
                            event={newEvent}
                            onSave={(eventData) => handleAddEvent(eventData)}
                            onCancel={() => setShowNewEventForm(false)}
                        />
                    </div>
                )}

                <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                    <div className="space-y-8">
                        {program.playbackTimelineEvents?.map((event) => (
                            <div key={event.sequenceNumber} className="relative">
                                {editingEventId === event.sequenceNumber ? (
                                    <EventForm
                                        event={editingEvent}
                                        onSave={(updatedEventData) => handleUpdateEvent(event, updatedEventData)}
                                        onCancel={() => {
                                            setEditingEventId(null);
                                            setEditingEvent(null);
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-start">
                                        <div className="flex-none w-24 pt-1 text-sm text-gray-500">
                                            {formatTime(event.timeOffsetSeconds)}
                                        </div>
                                        <div className="flex-grow pl-4">
                                            <div className="flex items-center gap-2">
                                                {getEventIcon(event.eventType)}
                                                <span className="font-medium">
                                                    {getEventDescription(event)}
                                                </span>
                                            </div>
                                        </div>
                                        {isEditing && (
                                            <div className="flex-none pl-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        className="text-gray-400 hover:text-gray-600"
                                                        onClick={() => handleMoveEvent('up', event)}
                                                        disabled={event.sequenceNumber === 1}
                                                        title="Move Up"
                                                    >
                                                        <ArrowUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="text-gray-400 hover:text-gray-600"
                                                        onClick={() => handleMoveEvent('down', event)}
                                                        disabled={event.sequenceNumber === program.playbackTimelineEvents.length}
                                                        title="Move Down"
                                                    >
                                                        <ArrowDown className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="text-gray-400 hover:text-gray-600"
                                                        onClick={() => handleStartEdit(event)}
                                                        title="Edit Event"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="text-gray-400 hover:text-red-600"
                                                        onClick={() => handleDeleteEvent(event)}
                                                        title="Delete Event"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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