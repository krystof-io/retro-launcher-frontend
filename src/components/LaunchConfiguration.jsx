import { useState } from 'react';

const LaunchConfiguration = ({ program }) => {
    const [showAllArguments, setShowAllArguments] = useState(false);

    if (!program || !program.platformBinary) {
        return (
            <div className="p-4 bg-white rounded-lg shadow">
                <p className="text-gray-500">No launch configuration available</p>
            </div>
        );
    }

    const { platformBinary, launchArguments = [], diskImages = [] } = program;
    const binaryArguments = platformBinary.launchArguments || [];

    // Sort arguments by order
    const sortedBinaryArgs = [...binaryArguments].sort((a, b) => a.argumentOrder - b.argumentOrder);
    const sortedProgramArgs = [...launchArguments].sort((a, b) => a.argumentOrder - b.argumentOrder);

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

        // Add autostart with first disk if available
        const fileArg = sortedBinaryArgs.find(arg => arg.fileArgument);
        if (fileArg && firstDiskImage?.filePath) {
            parts.push(fileArg.argumentTemplate);
            parts.push(firstDiskImage.filePath);
        }

        return parts.join(' ');
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
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
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
                                    <td className="px-4 py-2 text-sm text-gray-500">{arg.description}</td>
                                </tr>
                            ))}

                        {/* Program Arguments */}
                        {sortedProgramArgs.map((arg, index) => (
                            <tr key={`program-${index}`} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-500">Program</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{arg.argumentOrder}</td>
                                <td className="px-4 py-2">
                                    <code className="px-2 py-1 bg-gray-100 rounded">{arg.argumentValue}</code>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">{arg.description}</td>
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
                                <td className="px-4 py-2 text-sm text-gray-500">Boot disk image</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

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