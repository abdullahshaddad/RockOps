import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Package, Users, Warehouse, AlertTriangle, TrendingUp, Search, RefreshCw, Activity, MapPin, CheckCircle, ArrowUp, ArrowDown, Eye, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import './WarehouseDashboard.scss';

const WarehouseManagerDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [timeframe, setTimeframe] = useState('week');
    const [selectedWarehouse, setSelectedWarehouse] = useState('all');

    // State for all data
    const [warehouses, setWarehouses] = useState([]);
    const [items, setItems] = useState([]);
    const [itemTypes, setItemTypes] = useState([]);
    const [itemCategories, setItemCategories] = useState([]);
    const [warehouseSummaries, setWarehouseSummaries] = useState({});
    const [itemCounts, setItemCounts] = useState({});

    const API_BASE_URL = 'http://localhost:8080/api/v1';

    // API Functions
    const fetchWarehouses = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            const response = await fetch(`${API_BASE_URL}/warehouses`, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            if (response.ok) {
                const data = await response.json();
                setWarehouses(data);
                return data;
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
        return [];
    };

    const fetchItemTypes = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            const response = await fetch(`${API_BASE_URL}/itemTypes`, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            if (response.ok) {
                const data = await response.json();
                setItemTypes(data);
                return data;
            }
        } catch (error) {
            console.error('Error fetching item types:', error);
        }
        return [];
    };

    const fetchItemCategories = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            const response = await fetch(`${API_BASE_URL}/itemCategories`, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            if (response.ok) {
                const data = await response.json();
                setItemCategories(data);
                return data;
            }
        } catch (error) {
            console.error('Error fetching item categories:', error);
        }
        return [];
    };

    const fetchWarehouseItems = async (warehouseId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            const response = await fetch(`${API_BASE_URL}/items/warehouse/${warehouseId}`, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            if (response.ok) return await response.json();
        } catch (error) {
            console.error(`Error fetching items for warehouse ${warehouseId}:`, error);
        }
        return [];
    };

    const fetchWarehouseSummary = async (warehouseId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            const response = await fetch(`${API_BASE_URL}/items/warehouse/${warehouseId}/summary`, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            if (response.ok) return await response.json();
        } catch (error) {
            console.error(`Error fetching summary for warehouse ${warehouseId}:`, error);
        }
        return {};
    };

    const fetchWarehouseItemCounts = async (warehouseId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            const response = await fetch(`${API_BASE_URL}/items/warehouse/${warehouseId}/counts`, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            if (response.ok) return await response.json();
        } catch (error) {
            console.error(`Error fetching counts for warehouse ${warehouseId}:`, error);
        }
        return {};
    };

    const loadAllData = async () => {
        setLoading(true);
        try {
            const warehousesData = await fetchWarehouses();
            await fetchItemTypes();
            await fetchItemCategories();

            const allItems = [];
            const summaries = {};
            const counts = {};

            for (const warehouse of warehousesData) {
                const warehouseItems = await fetchWarehouseItems(warehouse.id);
                const summary = await fetchWarehouseSummary(warehouse.id);
                const itemCounts = await fetchWarehouseItemCounts(warehouse.id);

                allItems.push(...warehouseItems.map(item => ({ ...item, warehouseName: warehouse.name })));
                summaries[warehouse.id] = summary;
                counts[warehouse.id] = itemCounts;
            }

            setItems(allItems);
            setWarehouseSummaries(summaries);
            setItemCounts(counts);
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // Calculate summary statistics
    const totalWarehouses = warehouses.length;
    const totalItems = items.length;
    const totalEmployees = warehouses.reduce((sum, w) => sum + (w.employees?.length || 0), 0);
    const totalAlerts = Object.values(itemCounts).reduce((sum, counts) =>
        sum + (counts.stolen || 0) + (counts.overReceived || 0), 0);

    const warehouseData = warehouses.map(warehouse => {
        const summary = warehouseSummaries[warehouse.id] || {};
        const counts = itemCounts[warehouse.id] || {};
        return {
            name: warehouse.name,
            totalItems: summary.totalItems || 0,
            activeIssues: summary.activeDiscrepancies || 0,
            inStock: counts.inWarehouse || 0,
            employees: warehouse.employees?.length || 0,
            capacity: 1000,
            utilization: Math.round(((summary.totalItems || 0) / 1000) * 100)
        };
    });

    const statusData = [
        { name: 'In Stock', value: items.filter(item => item.itemStatus === 'IN_WAREHOUSE').length, color: '#10b981' },
        { name: 'Missing', value: items.filter(item => item.itemStatus === 'MISSING').length, color: '#ef4444' },
        { name: 'Over Received', value: items.filter(item => item.itemStatus === 'OVERRECEIVED').length, color: '#f59e0b' },
        { name: 'Delivering', value: items.filter(item => item.itemStatus === 'DELIVERING').length, color: '#3b82f6' },
        { name: 'Pending', value: items.filter(item => item.itemStatus === 'PENDING').length, color: '#8b5cf6' }
    ].filter(item => item.value > 0);

    const categoryData = itemCategories.filter(cat => !cat.parentCategory).map(category => {
        const count = items.filter(item => {
            const itemCategory = item.itemType?.itemCategory;
            return itemCategory?.name === category.name || (itemCategory?.parentCategory?.name === category.name);
        }).length;
        return { name: category.name, value: count };
    }).filter(item => item.value > 0).slice(0, 5);

    const trendData = [
        { name: 'Mon', items: 2400, issues: 24 },
        { name: 'Tue', items: 1398, issues: 13 },
        { name: 'Wed', items: 9800, issues: 98 },
        { name: 'Thu', items: 3908, issues: 39 },
        { name: 'Fri', items: 4800, issues: 48 },
        { name: 'Sat', items: 3800, issues: 38 },
        { name: 'Sun', items: 4300, issues: 43 }
    ];

    return (
        <div className="warehouse-dashboard">
            {/* Header Section */}
            <header className="dashboard-header">
                <div className="header-container">
                    <div className="header-content">
                        <div className="title-section">
                            <h1>Warehouse Operations</h1>
                            <p>Real-time insights and analytics dashboard</p>
                        </div>
                        <div className="header-controls">
                            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="time-filter">
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                            </select>
                            <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} className="warehouse-filter">
                                <option value="all">All Warehouses</option>
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                            <button onClick={loadAllData} disabled={loading} className="refresh-btn">
                                <RefreshCw className={loading ? "spinning" : ""} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="dashboard-content">
                {/* KPI Section */}
                <section className="kpi-section">
                    <div className="section-header">
                        <h2>Key Performance Indicators</h2>
                        <p>Real-time overview of your warehouse operations</p>
                    </div>
                    <div className="kpi-grid">
                        <div className="kpi-card primary">
                            <div className="kpi-icon">
                                <Package />
                            </div>
                            <div className="kpi-content">
                                <div className="kpi-value">{totalItems.toLocaleString()}</div>
                                <div className="kpi-label">Total Inventory</div>
                                <div className="kpi-trend positive">
                                    <ArrowUp size={14} />
                                    +12% from last month
                                </div>
                            </div>
                        </div>

                        <div className="kpi-card success">
                            <div className="kpi-icon">
                                <CheckCircle />
                            </div>
                            <div className="kpi-content">
                                <div className="kpi-value">{Math.round((statusData.find(s => s.name === 'In Stock')?.value || 0) / totalItems * 100) || 0}%</div>
                                <div className="kpi-label">Stock Availability</div>
                                <div className="kpi-trend positive">
                                    <ArrowUp size={14} />
                                    +8% from last week
                                </div>
                            </div>
                        </div>

                        <div className="kpi-card warning">
                            <div className="kpi-icon">
                                <AlertTriangle />
                            </div>
                            <div className="kpi-content">
                                <div className="kpi-value">{totalAlerts}</div>
                                <div className="kpi-label">Active Issues</div>
                                <div className="kpi-trend negative">
                                    <ArrowDown size={14} />
                                    -3% from last week
                                </div>
                            </div>
                        </div>

                        <div className="kpi-card info">
                            <div className="kpi-icon">
                                <Users />
                            </div>
                            <div className="kpi-content">
                                <div className="kpi-value">{totalEmployees}</div>
                                <div className="kpi-label">Team Members</div>
                                <div className="kpi-trend neutral">
                                    <Activity size={14} />
                                    Across {totalWarehouses} locations
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Analytics Section */}
                <section className="analytics-section">
                    <div className="section-header">
                        <h2>Performance Analytics</h2>
                        <p>Deep insights into warehouse operations and trends</p>
                    </div>
                    <div className="analytics-grid">
                        {/* Main Chart */}
                        <div className="chart-card main-chart">
                            <div className="chart-header">
                                <div className="chart-title">
                                    <BarChart3 className="chart-icon" />
                                    <div>
                                        <h3>Warehouse Performance</h3>
                                        <p>Inventory levels and capacity utilization</p>
                                    </div>
                                </div>
                                <button className="view-details-btn">
                                    <Eye size={16} />
                                    View Details
                                </button>
                            </div>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={warehouseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                                        <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                                        <Tooltip contentStyle={{
                                            backgroundColor: 'var(--color-surface)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--color-text-primary)'
                                        }} />
                                        <Bar dataKey="totalItems" fill="#3b82f6" name="Total Items" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="activeIssues" fill="#ef4444" name="Active Issues" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Status Chart */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <div className="chart-title">
                                    <PieChartIcon className="chart-icon" />
                                    <div>
                                        <h3>Inventory Status</h3>
                                        <p>Current distribution</p>
                                    </div>
                                </div>
                            </div>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="chart-legend">
                                {statusData.map((item, index) => (
                                    <div key={item.name} className="legend-item">
                                        <div className="legend-color" style={{ backgroundColor: item.color }} />
                                        <span className="legend-label">{item.name}</span>
                                        <span className="legend-value">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trends Chart */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <div className="chart-title">
                                    <TrendingUp className="chart-icon" />
                                    <div>
                                        <h3>Weekly Trends</h3>
                                        <p>Items vs issues</p>
                                    </div>
                                </div>
                            </div>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                                        <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="items" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                                        <Area type="monotone" dataKey="issues" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Warehouse Management Section */}
                <section className="warehouse-section">
                    <div className="section-header">
                        <h2>Warehouse Management</h2>
                        <p>Monitor and manage individual warehouse locations</p>
                    </div>
                    <div className="warehouse-content">
                        <div className="warehouse-overview">
                            <div className="overview-header">
                                <div className="overview-title">
                                    <Warehouse className="overview-icon" />
                                    <div>
                                        <h3>Active Locations</h3>
                                        <p>Real-time status and metrics</p>
                                    </div>
                                </div>
                                <div className="search-container">
                                    <Search className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search warehouses..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                            </div>
                            <div className="warehouse-grid">
                                {warehouseData.filter(w =>
                                    w.name.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((warehouse, index) => (
                                    <div key={warehouse.name} className="warehouse-card">
                                        <div className="warehouse-header">
                                            <div className="warehouse-info">
                                                <h4>{warehouse.name}</h4>
                                                <div className="warehouse-meta">
                                                    <span><MapPin size={12} /> Location {index + 1}</span>
                                                    <span><Users size={12} /> {warehouse.employees} staff</span>
                                                </div>
                                            </div>
                                            <div className={`status-badge ${warehouse.activeIssues === 0 ? 'success' : 'warning'}`}>
                                                {warehouse.activeIssues === 0 ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                            </div>
                                        </div>
                                        <div className="warehouse-stats">
                                            <div className="stat">
                                                <span className="stat-value">{warehouse.totalItems.toLocaleString()}</span>
                                                <span className="stat-label">Items</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-value">{warehouse.utilization}%</span>
                                                <span className="stat-label">Capacity</span>
                                            </div>
                                            <div className="stat">
                                                <span className={`stat-value ${warehouse.activeIssues > 0 ? 'warning' : 'success'}`}>
                                                    {warehouse.activeIssues}
                                                </span>
                                                <span className="stat-label">Issues</span>
                                            </div>
                                        </div>
                                        <div className="capacity-indicator">
                                            <div className="capacity-bar">
                                                <div
                                                    className="capacity-fill"
                                                    style={{
                                                        width: `${warehouse.utilization}%`,
                                                        backgroundColor: warehouse.utilization > 80 ? '#ef4444' :
                                                            warehouse.utilization > 60 ? '#f59e0b' : '#10b981'
                                                    }}
                                                />
                                            </div>
                                            <span className="capacity-text">{warehouse.utilization}% utilized</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="category-overview">
                            <div className="category-header">
                                <div className="category-title">
                                    <Package className="category-icon" />
                                    <div>
                                        <h3>Category Distribution</h3>
                                        <p>Items by main categories</p>
                                    </div>
                                </div>
                            </div>
                            <div className="category-list">
                                {categoryData.map((category, index) => (
                                    <div key={category.name} className="category-item">
                                        <div className="category-info">
                                            <span className="category-name">{category.name}</span>
                                            <span className="category-count">{category.value} items</span>
                                        </div>
                                        <div className="category-bar">
                                            <div
                                                className="category-fill"
                                                style={{
                                                    width: `${(category.value / Math.max(...categoryData.map(c => c.value))) * 100}%`,
                                                    backgroundColor: `hsl(${200 + index * 40}, 70%, 50%)`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default WarehouseManagerDashboard;