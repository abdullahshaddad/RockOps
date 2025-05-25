import React, { useState, useEffect, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaFilter, FaEllipsisV } from 'react-icons/fa';
import './DataTable.scss';

const DataTable = ({
                       data = [],
                       columns = [],
                       itemsPerPageOptions = [10, 25, 50, 100],
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
                       actionsColumnWidth = '120px' // Default width for actions column
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

    // Render table header with sorting
    const renderTableHeader = () => {
        return (
            <thead className="rockops-table__header">
            <tr>
                {columns.map((column, index) => (
                    <th
                        key={index}
                        className={`rockops-table__th ${column.sortable !== false ? 'rockops-table__th--sortable' : ''}`}
                        style={column.width ? { width: column.width } : {}}
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
                        style={{ width: actionsColumnWidth }}
                    >
                        <div className="rockops-table__th-content">
                            <span>Actions</span>
                        </div>
                    </th>
                )}
            </tr>
            </thead>
        );
    };

    // Render filter panel
    const renderFilterPanel = () => {
        if (!showFilterPanel) return null;

        return (
            <div className="rockops-table__filter-panel">
                <div className="rockops-table__filter-list">
                    {filterableColumns.map((column, index) => (
                        <div key={index} className="rockops-table__filter-item">
                            <label>{column.header}</label>
                            <input
                                type="text"
                                value={filters[column.accessor] || ''}
                                onChange={(e) => handleFilterChange(column.accessor, e.target.value)}
                                placeholder={`Filter by ${column.header.toLowerCase()}`}
                            />
                        </div>
                    ))}

                    {customFilters.map((filter, index) => (
                        <div key={`custom-${index}`} className="rockops-table__filter-item">
                            <label>{filter.label}</label>
                            {filter.component}
                        </div>
                    ))}
                </div>

                <div className="rockops-table__filter-actions">
                    <button
                        className="rockops-table__btn rockops-table__btn--secondary"
                        onClick={() => setFilters({})}
                    >
                        Clear Filters
                    </button>
                    <button
                        className="rockops-table__btn rockops-table__btn--primary"
                        onClick={() => setShowFilterPanel(false)}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        );
    };

    // Render actions menu for a row
    const renderActionsMenu = (row, rowIndex) => {
        // Actions menu for small screens or when more than 2 actions
        if (actions.length > 2) {
            return (
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
            );
        }

        // Inline buttons for 1-2 actions
        return (
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
        );
    };

    // Render pagination controls
    const renderPagination = () => {
        if (sortedData.length <= itemsPerPage) return null;

        const pageNeighbors = 1;
        const totalNumbers = pageNeighbors * 2 + 3;
        const totalBlocks = totalNumbers + 2;

        if (totalPages > totalBlocks) {
            let pages = [];

            const leftBound = currentPage - pageNeighbors;
            const rightBound = currentPage + pageNeighbors;
            const beforeLastPage = totalPages - 1;

            const startPage = leftBound > 2 ? leftBound : 2;
            const endPage = rightBound < beforeLastPage ? rightBound : beforeLastPage;

            pages = range(startPage, endPage);

            const pagesCount = pages.length;
            const singleSpillOffset = totalNumbers - pagesCount - 1;

            const leftSpill = startPage > 2;
            const rightSpill = endPage < beforeLastPage;

            const leftSpillPage = 'LEFT';
            const rightSpillPage = 'RIGHT';

            if (leftSpill && !rightSpill) {
                const extraPages = range(startPage - singleSpillOffset, startPage - 1);
                pages = [leftSpillPage, ...extraPages, ...pages];
            } else if (!leftSpill && rightSpill) {
                const extraPages = range(endPage + 1, endPage + singleSpillOffset);
                pages = [...pages, ...extraPages, rightSpillPage];
            } else if (leftSpill && rightSpill) {
                pages = [leftSpillPage, ...pages, rightSpillPage];
            }

            pages = [1, ...pages, totalPages];

            return (
                <div className="rockops-table__pagination">
                    <button
                        className="rockops-table__pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => goToPage(currentPage - 1)}
                    >
                        Previous
                    </button>

                    <div className="rockops-table__pagination-numbers">
                        {pages.map((page, index) => {
                            if (page === leftSpillPage) {
                                return (
                                    <button
                                        key={index}
                                        className="rockops-table__pagination-btn rockops-table__pagination-btn--ellipsis"
                                        onClick={() => goToPage(startPage - 1)}
                                    >
                                        ...
                                    </button>
                                );
                            }

                            if (page === rightSpillPage) {
                                return (
                                    <button
                                        key={index}
                                        className="rockops-table__pagination-btn rockops-table__pagination-btn--ellipsis"
                                        onClick={() => goToPage(endPage + 1)}
                                    >
                                        ...
                                    </button>
                                );
                            }

                            return (
                                <button
                                    key={index}
                                    className={`rockops-table__pagination-btn ${currentPage === page ? 'rockops-table__pagination-btn--active' : ''}`}
                                    onClick={() => goToPage(page)}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        className="rockops-table__pagination-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => goToPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            );
        }

        return (
            <div className="rockops-table__pagination">
                <button
                    className="rockops-table__pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                >
                    Previous
                </button>

                <div className="rockops-table__pagination-numbers">
                    {range(1, totalPages).map(page => (
                        <button
                            key={page}
                            className={`rockops-table__pagination-btn ${currentPage === page ? 'rockops-table__pagination-btn--active' : ''}`}
                            onClick={() => goToPage(page)}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    className="rockops-table__pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                >
                    Next
                </button>
            </div>
        );
    };

    // Helper function to create a range of numbers
    function range(start, end) {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

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
                            className={`rockops-table__filter-btn ${Object.keys(filters).length > 0 ? 'rockops-table__filter-btn--active' : ''}`}
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                        >
                            <FaFilter />
                            <span>Filters</span>
                            {Object.keys(filters).length > 0 && (
                                <span className="rockops-table__filter-count">{Object.keys(filters).length}</span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {renderFilterPanel()}

            <div className="rockops-table__wrapper">
                {loading ? (
                    <div className="rockops-table__loading">
                        <div className="rockops-table__spinner"></div>
                        <p>Loading data...</p>
                    </div>
                ) : (
                    <>
                        {paginatedData.length === 0 ? (
                            <div className="rockops-table__empty">
                                <p>No data available</p>
                            </div>
                        ) : (
                            <table className="rockops-table">
                                {renderTableHeader()}

                                <tbody>
                                {paginatedData.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className={`rockops-table__row ${onRowClick ? 'rockops-table__row--clickable' : ''}`}
                                        onClick={() => onRowClick && onRowClick(row)}
                                    >
                                        {columns.map((column, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className="rockops-table__cell"
                                                style={column.cellStyle ? column.cellStyle(row, getValue(row, column.accessor)) : {}}
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
                                            <td className="rockops-table__cell rockops-table__cell--actions">
                                                {renderActionsMenu(row, rowIndex)}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>

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

                <div className="rockops-table__showing">
                    Showing {filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                    {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
                    {sortedData.length !== data.length && ` (filtered from ${data.length} total entries)`}
                </div>

                {renderPagination()}
            </div>
        </div>
    );
};

export default DataTable;