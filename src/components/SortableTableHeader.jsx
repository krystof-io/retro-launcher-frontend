import React from 'react';
import { ArrowUpNarrowWide, ArrowDownNarrowWide, ArrowDownUp } from 'lucide-react';

const SortableTableHeader = ({ field, label, currentSort, onSort }) => {
    const handleClick = () => {
        if (currentSort.field === field) {
            // Toggle direction if already sorting by this field
            onSort(field, currentSort.direction === 'ASC' ? 'DESC' : 'ASC');
        } else {
            // Default to ascending for new sort field
            onSort(field, 'ASC');
        }
    };

    const getSortIcon = () => {
        if (currentSort.field !== field) {
            return <ArrowDownUp className="w-4 h-4 text-gray-400" />;
        }
        return currentSort.direction === 'ASC' ?
            <ArrowUpNarrowWide className="w-4 h-4 text-blue-600" /> :
            <ArrowDownNarrowWide className="w-4 h-4 text-blue-600" />;
    };

    return (
        <th
            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-50"
            onClick={handleClick}
        >
            <div className="flex items-center gap-1">
                {label}
                {getSortIcon()}
            </div>
        </th>
    );
};

export default SortableTableHeader;