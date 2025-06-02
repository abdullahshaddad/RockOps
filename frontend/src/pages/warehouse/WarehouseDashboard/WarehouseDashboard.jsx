import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Package, Users, Warehouse, AlertTriangle, TrendingUp, Search, RefreshCw, Activity, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import './WarehouseDashboard.scss';

const WarehouseManagerDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await fetch(`${API_BASE_URL}/warehouses`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWarehouses(data);
                return data;
            } else {
                console.error('Failed to fetch warehouses:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
        return [];
    };

    const fetchItemTypes = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await fetch(`${API_BASE_URL}/itemTypes`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                setItemTypes(data);
                return data;
            } else {
                console.error('Failed to fetch item types:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching item types:', error);
        }
        return [];
    };

    const fetchItemCategories = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await fetch(`${API_BASE_URL}/itemCategories`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                setItemCategories(data);
                return data;
            } else {
                console.error('Failed to fetch item categories:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching item categories:', error);
        }
        return [];
    };

    const fetchWarehouseItems = async (warehouseId) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await fetch(`${API_BASE_URL}/items/warehouse/${warehouseId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                console.error(`Failed to fetch items for warehouse ${warehouseId}:`, response.status, response.statusText);
            }
        } catch (error) {
            console.error(`Error fetching items for warehouse ${warehouseId}:`, error);
        }
        return [];
    };

    const fetchWarehouseSummary = async (warehouseId) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await fetch(`${API_BASE_URL}/items/warehouse/${warehouseId}/summary`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                console.error(`Failed to fetch summary for warehouse ${warehouseId}:`, response.status, response.statusText);
            }
        } catch (error) {
            console.error(`Error fetching summary for warehouse ${warehouseId}:`, error);
        }
        return {};
    };

    const fetchWarehouseItemCounts = async (warehouseId) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await fetch(`${API_BASE_URL}/items/warehouse/${warehouseId}/counts`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                console.error(`Failed to fetch counts for warehouse ${warehouseId}:`, response.status, response.statusText);
            }
        } catch (error) {
            console.error(`Error fetching counts for warehouse ${warehouseId}:`, error);
        }
        return {};
    };

    // Load all data
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

    // Utility functions
    const getItemStatusLabel = (status) => {
        const statusMap = {
            'IN_WAREHOUSE': 'In Stock',
            'MISSING': 'Missing',
            'OVERRECEIVED': 'Over Received',
            'DELIVERING': 'Delivering',
            'PENDING': 'Pending'
        };
        return statusMap[status] || status;
    };

    const getItemStatusClass = (status) => {
        const statusClasses = {
            'IN_WAREHOUSE': 'status-in-stock',
            'MISSING': 'status-missing',
            'OVERRECEIVED': 'status-over-received',
            'DELIVERING': 'status-delivering',
            'PENDING': 'status-pending'
        };
        return statusClasses[status] || 'status-default';
    };

    // Calculate summary statistics
    const totalWarehouses = warehouses.length;
    const totalItems = items.length;
    const totalEmployees = warehouses.reduce((sum, w) => sum + (w.employees?.length || 0), 0);
    const totalAlerts = Object.values(itemCounts).reduce((sum, counts) =>
        sum + (counts.stolen || 0) + (counts.overReceived || 0), 0);
    const totalResolved = Object.values(itemCounts).reduce((sum, counts) =>
        sum + (counts.resolved || 0), 0);

    // Prepare chart data
    const warehouseData = warehouses.map(warehouse => {
        const summary = warehouseSummaries[warehouse.id] || {};
        const counts = itemCounts[warehouse.id] || {};
        return {
            name: warehouse.name,
            totalItems: summary.totalItems || 0,
            activeIssues: summary.activeDiscrepancies || 0,
            inStock: counts.inWarehouse || 0,
            employees: warehouse.employees?.length || 0
        };
    });

    // Separate parent and child categories
    const parentCategories = itemCategories.filter(category => !category.parentCategory);
    const childCategories = itemCategories.filter(category => category.parentCategory);

    // Parent categories data
    const parentCategoryData = parentCategories.map(category => {
        const count = items.filter(item => {
            const itemCategory = item.itemType?.itemCategory;
            // Count items that belong directly to this parent category or to its children
            return itemCategory?.name === category.name ||
                (itemCategory?.parentCategory?.name === category.name);
        }).length;
        return {
            name: category.name,
            count: count,
            value: count,
            children: childCategories.filter(child => child.parentCategory?.name === category.name)
        };
    }).filter(item => item.count > 0);

    // Child categories data
    const childCategoryData = childCategories.map(category => {
        const count = items.filter(item => item.itemType?.itemCategory?.name === category.name).length;
        return {
            name: category.name,
            count: count,
            value: count,
            parent: category.parentCategory?.name || 'No Parent'
        };
    }).filter(item => item.count > 0);

    // Item Types grouped by category
    const itemTypesByCategory = {};
    itemCategories.forEach(category => {
        const typesInCategory = itemTypes.filter(type => type.itemCategory?.name === category.name);
        if (typesInCategory.length > 0) {
            itemTypesByCategory[category.name] = typesInCategory.map(type => {
                const count = items.filter(item => item.itemType?.name === type.name).length;
                return {
                    name: type.name,
                    count: count,
                    category: category.name,
                    isParentCategory: !category.parentCategory,
                    parentCategory: category.parentCategory?.name || null
                };
            }).filter(type => type.count > 0);
        }
    });

    const statusData = [
        { name: 'In Stock', value: items.filter(item => item.itemStatus === 'IN_WAREHOUSE').length, color: '#10b981' },
        { name: 'Missing', value: items.filter(item => item.itemStatus === 'MISSING').length, color: '#ef4444' },
        { name: 'Over Received', value: items.filter(item => item.itemStatus === 'OVERRECEIVED').length, color: '#f59e0b' },
        { name: 'Delivering', value: items.filter(item => item.itemStatus === 'DELIVERING').length, color: '#3b82f6' },
        { name: 'Pending', value: items.filter(item => item.itemStatus === 'PENDING').length, color: '#8b5cf6' }
    ].filter(item => item.value > 0);

    const COLORS = ['#87ceeb', '#60a5fa', '#93c5fd', '#dbeafe', '#a2d2ff'];

    // Filter items for search
    const filteredItems = items.filter(item =>
        item.itemType?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouseName?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Show only top 10 for dashboard

    return (
        <div className="modern-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-main">
                        <h1>Warehouse Management Dashboard</h1>
                        <p>Real-time overview of your warehouse operations</p>
                    </div>
                    <div className="header-actions">
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="metrics-section">
                <div className="metric-card primary">
                    <div className="metric-icon">
                        <Warehouse />
                    </div>
                    <div className="metric-content">
                        <h3>{totalWarehouses}</h3>
                        <p>Active Warehouses</p>
                        <span className="metric-trend">+2 this month</span>
                    </div>
                </div>

                <div className="metric-card success">
                    <div className="metric-icon">
                        <Package />
                    </div>
                    <div className="metric-content">
                        <h3>{totalItems.toLocaleString()}</h3>
                        <p>Total Items</p>
                        <span className="metric-trend">{itemTypes.length} item types</span>
                    </div>
                </div>

                <div className="metric-card info">
                    <div className="metric-icon">
                        <Users />
                    </div>
                    <div className="metric-content">
                        <h3>{totalEmployees}</h3>
                        <p>Total Employees</p>
                        <span className="metric-trend">Across all locations</span>
                    </div>
                </div>

                <div className="metric-card warning">
                    <div className="metric-icon">
                        <AlertTriangle />
                    </div>
                    <div className="metric-content">
                        <h3>{totalAlerts}</h3>
                        <p>Active Alerts</p>
                        <span className="metric-trend">{totalResolved} resolved this week</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="content-grid">
                {/* Warehouse Overview */}
                <div className="card large">
                    <div className="card-header">
                        <h3>Warehouse Performance</h3>
                        <p>Items, issues, and capacity across locations</p>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={warehouseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Bar dataKey="totalItems" fill="#87ceeb" name="Total Items" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="activeIssues" fill="#ef4444" name="Active Issues" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Parent Categories */}
                <div className="card medium">
                    <div className="card-header">
                        <h3>Parent Categories</h3>
                        <p>Main category distribution</p>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={parentCategoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {parentCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="legend">
                        {parentCategoryData.map((entry, index) => (
                            <div key={entry.name} className="legend-item">
                                <div
                                    className="legend-color"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></div>
                                <span>{entry.name} ({entry.count} items)</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Child Categories */}
                <div className="card medium">
                    <div className="card-header">
                        <h3>Child Categories</h3>
                        <p>Subcategory breakdown</p>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={childCategoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    formatter={(value, name, props) => [
                                        `${value} items`,
                                        `Parent: ${props.payload.parent}`
                                    ]}
                                />
                                <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>



                {/* Warehouse Cards */}


                {/* Item Types by Category */}
                <div className="card large">
                    <div className="card-header">
                        <h3>Item Types by Category</h3>
                        <p>Detailed breakdown of item types within each category</p>
                    </div>
                    <div className="category-breakdown">
                        {Object.entries(itemTypesByCategory).map(([categoryName, types]) => {
                            const category = itemCategories.find(cat => cat.name === categoryName);
                            const isParent = !category?.parentCategory;

                            return (
                                <div key={categoryName} className="category-section">
                                    <div className="category-header">
                                        <h4 className={isParent ? 'parent-category' : 'child-category'}>
                                            {isParent ? '📁' : '📂'} {categoryName}
                                            {!isParent && (
                                                <span className="parent-ref">
                                                    → Parent: {category?.parentCategory?.name}
                                                </span>
                                            )}
                                        </h4>
                                        <span className="category-total">
                                            {types.reduce((sum, type) => sum + type.count, 0)} total items
                                        </span>
                                    </div>
                                    <div className="item-types-grid">
                                        {types.map(type => (
                                            <div key={type.name} className="item-type-card">
                                                <div className="item-type-name">{type.name}</div>
                                                <div className="item-type-count">{type.count} items</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseManagerDashboard;