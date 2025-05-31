import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaFilter, FaEllipsisV } from 'react-icons/fa';
import './DataTable.scss';

const DataTable = ({
                       data = [],
                       columns = [],
                       itemsPerPageOptions = [5, 10, 15, 20],
                       defaultItemsPerPage = 10,
                       defaultSortField = null,
                       defaultSortDirection = 'asc',
                       onRowClick = null,
                       loading = false,
                       tableTitle = '',
                       showSearch = true,
                       showFilters = true,
                       filterableColumns = [],
                       customFilters = [],
                       className = '',
                       actions = [], // Array of action objects
                       actionsColumnWidth = '120px', // Default width for actions column
                       emptyMessage = 'No data available' // Custom empty message
                   }) => {
    // States for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

    // States for sorting
    const [sortField, setSortField] = useState(defaultSortField);
    const [sortDirection, setSortDirection] = useState(defaultSortDirection);

    // States for filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // Track which row's actions menu is open
    const [activeActionRow, setActiveActionRow] = useState(null);

    // Refs for width calculation - matching your Table.jsx
    const [isScrollable, setIsScrollable] = useState(false);
    const tableRef = useRef(null);
    const wrapperRef = useRef(null);

    // Include action column if configured - matching your Table.jsx structure
    const allColumns = actions.length > 0
        ? [...columns, {
            id: 'actions',
            header: 'ACTIONS',
            accessor: 'actions',
            width: actionsColumnWidth,
            minWidth: actionsColumnWidth,
            sortable: false,
            filterable: false
        }]
        : columns;

    // Calculate total minimum width needed for all columns - from your Table.jsx
    const calculateMinimumTableWidth = useCallback(() => {
        return allColumns.reduce((total, column) => {
            const width = column.width || column.minWidth || '150px';
            const numericWidth = parseInt(width.replace('px', '')) || 150;
            return total + numericWidth;
        }, 0);
    }, [allColumns]);

    // Function to check if table is scrollable horizontally - from your Table.jsx
    const checkScrollable = useCallback(() => {
        if (wrapperRef.current) {
            const containerWidth = wrapperRef.current.clientWidth;
            const minimumTableWidth = calculateMinimumTableWidth();
            const shouldBeScrollable = minimumTableWidth > containerWidth;
            setIsScrollable(shouldBeScrollable);
        }
    }, [calculateMinimumTableWidth, allColumns.length]);

    // Check scrollable state on mount, data change, and window resize - from your Table.jsx
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
    }, [checkScrollable, data, columns, actions]);

    // Reset current page when data, search term, or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, data]);

    // Close actions menu when clicking outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (activeActionRow !== null && !e.target.closest('.rockops-table__actions')) {
                setActiveActionRow(null);
            }
        };

        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [activeActionRow]);

    // Helper function to get nested object values
    function getValue(obj, path) {
        if (!path) return obj;

        const keys = path.split('.');
        let value = obj;

        for (const key of keys) {
            if (value === null || value === undefined) return '';
            value = value[key];
        }

        return value;
    }

    // Apply search filter
    const searchFiltered = useMemo(() => {
        if (!searchTerm.trim()) return data;

        return data.filter(item => {
            return columns.some(column => {
                if (!column.accessor || column.excludeFromSearch) return false;
                const value = getValue(item, column.accessor);
                return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    }, [data, searchTerm, columns]);

    // Apply column filters
    const filtered = useMemo(() => {
        if (Object.keys(filters).length === 0) return searchFiltered;

        return searchFiltered.filter(item => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key];
                if (!filterValue) return true;

                const itemValue = getValue(item, key);

                // Handle different filter types
                if (Array.isArray(filterValue)) {
                    // Multi-select filter
                    return filterValue.length === 0 || filterValue.includes(String(itemValue));
                } else if (typeof filterValue === 'object' && filterValue !== null) {
                    // Range filter
                    const { min, max } = filterValue;
                    const numValue = Number(itemValue);
                    return (min === null || numValue >= min) && (max === null || numValue <= max);
                } else {
                    // Simple text filter
                    return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
                }
            });
        });
    }, [searchFiltered, filters]);

    // Apply sorting
    const sortedData = useMemo(() => {
        if (!sortField) return filtered;

        return [...filtered].sort((a, b) => {
            const aValue = getValue(a, sortField);
            const bValue = getValue(b, sortField);

            // Handle null or undefined values
            if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
            if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

            // Compare based on value type
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // Default string comparison
            return sortDirection === 'asc'
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
        });
    }, [filtered, sortField, sortDirection]);

    // Calculate pagination
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    // Calculate total pages
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    // Handle sorting
    const handleSort = (accessor) => {
        if (sortField === accessor) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(accessor);
            setSortDirection('asc');
        }
    };

    // Handle filter change
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle page change
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Toggle actions menu for a row
    const toggleActionsMenu = (e, rowIndex) => {
        e.stopPropagation(); // Prevent row click
        setActiveActionRow(activeActionRow === rowIndex ? null : rowIndex);
    };

    // Handle action click
    const handleActionClick = (e, action, row) => {
        e.stopPropagation(); // Prevent row click
        setActiveActionRow(null); // Close actions menu

        if (action.onClick) {
            action.onClick(row);
        }
    };

    // Get filter options for a column
    const getFilterOptions = (columnAccessor) => {
        const values = data.map(row => getValue(row, columnAccessor)).filter(val => val != null);
        return [...new Set(values)].sort();
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({});
        setSearchTerm('');
    };

    // Clear individual filter
    const clearFilter = (columnAccessor) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[columnAccessor];
            return newFilters;
        });
    };

    // Get active filters count
    const activeFiltersCount = Object.values(filters).filter(val => val && val !== '').length + (searchTerm ? 1 : 0);

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

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, sortedData.length);

    return (
        <div className={`rockops-table__container ${className}`}>
            <div className="rockops-table__header-container">
                {tableTitle && <h3 className="rockops-table__title">{tableTitle}</h3>}

                <div className="rockops-table__controls">
                    {showSearch && (
                        <div className="rockops-table__search">
                            <FaSearch className="rockops-table__search-icon" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="rockops-table__search-input"
                            />
                        </div>
                    )}

                    {showFilters && filterableColumns.length > 0 && (
                        <button
                            className={`rockops-table__filter-btn ${showFilterPanel ? 'rockops-table__filter-btn--active' : ''}`}
                            onClick={() => {
                                if (showFilterPanel) {
                                    // Reset filters when closing the panel
                                    clearFilters();
                                }
                                setShowFilterPanel(!showFilterPanel);
                            }}
                        >
                            <FaFilter />
                            <span>Filters</span>
                            {activeFiltersCount > 0 && (
                                <span className="rockops-table__filter-count">{activeFiltersCount}</span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Panel - Professional Design */}
            {showFilters && showFilterPanel && (
                <div className="rockops-table__filter-panel">
                    <div className="rockops-table__filter-header">
                        <h4>
                            <FaFilter />
                            Filter Options
                        </h4>
                        <div className="filter-actions">
                            {activeFiltersCount > 0 && (
                                <span className="filter-stats">
                                    {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
                                </span>
                            )}
                            <button
                                className="filter-collapse-btn"
                                onClick={() => {
                                    // Reset filters when closing via collapse button
                                    clearFilters();
                                    setShowFilterPanel(false);
                                }}
                                title="Close and reset filters"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="18,15 12,9 6,15"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="rockops-table__filter-list">
                        {filterableColumns.map((column, index) => (
                            <div
                                key={index}
                                className={`rockops-table__filter-item ${filters[column.accessor] ? 'has-filter' : ''}`}
                            >
                                <label>{column.header}</label>
                                <div className="filter-input-wrapper">
                                    {column.filterType === 'select' ? (
                                        <select
                                            value={filters[column.accessor] || ''}
                                            onChange={(e) => handleFilterChange(column.accessor, e.target.value)}
                                        >
                                            <option value="">All {column.header}</option>
                                            {getFilterOptions(column.accessor).map(option => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <>
                                            <input
                                                type={column.filterType === 'number' ? 'number' : 'text'}
                                                placeholder={`Search ${column.header.toLowerCase()}...`}
                                                value={filters[column.accessor] || ''}
                                                onChange={(e) => handleFilterChange(column.accessor, e.target.value)}
                                            />
                                            {filters[column.accessor] && (
                                                <button
                                                    className="clear-filter-btn"
                                                    onClick={() => clearFilter(column.accessor)}
                                                    title="Clear filter"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {customFilters.map((filter, index) => (
                            <div key={`custom-${index}`} className="rockops-table__filter-item">
                                <label>{filter.label}</label>
                                <div className="filter-input-wrapper">
                                    {filter.component}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rockops-table__filter-actions">
                        <div className="filter-stats">
                            {sortedData.length} of {data.length} results
                            {activeFiltersCount > 0 && ` with ${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} applied`}
                        </div>

                        <div className="filter-buttons">
                            <button
                                className="rockops-table__btn rockops-table__btn--secondary"
                                onClick={clearFilters}
                                disabled={activeFiltersCount === 0}
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Wrapper - Adaptive width system from your Table.jsx */}
            <div
                ref={wrapperRef}
                className={`rockops-table__wrapper ${isScrollable ? 'scrollable' : 'full-width'}`}
            >
                {loading ? (
                    <div className="rockops-table__loading">
                        <div className="rockops-table__spinner"></div>
                        <p>Loading data...</p>
                    </div>
                ) : (
                    <table
                        ref={tableRef}
                        className="rockops-table"
                        style={isScrollable ? {
                            minWidth: `${calculateMinimumTableWidth()}px`
                        } : {}}
                    >
                        <thead className="rockops-table__header">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`rockops-table__th ${
                                        column.sortable !== false ? 'rockops-table__th--sortable' : ''
                                    } ${
                                        sortField === column.accessor ? `sorted-${sortDirection}` : ''
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
                                    onClick={() => column.sortable !== false ? handleSort(column.accessor) : null}
                                >
                                    <div className="rockops-table__th-content">
                                        <span>{column.header}</span>
                                        {column.sortable !== false && (
                                            <span className="rockops-table__sort-icon">
                                                {sortField === column.accessor ? (
                                                    sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                                ) : (
                                                    <FaSort />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}

                            {/* Actions column if actions array is provided */}
                            {actions.length > 0 && (
                                <th
                                    className="rockops-table__th rockops-table__th--actions"
                                    style={isScrollable ? {
                                        width: actionsColumnWidth,
                                        minWidth: actionsColumnWidth,
                                        maxWidth: actionsColumnWidth,
                                        textAlign: 'left',
                                        whiteSpace: 'nowrap'
                                    } : {
                                        textAlign: 'left',
                                        minWidth: actionsColumnWidth
                                    }}
                                    data-flex-weight={1}
                                >
                                    <div className="rockops-table__th-content">
                                        <span>Actions</span>
                                    </div>
                                </th>
                            )}
                        </tr>
                        </thead>

                        <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                {/* Render empty cells for columns before center */}
                                {columns.slice(0, Math.floor(allColumns.length / 2)).map((_, index) => (
                                    <td key={`empty-before-${index}`} className="rockops-table__cell"></td>
                                ))}

                                {/* Center column with empty message */}
                                <td className="rockops-table__cell rockops-table__empty">
                                    <p>{activeFiltersCount > 0 ? 'No results match your filters' : emptyMessage}</p>
                                    {activeFiltersCount > 0 && (
                                        <button className="rockops-table__btn rockops-table__btn--secondary" onClick={clearFilters}>
                                            Clear Filters
                                        </button>
                                    )}
                                </td>

                                {/* Render empty cells for columns after center */}
                                {columns.slice(Math.floor(allColumns.length / 2) + 1).map((_, index) => (
                                    <td key={`empty-after-${index}`} className="rockops-table__cell"></td>
                                ))}

                                {/* Actions column if present */}
                                {actions.length > 0 && Math.floor(allColumns.length / 2) >= columns.length && (
                                    <td className="rockops-table__cell"></td>
                                )}
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={`rockops-table__row ${onRowClick ? 'rockops-table__row--clickable' : ''}`}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`rockops-table__cell ${column.className || ''}`}
                                            style={isScrollable ? {
                                                width: column.width || '150px',
                                                minWidth: column.width || '150px',
                                                maxWidth: column.width || '150px',
                                                textAlign: column.align || 'left',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                ...(column.cellStyle ? column.cellStyle(row, getValue(row, column.accessor)) : {})
                                            } : {
                                                textAlign: column.align || 'left',
                                                minWidth: column.minWidth || 'auto',
                                                ...(column.cellStyle ? column.cellStyle(row, getValue(row, column.accessor)) : {})
                                            }}
                                            data-flex-weight={column.flexWeight || 1}
                                        >
                                            {column.render ? (
                                                column.render(row, getValue(row, column.accessor))
                                            ) : (
                                                getValue(row, column.accessor)
                                            )}
                                        </td>
                                    ))}

                                    {/* Actions column */}
                                    {actions.length > 0 && (
                                        <td
                                            className="rockops-table__cell rockops-table__cell--actions"
                                            style={isScrollable ? {
                                                width: actionsColumnWidth,
                                                minWidth: actionsColumnWidth,
                                                maxWidth: actionsColumnWidth,
                                                textAlign: 'left',
                                                whiteSpace: 'nowrap'
                                            } : {
                                                textAlign: 'left',
                                                minWidth: actionsColumnWidth
                                            }}
                                            data-flex-weight={1}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {actions.length > 2 ? (
                                                // Dropdown menu for 3+ actions
                                                <div className="rockops-table__actions">
                                                    <button
                                                        className="rockops-table__action-toggle"
                                                        onClick={(e) => toggleActionsMenu(e, rowIndex)}
                                                        aria-label="Toggle actions menu"
                                                    >
                                                        <FaEllipsisV />
                                                    </button>

                                                    {activeActionRow === rowIndex && (
                                                        <div className="rockops-table__actions-dropdown">
                                                            {actions.map((action, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    className={`rockops-table__action-item ${action.className || ''}`}
                                                                    onClick={(e) => handleActionClick(e, action, row)}
                                                                    disabled={action.isDisabled ? action.isDisabled(row) : false}
                                                                >
                                                                    {action.icon && <span className="rockops-table__action-icon">{action.icon}</span>}
                                                                    <span>{action.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                // Inline buttons for 1-2 actions
                                                <div className="rockops-table__actions-inline">
                                                    {actions.map((action, idx) => (
                                                        <button
                                                            key={idx}
                                                            className={`rockops-table__action-button ${action.className || ''}`}
                                                            onClick={(e) => handleActionClick(e, action, row)}
                                                            disabled={action.isDisabled ? action.isDisabled(row) : false}
                                                            aria-label={action.label}
                                                            title={action.label}
                                                        >
                                                            {action.icon}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer with pagination */}
            <div className="rockops-table__footer">
                <div className="rockops-table__items-per-page">
                    <span>Items per page:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {itemsPerPageOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/*<div className="rockops-table__showing">*/}
                {/*    Showing {startIndex + 1} to {endIndex} of {sortedData.length} entries*/}
                {/*    {sortedData.length !== data.length && ` (filtered from ${data.length} total entries)`}*/}
                {/*</div>*/}

                {/* Pagination */}
                {sortedData.length > itemsPerPage && (
                    <div className="rockops-table__pagination">
                        <div className="rockops-table__pagination-info">
                            Showing <span>{startIndex + 1}</span> to <span>{endIndex}</span> of <span>{sortedData.length}</span> entries
                            {sortedData.length !== data.length && ` (filtered from ${data.length} total entries)`}
                        </div>

                        <div className="rockops-table__pagination-controls">
                            <button
                                className="rockops-table__pagination-btn"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            <div className="rockops-table__pagination-numbers">
                                {getPageNumbers().map((pageNum, index) => (
                                    pageNum === '...' ? (
                                        <span key={`ellipsis-${index}`} className="rockops-table__pagination-btn rockops-table__pagination-btn--ellipsis">...</span>
                                    ) : (
                                        <button
                                            key={pageNum}
                                            className={`rockops-table__pagination-btn ${currentPage === pageNum ? 'rockops-table__pagination-btn--active' : ''}`}
                                            onClick={() => goToPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                ))}
                            </div>

                            <button
                                className="rockops-table__pagination-btn"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataTable;