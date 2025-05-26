import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { equipmentService } from '../../../services/equipmentService';
import { sarkyService } from '../../../services/sarkyService';
import { useSnackbar } from '../../../Contexts/SnackbarContext';
import { FaCalendarPlus, FaTools, FaClock, FaUser, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import { BsCalendarPlus } from 'react-icons/bs';
import axios from 'axios';
import './SarkyAttendance.scss';

const SarkyAttendance = forwardRef(({ equipmentId }, ref) => {
    const { showSuccess, showError } = useSnackbar();

    // State management
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [equipmentData, setEquipmentData] = useState(null);
    const [workTypes, setWorkTypes] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [sarkyData, setSarkyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatingSarky, setGeneratingSarky] = useState(false);
    const [editingEntries, setEditingEntries] = useState({});
    const [savingAll, setSavingAll] = useState(false);

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    const token = localStorage.getItem("token");
    const axiosInstance = axios.create({
        headers: { Authorization: `Bearer ${token}` }
    });

    // Expose refresh method to parent
    useImperativeHandle(ref, () => ({
        refreshData: () => {
            fetchMonthlySarky();
        }
    }));

    // Fetch equipment data and related info
    useEffect(() => {
        const fetchEquipmentData = async () => {
            try {
                const response = await equipmentService.getEquipmentById(equipmentId);
                setEquipmentData(response.data);

                // Fetch drivers for this equipment type
                if (response.data.typeId) {
                    const driversResponse = await equipmentService.getDriversForSarkyByEquipmentType(response.data.typeId);
                    setDrivers(driversResponse.data);
                }
            } catch (error) {
                console.error("Error fetching equipment data:", error);
                showError("Failed to load equipment data");
            }
        };

        const fetchWorkTypes = async () => {
            try {
                const response = await axiosInstance.get('http://localhost:8080/api/v1/worktypes');
                setWorkTypes(response.data);
            } catch (error) {
                console.error("Error fetching work types:", error);
                showError("Failed to load work types");
            }
        };

        if (equipmentId) {
            fetchEquipmentData();
            fetchWorkTypes();
        }
    }, [equipmentId]);

    // Fetch monthly sarky data when month/year changes
    useEffect(() => {
        if (equipmentId) {
            fetchMonthlySarky();
        }
    }, [equipmentId, selectedMonth, selectedYear]);

    const fetchMonthlySarky = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch single-day sarkies
            const singleResponse = await sarkyService.getByEquipment(equipmentId);
            const rangeResponse = await sarkyService.getRangeByEquipment(equipmentId);

            let monthlyEntries = [];

            // Process single-day entries for the selected month
            if (singleResponse.data) {
                singleResponse.data.forEach(sarky => {
                    const date = new Date(sarky.date);
                    if (date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear) {
                        monthlyEntries.push({
                            id: sarky.id,
                            date: sarky.date,
                            workType: sarky.workType,
                            workTypeId: sarky.workType?.id,
                            workedHours: sarky.workedHours,
                            driverId: sarky.driverId,
                            driverName: sarky.driverName,
                            type: 'single',
                            canEdit: true,
                            canDelete: true
                        });
                    }
                });
            }

            // Process range entries for the selected month
            if (rangeResponse.data) {
                rangeResponse.data.forEach(range => {
                    if (range.workEntries) {
                        range.workEntries.forEach(entry => {
                            const date = new Date(entry.date);
                            if (date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear) {
                                monthlyEntries.push({
                                    id: entry.id,
                                    date: entry.date,
                                    workType: entry.workType,
                                    workTypeId: entry.workType?.id,
                                    workedHours: entry.workedHours,
                                    driverId: entry.driverId,
                                    driverName: entry.driverName,
                                    type: 'range',
                                    rangeId: range.id,
                                    canEdit: false,
                                    canDelete: false
                                });
                            }
                        });
                    }
                });
            }

            // Sort by date
            monthlyEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
            setSarkyData(monthlyEntries);
        } catch (err) {
            console.error('Error fetching monthly sarky:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const generateMonthlySarky = async () => {
        try {
            setGeneratingSarky(true);
            
            // Get the number of days in the selected month
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            const generatedEntries = [];

            // Generate entries for each day of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(selectedYear, selectedMonth - 1, day);
                const dateString = date.toISOString().split('T')[0];
                
                // Check if entry already exists
                const existingEntry = sarkyData.find(entry => entry.date === dateString);
                if (!existingEntry) {
                    generatedEntries.push({
                        id: `temp-${day}`, // Temporary ID for new entries
                        date: dateString,
                        workType: null,
                        workTypeId: '',
                        workedHours: 8.0, // Default hours
                        driverId: equipmentData?.mainDriverId || '',
                        driverName: equipmentData?.mainDriverName || '',
                        type: 'draft',
                        canEdit: true,
                        canDelete: true,
                        isNew: true
                    });
                }
            }

            // Combine existing entries with generated ones
            const allEntries = [...sarkyData, ...generatedEntries];
            allEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
            setSarkyData(allEntries);
            
            showSuccess(`Generated ${generatedEntries.length} sarky entries for the month`);
        } catch (err) {
            console.error('Error generating monthly sarky:', err);
            setError(err.message);
        } finally {
            setGeneratingSarky(false);
        }
    };

    const updateSarkyEntry = (entryId, field, value) => {
        setSarkyData(prevData => 
            prevData.map(entry => 
                entry.id === entryId 
                    ? { ...entry, [field]: value }
                    : entry
            )
        );
    };

    const saveSarkyEntry = async (entry) => {
        if (!entry.workTypeId || !entry.workedHours || !entry.driverId) {
            showError("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);
            
            const formData = new FormData();
            formData.append("workType", entry.workTypeId);
            formData.append("workedHours", entry.workedHours);
            formData.append("date", entry.date);
            formData.append("driver", entry.driverId);

            if (entry.isNew) {
                // Create new entry
                const response = await axiosInstance.post(
                    `http://localhost:8080/api/v1/equipment/${equipmentId}/sarky`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                
                // Update the entry with the real ID from the server
                setSarkyData(prevData => 
                    prevData.map(e => 
                        e.id === entry.id 
                            ? { 
                                ...e, 
                                id: response.data.id, 
                                type: 'single',
                                isNew: false 
                            }
                            : e
                    )
                );
                
                showSuccess("Sarky entry saved successfully");
            } else {
                // Update existing entry
                await axiosInstance.put(
                    `http://localhost:8080/api/v1/sarky/${entry.id}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                
                showSuccess("Sarky entry updated successfully");
            }
        } catch (error) {
            console.error("Error saving sarky entry:", error);
            showError("Failed to save sarky entry: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const deleteSarkyEntry = async (entry) => {
        if (!entry.canDelete) {
            showError("This entry cannot be deleted");
            return;
        }

        const [year, month, day] = entry.date.split('-').map(Number);
        const displayDate = new Date(year, month - 1, day).toLocaleDateString();

        if (!window.confirm(`Are you sure you want to delete the sarky entry for ${displayDate}?`)) {
            return;
        }

        try {
            if (entry.isNew) {
                // Just remove from local state if it's a new entry
                setSarkyData(prevData => prevData.filter(e => e.id !== entry.id));
            } else {
                // Delete from server
                if (entry.type === 'single') {
                    await sarkyService.delete(entry.id);
                } else {
                    await sarkyService.deleteRange(entry.rangeId);
                }
                
                // Remove from local state
                setSarkyData(prevData => prevData.filter(e => e.id !== entry.id));
            }
            
            showSuccess("Sarky entry deleted successfully");
        } catch (error) {
            console.error("Error deleting sarky entry:", error);
            showError("Failed to delete sarky entry: " + (error.response?.data?.message || error.message));
        }
    };

    const saveAllEntries = async () => {
        // Get all editable entries that have the required fields filled
        const editableEntries = sarkyData.filter(entry => 
            entry.canEdit && 
            entry.workTypeId && 
            entry.workedHours && 
            entry.driverId
        );

        if (editableEntries.length === 0) {
            showError("No entries to save. Please fill in all required fields for at least one entry.");
            return;
        }

        setSavingAll(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const entry of editableEntries) {
                try {
                    const formData = new FormData();
                    formData.append("workType", entry.workTypeId);
                    formData.append("workedHours", entry.workedHours);
                    formData.append("date", entry.date);
                    formData.append("driver", entry.driverId);

                    if (entry.isNew) {
                        // Create new entry
                        const response = await axiosInstance.post(
                            `http://localhost:8080/api/v1/equipment/${equipmentId}/sarky`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                }
                            }
                        );
                        
                        // Update the entry with the real ID from the server
                        setSarkyData(prevData => 
                            prevData.map(e => 
                                e.id === entry.id 
                                    ? { 
                                        ...e, 
                                        id: response.data.id, 
                                        type: 'single',
                                        isNew: false 
                                    }
                                    : e
                            )
                        );
                    } else {
                        // Update existing entry
                        await axiosInstance.put(
                            `http://localhost:8080/api/v1/sarky/${entry.id}`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                }
                            }
                        );
                    }
                    
                    successCount++;
                } catch (error) {
                    console.error(`Error saving entry for ${entry.date}:`, error);
                    errorCount++;
                }
            }

            // Show summary message
            if (successCount > 0 && errorCount === 0) {
                showSuccess(`Successfully saved all ${successCount} entries`);
            } else if (successCount > 0 && errorCount > 0) {
                showError(`Saved ${successCount} entries, but ${errorCount} failed to save`);
            } else {
                showError(`Failed to save all ${errorCount} entries`);
            }

            // Refresh data to get the latest state
            if (successCount > 0) {
                fetchMonthlySarky();
            }
        } catch (error) {
            console.error("Error in bulk save operation:", error);
            showError("Failed to save entries: " + (error.response?.data?.message || error.message));
        } finally {
            setSavingAll(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTypeClass = (type) => {
        switch (type) {
            case 'single':
                return 'single';
            case 'range':
                return 'range';
            case 'draft':
                return 'draft';
            default:
                return '';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'single':
                return <FaTools className="type-icon single" />;
            case 'range':
                return <FaCalendarPlus className="type-icon range" />;
            case 'draft':
                return <FaEdit className="type-icon draft" />;
            default:
                return null;
        }
    };

    const getSarkySummary = () => {
        if (!sarkyData.length) return { completed: 0, draft: 0, total: 0, totalHours: 0 };

        const summary = {
            completed: sarkyData.filter(s => s.type === 'single' || s.type === 'range').length,
            draft: sarkyData.filter(s => s.type === 'draft').length,
            totalHours: sarkyData.reduce((sum, s) => sum + (parseFloat(s.workedHours) || 0), 0)
        };

        summary.total = sarkyData.length;
        return summary;
    };

    const getSaveableEntriesCount = () => {
        return sarkyData.filter(entry => 
            entry.canEdit && 
            entry.workTypeId && 
            entry.workedHours && 
            entry.driverId
        ).length;
    };

    const summary = getSarkySummary();
    const saveableCount = getSaveableEntriesCount();

    if (!equipmentData) {
        return <div className="loading">Loading equipment data...</div>;
    }

    if (loading && !sarkyData.length) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading monthly sarky data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Error: {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="sarky-attendance-container">
            <div className="filters-container">
                <div className="filter-group">
                    <label>Equipment:</label>
                    <input 
                        type="text" 
                        value={`${equipmentData.name} - ${equipmentData.type?.name || 'Unknown Type'}`}
                        disabled
                        className="equipment-display"
                    />
                </div>

                <div className="filter-group">
                    <label>Month:</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    >
                        {months.map(month => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Year:</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className="generate-btn"
                    onClick={generateMonthlySarky}
                    disabled={generatingSarky}
                >
                    <BsCalendarPlus /> Generate Monthly Sarky
                </button>

                <button
                    className="save-all-btn"
                    onClick={saveAllEntries}
                    disabled={savingAll || saveableCount === 0}
                >
                    <FaSave /> {savingAll ? 'Saving All...' : `Save All (${saveableCount})`}
                </button>
            </div>

            <div className="sarky-header">
                <h2>Monthly Sarky: {equipmentData.name}</h2>
                <h3>
                    {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                </h3>
            </div>

            {sarkyData.length > 0 && (
                <div className="sarky-summary">
                    <div className="summary-item">
                        <span className="label">Working Days:</span>
                        <span className="value">{summary.total}</span>
                    </div>
                    <div className="summary-item completed">
                        <span className="label">Completed:</span>
                        <span className="value">{summary.completed}</span>
                    </div>
                    <div className="summary-item draft">
                        <span className="label">Draft:</span>
                        <span className="value">{summary.draft}</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Total Hours:</span>
                        <span className="value">{summary.totalHours.toFixed(1)}h</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Completion Rate:</span>
                        <span className="value">
                            {summary.total > 0
                                ? `${Math.round((summary.completed / summary.total) * 100)}%`
                                : '0%'}
                        </span>
                    </div>
                </div>
            )}

            {sarkyData.length > 0 ? (
                <div className="sarky-table-container">
                    <table className="sarky-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Work Type</th>
                                <th>Hours</th>
                                <th>Driver</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sarkyData.map(entry => (
                                <tr key={entry.id} className={getTypeClass(entry.type)}>
                                    <td>{formatDate(entry.date)}</td>
                                    <td>
                                        {entry.canEdit ? (
                                            <select
                                                value={entry.workTypeId || ''}
                                                onChange={(e) => updateSarkyEntry(entry.id, 'workTypeId', e.target.value)}
                                                className="inline-select"
                                            >
                                                <option value="">Select Work Type</option>
                                                {workTypes.map(wt => (
                                                    <option key={wt.id} value={wt.id}>{wt.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span>{entry.workType?.name || 'Unknown'}</span>
                                        )}
                                    </td>
                                    <td>
                                        {entry.canEdit ? (
                                            <input
                                                type="number"
                                                value={entry.workedHours || ''}
                                                onChange={(e) => updateSarkyEntry(entry.id, 'workedHours', e.target.value)}
                                                min="0.5"
                                                step="0.5"
                                                className="inline-input"
                                            />
                                        ) : (
                                            <span>{entry.workedHours}h</span>
                                        )}
                                    </td>
                                    <td>
                                        {entry.canEdit ? (
                                            <select
                                                value={entry.driverId || ''}
                                                onChange={(e) => updateSarkyEntry(entry.id, 'driverId', e.target.value)}
                                                className="inline-select"
                                            >
                                                <option value="">Select Driver</option>
                                                {drivers.map(driver => (
                                                    <option key={driver.id} value={driver.id}>
                                                        {driver.fullName}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span>{entry.driverName}</span>
                                        )}
                                    </td>
                                    <td className="status-cell">
                                        {getTypeIcon(entry.type)}
                                        <span className="status-text">
                                            {entry.type === 'single' ? 'Completed' : 
                                             entry.type === 'range' ? 'Range Entry' : 'Draft'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {entry.canEdit && (
                                                <button
                                                    className="save-btn"
                                                    onClick={() => saveSarkyEntry(entry)}
                                                    disabled={!entry.workTypeId || !entry.workedHours || !entry.driverId}
                                                >
                                                    <FaSave /> Save
                                                </button>
                                            )}
                                            {entry.canDelete && (
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => deleteSarkyEntry(entry)}
                                                >
                                                    <FaTrash /> Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="no-data-container">
                    <p>No sarky records found for this month.</p>
                    <button
                        className="generate-btn"
                        onClick={generateMonthlySarky}
                        disabled={generatingSarky}
                    >
                        {generatingSarky ? 'Generating...' : 'Generate Monthly Sarky'}
                    </button>
                </div>
            )}
        </div>
    );
});

export default SarkyAttendance;