import React, { useState, useEffect } from 'react';
import { Lightbulb, ArrowRight, Copy } from 'lucide-react';

const ArgumentSuggestions = ({ onSelect }) => {
    const [suggestions, setSuggestions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                setIsLoading(true);

                const response = await fetch(`/api/program-arguments/distinct`);
                if (!response.ok) throw new Error('Failed to fetch suggestions');

                const data = await response.json();
                setSuggestions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    },[] );

    if (isLoading) return null;
    if (error) return null;

    // Don't show if no suggestions
    const totalSuggestions = Object.values(suggestions).flat().length;
    if (totalSuggestions === 0) return null;

    return (
        <div className="mt-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
                <Lightbulb className="w-4 h-4" />
                Previously used arguments ({totalSuggestions})
            </button>

            {isExpanded && (
                <div className="mt-2 space-y-4">
                    {Object.entries(suggestions).map(([groupName, args]) => (
                        <div key={groupName} className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">
                                {groupName}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {args.map((arg, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onSelect(arg)}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                                    >
                                        {arg}
                                        <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArgumentSuggestions;