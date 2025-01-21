import React from 'react';
import { Pagination } from 'react-bootstrap';
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';

const WindowedPagination = ({ currentPage, totalPages, onPageChange, maxVisible = 5 }) => {
    // Don't show pagination if there's only one page
    if (totalPages <= 1) return null;

    // Calculate the window of pages to show
    const getPageWindow = () => {
        // If total pages is less than or equal to max visible, show all pages
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Calculate the window start and end
        let start = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
        let end = start + maxVisible - 1;

        // Adjust if end exceeds total pages
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(end - maxVisible + 1, 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const pageWindow = getPageWindow();

    return (
        <Pagination className="justify-content-center mt-4">
            {/* First Page */}
            <Pagination.Item
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
            >
                <ChevronsLeft size={16} />
            </Pagination.Item>

            {/* Previous Page */}
            <Pagination.Item
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={16} />
            </Pagination.Item>

            {/* Show ellipsis if start > 1 */}
            {pageWindow[0] > 1 && (
                <Pagination.Ellipsis disabled />
            )}

            {/* Page Numbers */}
            {pageWindow.map(pageNum => (
                <Pagination.Item
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => onPageChange(pageNum)}
                >
                    {pageNum}
                </Pagination.Item>
            ))}

            {/* Show ellipsis if end < totalPages */}
            {pageWindow[pageWindow.length - 1] < totalPages && (
                <Pagination.Ellipsis disabled />
            )}

            {/* Next Page */}
            <Pagination.Item
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight size={16} />
            </Pagination.Item>

            {/* Last Page */}
            <Pagination.Item
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
            >
                <ChevronsRight size={16} />
            </Pagination.Item>
        </Pagination>
    );
};

export default WindowedPagination;