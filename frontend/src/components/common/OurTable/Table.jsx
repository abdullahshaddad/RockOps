import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import './Table.scss';

/**
 * Reusable Table Component with adaptive column widths, pagination, filters, and sorting
 *
 * @param {Object} props
 * @param {Array} props.columns - Array of column objects with enhanced options
 * @param {Array} props.data - Array of objects with data matching column ids
 * @param {Function} props.onRowClick - Optional function to handle row clicks
 * @param {Boolean} props.isLoading - Optional loading state
 * @param {String} props.emptyMessage - Optional message to display when there's no data
 * @param {Object} props.actionConfig - Optional configuration for action column
 * @param {String} props.className - Optional additional class name
 * @param {Number} props.itemsPerPage - Number of items per page (default: 10)
 * @param {Boolean} props.enablePagination - Enable/disable pagination (default: true)
 * @param {Boolean} props.enableSorting - Enable/disable sorting (default: true)
 * @param {Boolean} props.enableFiltering - Enable/disable filtering (default: true)
 * @param {Object} props.initialSort - Initial sort configuration: { column: 'id', direction: 'asc' }
 * @param {Object} props.initialFilters - Initial filter values: { columnId: 'filterValue' }
 */
const Table = ({
                   columns = [],
                   data = [],
                   onRowClick,
                   isLoading = false,
                   emptyMessage = 'No data available',
                   actionConfig = null,
                   className = '',
                   itemsPerPage = 10,
                   enablePagination = true,
                   enableSorting = true,
                   enableFiltering = true,
                   initialSort = null,
                   initialFilters = {},
               }) => {
    const [isScrollable, setIsScrollable] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState(initialSort);
    const [filters, setFilters] = useState(initialFilters);
    const [showFilters, setShowFilters] = useState(false);
    const tableRef = useRef(null);
    const wrapperRef = useRef(null);

    // Include action column if configured
    const allColumns = actionConfig
        ? [...columns, {
            id: 'actions',
            label: actionConfig.label || 'ACTIONS',
            width: actionConfig.width || '120px',
            minWidth: actionConfig.minWidth || '120px',
            sortable: false,
            filterable: false
        }]
        : columns;

    // Helper function to get nested property value
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    // Helper function to get filterable value or try render function
    const getFilterableValue = (row, column) => {
        // First, try the direct property access
        let value = getNestedValue(row, column.id);

        // If no direct value found and column has a render function
        if ((value == null || value === undefined) && column.render) {
            // Try to extract text from rendered content
            const rendered = column.render(row);

            // If rendered content is a string, use it
            if (typeof rendered === 'string') {
                return rendered;
            }

            // If rendered content is a React element with text content
            if (rendered && typeof rendered === 'object' && rendered.props) {
                // Try to extract text from children
                if (typeof rendered.props.children === 'string') {
                    return rendered.props.children;
                }
                // Handle nested children
                if (Array.isArray(rendered.props.children)) {
                    const textContent = rendered.props.children
                        .filter(child => typeof child === 'string')
                        .join(' ');
                    if (textContent) return textContent;
                }
            }

            // Fallback: try common nested paths based on your data structure
            const commonPaths = [
                `${column.id}.name`,
                `itemType.${column.id}`,
                `itemType.name`,
                `itemType.itemCategory.name`,
                `itemType.measuringUnit`
            ];

            for (const path of commonPaths) {
                const nestedValue = getNestedValue(row, path);
                if (nestedValue != null && nestedValue !== undefined) {
                    return nestedValue;
                }
            }
        }

        return value;
    };

    // Get unique filter options for a column
    const getFilterOptions = useCallback((columnId) => {
        const column = columns.find(col => col.id === columnId);
        const values = data.map(row => getFilterableValue(row, column)).filter(val => val != null);
        return [...new Set(values)].sort();
    }, [data, columns]);

    // Apply filters to data
    const filteredData = useMemo(() => {
        if (!enableFiltering || Object.keys(filters).length === 0) {
            return data;
        }

        return data.filter(row => {
            return Object.entries(filters).every(([columnId, filterValue]) => {
                if (!filterValue || filterValue === '') return true;

                const column = columns.find(col => col.id === columnId);
                if (!column) return true;

                // Use the smart value extraction
                let cellValue = getFilterableValue(row, column);

                // Handle null/undefined values
                if (cellValue == null || cellValue === undefined) return false;

                // Convert to string for comparison
                const cellValueStr = String(cellValue);
                const filterValueStr = String(filterValue);

                // Handle different filter types
                if (column?.filterType === 'select') {
                    return cellValueStr === filterValueStr;
                } else if (column?.filterType === 'number') {
                    const cellNum = parseFloat(cellValueStr);
                    const filterNum = parseFloat(filterValueStr);
                    return !isNaN(cellNum) && !isNaN(filterNum) && cellNum === filterNum;
                } else {
                    // Default text filter (case-insensitive contains)
                    return cellValueStr.toLowerCase().includes(filterValueStr.toLowerCase());
                }
            });
        });
    }, [data, filters, columns, enableFiltering]);

    // Apply sorting to filtered data
    const sortedData = useMemo(() => {
        if (!enableSorting || !sortConfig) {
            return filteredData;
        }

        const { column, direction } = sortConfig;
        const columnDef = columns.find(col => col.id === column);

        return [...filteredData].sort((a, b) => {
            // Use the same smart value extraction for sorting
            let aVal = getFilterableValue(a, columnDef);
            let bVal = getFilterableValue(b, columnDef);

            // Handle custom sort function
            if (columnDef?.sortFunction) {
                return direction === 'asc'
                    ? columnDef.sortFunction(a, b)
                    : columnDef.sortFunction(b, a);
            }

            // Handle null/undefined values
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return direction === 'asc' ? 1 : -1;
            if (bVal == null) return direction === 'asc' ? -1 : 1;

            // Handle different data types
            if (columnDef?.sortType === 'number') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else if (columnDef?.sortType === 'date') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            } else {
                // Default string comparison
                aVal = aVal.toString().toLowerCase();
                bVal = bVal.toString().toLowerCase();
            }

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig, columns, enableSorting]);

    // Calculate pagination for processed data
    const totalItems = sortedData.length;
    const totalPages = enablePagination ? Math.ceil(totalItems / itemsPerPage) : 1;
    const startIndex = enablePagination ? (currentPage - 1) * itemsPerPage : 0;
    const endIndex = enablePagination ? startIndex + itemsPerPage : totalItems;
    const currentData = enablePagination ? sortedData.slice(startIndex, endIndex) : sortedData;

    // Reset to first page when filters or data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, data]);

    // Sorting handlers
    const handleSort = (columnId) => {
        if (!enableSorting) return;

        const column = columns.find(col => col.id === columnId);
        if (column && column.sortable === false) return;

        setSortConfig(prevSort => {
            if (prevSort?.column === columnId) {
                // Toggle direction or remove sort
                if (prevSort.direction === 'asc') {
                    return { column: columnId, direction: 'desc' };
                } else {
                    return null; // Remove sort
                }
            } else {
                // New sort
                return { column: columnId, direction: 'asc' };
            }
        });
    };

    // Filter handlers
    const handleFilterChange = (columnId, value) => {
        setFilters(prev => ({
            ...prev,
            [columnId]: value
        }));
    };

    const clearFilters = () => {
        setFilters({});
    };

    const clearFilter = (columnId) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[columnId];
            return newFilters;
        });
    };

    // Calculate total minimum width needed for all columns
    const calculateMinimumTableWidth = useCallback(() => {
        return allColumns.reduce((total, column) => {
            const width = column.width || column.minWidth || '150px';
            const numericWidth = parseInt(width.replace('px', '')) || 150;
            return total + numericWidth;
        }, 0);
    }, [allColumns]);

    // Function to check if table is scrollable horizontally
    const checkScrollable = useCallback(() => {
        if (wrapperRef.current) {
            const containerWidth = wrapperRef.current.clientWidth;
            const minimumTableWidth = calculateMinimumTableWidth();
            const shouldBeScrollable = minimumTableWidth > containerWidth;
            setIsScrollable(shouldBeScrollable);
        }
    }, [calculateMinimumTableWidth, allColumns.length]);

    // Check scrollable state on mount, data change, and window resize
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            checkScrollable();
        }, 10);

        const handleResize = () => {
            setTimeout(checkScrollable, 10);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, [checkScrollable, data, columns, actionConfig]);

    // Pagination handlers
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= Math.min(5, totalPages); i++) {
                    pageNumbers.push(i);
                }
                if (totalPages > 5) {
                    pageNumbers.push('...');
                    pageNumbers.push(totalPages);
                }
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                if (totalPages > 5) {
                    pageNumbers.push('...');
                }
                for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    // Get active filters count
    const activeFiltersCount = Object.values(filters).filter(val => val && val !== '').length;

    return (
        <div className={`custom-table-container ${className}`}>
            {/* Table Controls */}
            {enableFiltering && (
                <div className="table-controls">
                    <div className="table-controls-left">
                        <button
                            className={`filter-toggle-button ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
                            </svg>
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="filter-count-badge">{activeFiltersCount}</span>
                            )}
                        </button>

                        {activeFiltersCount > 0 && (
                            <button className="clear-filters-button" onClick={clearFilters}>
                                Clear All Filters
                            </button>
                        )}
                    </div>

                    <div className="table-controls-right">
                        <span className="results-count">
                            {totalItems} {totalItems === 1 ? 'result' : 'results'}
                            {totalItems !== data.length && ` (filtered from ${data.length})`}
                        </span>
                    </div>
                </div>
            )}

            {/* Filter Row */}
            {enableFiltering && showFilters && (
                <div className="table-filters">
                    {columns.filter(col => col.filterable !== false).map(column => (
                        <div key={`filter-${column.id}`} className="filter-group">
                            <label className="filter-label">{column.label}</label>

                            {column.filterType === 'select' ? (
                                <select
                                    className="filter-select"
                                    value={filters[column.id] || ''}
                                    onChange={(e) => handleFilterChange(column.id, e.target.value)}
                                >
                                    <option value="">All</option>
                                    {getFilterOptions(column.id).map(option => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="filter-input-group">
                                    <input
                                        type={column.filterType === 'number' ? 'number' : 'text'}
                                        className="filter-input"
                                        placeholder={`Filter ${column.label.toLowerCase()}...`}
                                        value={filters[column.id] || ''}
                                        onChange={(e) => handleFilterChange(column.id, e.target.value)}
                                    />
                                    {filters[column.id] && (
                                        <button
                                            className="clear-filter-button"
                                            onClick={() => clearFilter(column.id)}
                                            title="Clear filter"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            <div
                ref={wrapperRef}
                className={`custom-table-wrapper ${isScrollable ? 'scrollable' : 'full-width'}`}
            >
                <table
                    ref={tableRef}
                    className="custom-table"
                    style={isScrollable ? {
                        minWidth: `${calculateMinimumTableWidth()}px`
                    } : {}}
                >
                    <thead className="custom-table-header">
                    <tr>
                        {allColumns.map((column, index) => (
                            <th
                                key={column.id}
                                className={`custom-table-header-cell ${
                                    enableSorting && column.sortable !== false ? 'sortable' : ''
                                } ${
                                    sortConfig?.column === column.id ? `sorted-${sortConfig.direction}` : ''
                                }`}
                                style={isScrollable ? {
                                    width: column.width || '150px',
                                    minWidth: column.width || '150px',
                                    maxWidth: column.width || '150px',
                                    textAlign: column.align || 'left',
                                    whiteSpace: 'nowrap'
                                } : {
                                    textAlign: column.align || 'left',
                                    minWidth: column.minWidth || 'auto'
                                }}
                                data-flex-weight={column.flexWeight || 1}
                                onClick={() => handleSort(column.id)}
                            >
                                <div className="header-content">
                                    <span>{column.label}</span>
                                    {enableSorting && column.sortable !== false && (
                                        <div className="sort-icons">
                                            <svg className="sort-icon sort-asc" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="18,15 12,9 6,15"></polyline>
                                            </svg>
                                            <svg className="sort-icon sort-desc" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6,9 12,15 18,9"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={allColumns.length} className="custom-table-loading-cell">
                                <div className="custom-table-loading">
                                    <div className="custom-table-loading-spinner"></div>
                                    <p>Loading data...</p>
                                </div>
                            </td>
                        </tr>
                    ) : currentData.length === 0 ? (
                        <tr>
                            <td colSpan={allColumns.length} className="custom-table-empty-cell">
                                <div className="custom-table-empty">
                                    <p>{activeFiltersCount > 0 ? 'No results match your filters' : emptyMessage}</p>
                                    {activeFiltersCount > 0 && (
                                        <button className="clear-filters-button" onClick={clearFilters}>
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ) : (
                        currentData.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className="custom-table-row"
                                onClick={() => onRowClick && onRowClick(row)}
                                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={`${rowIndex}-${column.id}`}
                                        className={`custom-table-cell ${column.className || ''}`}
                                        style={isScrollable ? {
                                            width: column.width || '150px',
                                            minWidth: column.width || '150px',
                                            maxWidth: column.width || '150px',
                                            textAlign: column.align || 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        } : {
                                            textAlign: column.align || 'left',
                                            minWidth: column.minWidth || 'auto'
                                        }}
                                        data-flex-weight={column.flexWeight || 1}
                                    >
                                        {column.render ? column.render(row) : row[column.id]}
                                    </td>
                                ))}

                                {/* Render action buttons if configured */}
                                {actionConfig && (
                                    <td
                                        className="custom-table-cell custom-table-actions-cell"
                                        style={isScrollable ? {
                                            width: actionConfig.width || '120px',
                                            minWidth: actionConfig.width || '120px',
                                            maxWidth: actionConfig.width || '120px',
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap'
                                        } : {
                                            textAlign: 'left',
                                            minWidth: actionConfig.minWidth || 'auto'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        data-flex-weight={actionConfig.flexWeight || 1}
                                    >
                                        {actionConfig.renderActions(row)}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {enablePagination && totalItems > itemsPerPage && (
                <div className="custom-table-pagination">
                    <div className="pagination-info">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                    </div>

                    <div className="pagination-controls">
                        <button
                            className="pagination-button pagination-prev"
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                            Previous
                        </button>

                        <div className="pagination-pages">
                            {getPageNumbers().map((pageNum, index) => (
                                pageNum === '...' ? (
                                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                                ) : (
                                    <button
                                        key={pageNum}
                                        className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                                        onClick={() => goToPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            ))}
                        </div>

                        <button
                            className="pagination-button pagination-next"
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Table;