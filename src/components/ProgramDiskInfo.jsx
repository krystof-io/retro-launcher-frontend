import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, HardDrive, MinusCircle, Download, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import ClickToCopy from './ClickToCopy';

const ProgramDiskInfo = ({ program, isEditing, onUpdateDiskImages }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!program || !program.diskImages || program.diskImages.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 text-gray-500">
                    <MinusCircle className="w-5 h-5" />
                    <span>No disk images available</span>
                </div>
            </div>
        );
    }

    const sortedDisks = [...program.diskImages].sort((a, b) => a.diskNumber - b.diskNumber);
    const totalSize = sortedDisks.reduce((sum, disk) => sum + disk.fileSize, 0);

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const handleDownload = async (diskId) => {
        try {
            const response = await fetch(`/api/disk-images/${diskId}/download`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            const disposition = response.headers.get('content-disposition');
            const filename = disposition && disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/)[1];

            link.href = url;
            link.setAttribute('download', decodeURIComponent(filename));
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading disk image:', error);
            // You might want to show an error message to the user here
        }
    };

    const handleMove = (diskId, direction) => {
        const currentIndex = sortedDisks.findIndex(disk => disk.id === diskId);
        if (direction === 'up' && currentIndex > 0) {
            // Swap disk numbers with the previous disk
            const newDisks = [...sortedDisks];
            const temp = newDisks[currentIndex].diskNumber;
            newDisks[currentIndex].diskNumber = newDisks[currentIndex - 1].diskNumber;
            newDisks[currentIndex - 1].diskNumber = temp;
            onUpdateDiskImages(newDisks);
        } else if (direction === 'down' && currentIndex < sortedDisks.length - 1) {
            // Swap disk numbers with the next disk
            const newDisks = [...sortedDisks];
            const temp = newDisks[currentIndex].diskNumber;
            newDisks[currentIndex].diskNumber = newDisks[currentIndex + 1].diskNumber;
            newDisks[currentIndex + 1].diskNumber = temp;
            onUpdateDiskImages(newDisks);
        }
    };

    const handleDelete = (diskId) => {
        if (window.confirm('Are you sure you want to remove this disk image?')) {
            const newDisks = sortedDisks.filter(disk => disk.id !== diskId);
            // Reorder remaining disks
            newDisks.forEach((disk, index) => {
                disk.diskNumber = index + 1;
            });
            onUpdateDiskImages(newDisks);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header Section */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-blue-500" />
                    <div>
                        <h3 className="font-semibold text-lg">
                            Program Disks ({sortedDisks.length})
                        </h3>
                        <p className="text-sm text-gray-500">
                            Total Size: {formatBytes(totalSize)}
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t">
                    <div className="p-4">
                        <div className="overflow-x-auto">
                            <table className="min-w-full" width="100%">
                                <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="pb-2 font-medium">#</th>
                                    <th className="pb-2 font-medium">Name</th>
                                    <th className="pb-2 font-medium">Size</th>
                                    <th className="pb-2 font-medium">Image Name</th>
                                    <th className="pb-2 font-medium">Hash</th>
                                    <th className="pb-2 font-medium">Storage Path</th>
                                    <th className="pb-2 font-medium">Status</th>
                                    <th className="pb-2 font-medium">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y">
                                {sortedDisks.map((disk, index) => (
                                    <tr key={disk.id} className="hover:bg-gray-50">
                                        <td className="py-3">
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-sm font-medium">
                                                {disk.diskNumber}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <div>
                                                <div className="font-medium">
                                                    {disk.displayName || `Disk ${disk.diskNumber}`}
                                                </div>
                                                {disk.description && (
                                                    <div className="text-sm text-gray-500">
                                                        {disk.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 text-gray-500">
                                            {formatBytes(disk.fileSize)}
                                        </td>
                                        <td className="py-3">
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
                                                {disk.imageName}
                                            </code>
                                        </td>
                                        <td className="py-3">
                                            <ClickToCopy
                                                text={disk.fileHash}
                                                className="text-xs bg-gray-100 px-2 py-1 rounded break-all"
                                            />
                                        </td>
                                        <td className="py-3">
                                            <ClickToCopy
                                                text={disk.storagePath}
                                                className="text-xs bg-gray-100 px-2 py-1 rounded break-all"
                                            />
                                        </td>
                                        <td className="py-3">
                                            {disk.diskNumber === 1 ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                    Boot Disk
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                            onClick={() => handleMove(disk.id, 'up')}
                                                            disabled={index === 0}
                                                            title="Move Up"
                                                        >
                                                            <ArrowUp className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                            onClick={() => handleMove(disk.id, 'down')}
                                                            disabled={index === sortedDisks.length - 1}
                                                            title="Move Down"
                                                        >
                                                            <ArrowDown className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="p-1 text-red-500 hover:text-red-700"
                                                            onClick={() => handleDelete(disk.id)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="px-2 py-1 bg-blue-500 text-black rounded text-sm hover:bg-blue-600"
                                                        onClick={() => handleDownload(disk.id)}
                                                    >
                                                        <Download className="w-4 h-4 inline-block mr-1"/>
                                                        Download
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* File Integrity Warning */}
                        {sortedDisks.some(disk => !disk.fileHash) && (
                            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm">
                                    Some disk images are missing hash verification
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramDiskInfo;