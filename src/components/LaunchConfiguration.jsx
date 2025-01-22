import { useState } from 'react';
import { PlusCircle, Trash2, Save, X } from 'lucide-react';
import ArgumentSuggestions  from "./ArgumentSuggestions.jsx";

const LaunchConfiguration = ({ program, isEditing = false, onUpdateLaunchArgs }) => {
    const [showAllArguments, setShowAllArguments] = useState(false);
    const [localLaunchArgs, setLocalLaunchArgs] = useState(
        program?.launchArguments?.length
            ? [...program.launchArguments].sort((a, b) => a.argumentOrder - b.argumentOrder)
            : []
    );
    const [newArgument, setNewArgument] = useState({
        argumentValue: '',
        argumentGroup: '',
        description: ''
    });

    if (!program || !program.platformBinary) {
        return (
            <div className="p-4 bg-white rounded-lg shadow">
                <p className="text-gray-500">No launch configuration available</p>
            </div>
        );
    }

    const { platformBinary, diskImages = [] } = program;
    const binaryArguments = platformBinary.launchArguments || [];

    // Sort arguments by order
    const sortedBinaryArgs = [...binaryArguments].sort((a, b) => a.argumentOrder - b.argumentOrder);
    const sortedProgramArgs = isEditing
        ? localLaunchArgs
        : [...(program.launchArguments || [])].sort((a, b) => a.argumentOrder - b.argumentOrder);

    // Get first disk image path (if any)
    const firstDiskImage = [...diskImages]
        .sort((a, b) => a.diskNumber - b.diskNumber)
        .find(di => di);

    // Build complete launch command
    const buildCommand = () => {
        const parts = [];

        // Add binary name
        parts.push(platformBinary.name);

        // Add binary arguments (excluding file argument)
        sortedBinaryArgs
            .filter(arg => !arg.fileArgument)
            .forEach(arg => parts.push(arg.argumentTemplate));

        // Add program-specific arguments
        sortedProgramArgs.forEach(arg => parts.push(arg.argumentValue));

        if (firstDiskImage) {
        // Add autostart with first disk if available
        sortedBinaryArgs
            .filter(arg => arg.fileArgument)
            .forEach(arg => {
                parts.push(arg.argumentTemplate)
                parts.push('<fullpath>/' + firstDiskImage.imageName)
            });
        } else {
            parts.push('No disk images available');
        }
        return parts.join(' ');
    };

    // Editing methods
    const handleAddArgument = () => {
        if (!newArgument.argumentValue) return;

        const newArg = {
            ...newArgument,
            argumentOrder: localLaunchArgs.length > 0
                ? Math.max(...localLaunchArgs.map(arg => arg.argumentOrder)) + 1
                : 1
        };

        const updatedArgs = [...localLaunchArgs, newArg];
        setLocalLaunchArgs(updatedArgs);

        // Reset new argument form
        setNewArgument({
            argumentValue: '',
            argumentGroup: '',
            description: ''
        });

        // Notify parent component of update
        if (onUpdateLaunchArgs) {
            onUpdateLaunchArgs(updatedArgs);
        }
    };

    const handleDeleteArgument = (argToDelete) => {
        const updatedArgs = localLaunchArgs
            .filter(arg => arg !== argToDelete)
            // Reorder the arguments to maintain correct order
            .map((arg, index) => ({
                ...arg,
                argumentOrder: index + 1
            }));

        setLocalLaunchArgs(updatedArgs);

        // Notify parent component of update
        if (onUpdateLaunchArgs) {
            onUpdateLaunchArgs(updatedArgs);
        }
    };

    const handleUpdateArgument = (oldArg, updatedFields) => {
        const updatedArgs = localLaunchArgs.map(arg =>
            arg === oldArg
                ? { ...arg, ...updatedFields }
                : arg
        );

        setLocalLaunchArgs(updatedArgs);

        // Notify parent component of update
        if (onUpdateLaunchArgs) {
            onUpdateLaunchArgs(updatedArgs);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            {/* Binary Information */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Platform Binary</h3>
                <div className="ml-4">
                    <p className="text-gray-700">{platformBinary.name} ({platformBinary.variant} variant)</p>
                    {platformBinary.description && (
                        <p className="text-sm text-gray-500">{platformBinary.description}</p>
                    )}
                </div>
            </div>

            {/* Arguments List */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Launch Arguments</h3>
                    <button
                        onClick={() => setShowAllArguments(!showAllArguments)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        {showAllArguments ? 'Show Essential' : 'Show All'}
                    </button>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Argument</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            {isEditing &&
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {/* Binary Arguments */}
                        {sortedBinaryArgs
                            .filter(arg => showAllArguments || arg.isRequired)
                            .map((arg, index) => (
                                <tr key={`binary-${index}`} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-500">Binary</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{arg.argumentOrder}</td>
                                    <td className="px-4 py-2">
                                        <code className="px-2 py-1 bg-gray-100 rounded">{arg.argumentTemplate}</code>
                                    </td>
                                    <td className="px-4 py-2">
                                        <code className="px-2 py-1 bg-gray-100 rounded"></code>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{arg.description}</td>
                                    {isEditing && <td></td>}
                                </tr>
                            ))}

                        {/* Program Arguments */}
                        {sortedProgramArgs.map((arg, index) => (
                            <tr key={`program-${index}`} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-500">Program</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{arg.argumentOrder}</td>
                                <td className="px-4 py-2">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="w-full border rounded px-2 py-1"
                                            value={arg.argumentValue}
                                            onChange={(e) => handleUpdateArgument(arg, {argumentValue: e.target.value})}
                                        />

                                    ) : (
                                        <code className="px-2 py-1 bg-gray-100 rounded">{arg.argumentValue}</code>
                                    )}



                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="w-full border rounded px-2 py-1"
                                            value={arg.argumentGroup}
                                            onChange={(e) => handleUpdateArgument(arg, {argumentGroup: e.target.value})}
                                        />
                                    ) : (
                                        arg.argumentGroup
                                    )}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="w-full border rounded px-2 py-1"
                                            value={arg.description}
                                            onChange={(e) => handleUpdateArgument(arg, {description: e.target.value})}
                                        />
                                    ) : (
                                        arg.description
                                    )}
                                </td>
                                {isEditing && (
                                    <td className="px-4 py-2">
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDeleteArgument(arg)}
                                            title="Delete Argument"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                        <ArgumentSuggestions
                                            onSelect={(value) => handleUpdateArgument(arg, {argumentValue: value})}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}

                        {/* Disk Image */}
                        {firstDiskImage && (
                            <tr className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-500">Disk</td>
                                <td className="px-4 py-2 text-sm text-gray-500">999</td>
                                <td className="px-4 py-2">
                                    <code className="px-2 py-1 bg-gray-100 rounded">{firstDiskImage.filePath}</code>
                                </td>
                                <td className="px-4 py-2">
                                    <code className="px-2 py-1 bg-gray-100 rounded"></code>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">Boot disk image</td>
                                {isEditing && <td></td>}
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Argument Form (only in edit mode) */}
            {isEditing && (
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <h4 className="text-md font-semibold mb-2">Add New Argument</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                            type="text"
                            placeholder="Argument Value"
                            className="border rounded px-2 py-1"
                            value={newArgument.argumentValue}
                            onChange={(e) => setNewArgument(prev => ({ ...prev, argumentValue: e.target.value }))}
                        />
                        <input
                            type="text"
                            placeholder="Argument Group"
                            className="border rounded px-2 py-1"
                            value={newArgument.argumentGroup}
                            onChange={(e) => setNewArgument(prev => ({ ...prev, argumentGroup: e.target.value }))}
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            className="border rounded px-2 py-1"
                            value={newArgument.description}
                            onChange={(e) => setNewArgument(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>
                    <button
                        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-2 hover:bg-blue-600"
                        onClick={handleAddArgument}
                        disabled={!newArgument.argumentValue}
                    >
                        <PlusCircle size={16} />
                        Add Argument
                    </button>
                </div>
            )}

            {/* Command Preview */}
            <div>
                <h3 className="text-lg font-semibold mb-2">Command Preview</h3>
                <div className="p-4 bg-gray-100 rounded-lg overflow-x-auto">
                    <code className="whitespace-nowrap">{buildCommand()}</code>
                </div>
            </div>
        </div>
    );
};

export default LaunchConfiguration;