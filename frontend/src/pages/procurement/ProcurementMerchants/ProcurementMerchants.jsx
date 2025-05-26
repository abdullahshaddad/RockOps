import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./ProcurementMerchants.scss"
import merchantsImage from "../../../Assets/imgs/pro_icon.png";

const ProcurementMerchants = () => {
    const [merchants, setMerchants] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [sites, setSites] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentMerchantId, setCurrentMerchantId] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] = useState("");
    const [userRole, setUserRole] = useState('');

    // Form data for adding a new merchant
    const [formData, setFormData] = useState({
        name: '',
        merchantType: '',
        contactEmail: '',
        contactPhone: '',
        contactSecondPhone: '',
        contactPersonName: '',
        address: '',
        siteId: '',
        preferredPaymentMethod: '',
        taxIdentificationNumber: '',
        reliabilityScore: '',
        averageDeliveryTime: '',
        lastOrderDate: '',
        notes: '',
        itemCategoryIds: ''
    });

    const [itemCategories, setItemCategories] = useState([]);
    const [selectedItemCategories, setSelectedItemCategories] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setLoading(true);

        // Fetch merchants
        fetch('http://localhost:8080/api/v1/merchants', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch');
                return response.json();
            })
            .then(data => {
                setMerchants(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching merchants:', error);
                setError(error.message);
                setLoading(false);
            });

        // Fetch sites for the dropdown
        fetch('http://localhost:8080/api/v1/site', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch sites');
                return response.json();
            })
            .then(data => {
                setSites(data);
            })
            .catch(error => {
                console.error('Error fetching sites:', error);
            });

        // Fetch item categories for the dropdown
        fetch('http://localhost:8080/api/v1/item-categories', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch item categories');
                return response.json();
            })
            .then(data => {
                setItemCategories(data);
            })
            .catch(error => {
                console.error('Error fetching item categories:', error);
            });
    }, []);

    const onEdit = (merchant) => {
        console.log("Editing merchant:", merchant);

        // Set form data with current merchant values
        setFormData({
            name: merchant.name,
            merchantType: merchant.merchantType,
            contactEmail: merchant.contactEmail || '',
            contactPhone: merchant.contactPhone || '',
            contactSecondPhone: merchant.contactSecondPhone || '',
            contactPersonName: merchant.contactPersonName || '',
            address: merchant.address || '',
            siteId: merchant.site ? merchant.site.id : '',
            preferredPaymentMethod: merchant.preferredPaymentMethod || '',
            taxIdentificationNumber: merchant.taxIdentificationNumber || '',
            reliabilityScore: merchant.reliabilityScore || '',
            averageDeliveryTime: merchant.averageDeliveryTime || '',
            lastOrderDate: merchant.lastOrderDate ? new Date(merchant.lastOrderDate).toISOString().split('T')[0] : '',
            notes: merchant.notes || '',
            itemCategoryIds: merchant.itemCategories ? merchant.itemCategories.map(cat => cat.id).join(',') : ''
        });

        // Set selected item categories if any
        if (merchant.itemCategories && merchant.itemCategories.length > 0) {
            setSelectedItemCategories(merchant.itemCategories.map(cat => cat.id));
        } else {
            setSelectedItemCategories([]);
        }

        // Set modal mode to edit
        const newMode = 'edit';
        setModalMode(newMode);
        console.log("modee" + modalMode);

        // Store current merchant ID
        setCurrentMerchantId(merchant.id);

        // Show modal
        setShowAddModal(true);
    };

    useEffect(() => {
        // Add this code to get the user role
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.role) {
            setUserRole(userInfo.role);
        }

        setLoading(true);

        // Rest of your existing useEffect code...
    }, []);

    const onDelete = (id) => {
        console.log("Deleting merchant with id:", id);
        // Optionally implement delete logic here
    };

    const filteredMerchants = merchants.filter(m =>
        m.name.toLowerCase().includes(localSearchTerm.toLowerCase())
    );

    const handleOpenModal = () => {
        setShowAddModal(true);
    };

    const handleCloseModals = () => {
        setShowAddModal(false);
        setModalMode('add');
        setCurrentMerchantId(null);
        // Reset form data when closing modal
        setFormData({
            name: '',
            merchantType: '',
            contactEmail: '',
            contactPhone: '',
            contactSecondPhone: '',
            contactPersonName: '',
            address: '',
            siteId: '',
            preferredPaymentMethod: '',
            taxIdentificationNumber: '',
            reliabilityScore: '',
            averageDeliveryTime: '',
            lastOrderDate: '',
            notes: '',
            itemCategoryIds: ''
        });
        setPreviewImage(null);
        setSelectedItemCategories([]);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Function to fetch item categories
    const fetchItemCategories = () => {
        const token = localStorage.getItem('token');

        fetch('http://localhost:8080/api/v1/itemCategories/children', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch item categories');
                return response.json();
            })
            .then(data => {
                setItemCategories(data);
            })
            .catch(error => {
                console.error('Error fetching item categories:', error);
            });
    };

// Call it in useEffect
    useEffect(() => {
        fetchItemCategories();
        // Add other fetches here if needed
    }, []);


    const handleCategorySelect = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleAddCategory = () => {
        if (selectedCategory && !selectedItemCategories.includes(selectedCategory)) {
            const updatedCategories = [...selectedItemCategories, selectedCategory];
            setSelectedItemCategories(updatedCategories);

            // Update form data with comma-separated category IDs
            setFormData({
                ...formData,
                itemCategoryIds: updatedCategories.join(',')
            });
        }
    };

    const handleRemoveCategory = (categoryId) => {
        const updatedCategories = selectedItemCategories.filter(id => id !== categoryId);
        setSelectedItemCategories(updatedCategories);

        // Update form data with comma-separated category IDs
        setFormData({
            ...formData,
            itemCategoryIds: updatedCategories.join(',')
        });
    };

    const getCategoryName = (categoryId) => {
        const category = itemCategories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Unknown Category';
    };

    const handleAddMerchant = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Create a merchant object from form data
        const merchantData = {
            ...formData,
            // Convert numeric string values to numbers if they exist
            reliabilityScore: formData.reliabilityScore ? parseFloat(formData.reliabilityScore) : null,
            averageDeliveryTime: formData.averageDeliveryTime ? parseFloat(formData.averageDeliveryTime) : null,
            // Convert date to timestamp if it exists
            lastOrderDate: formData.lastOrderDate ? new Date(formData.lastOrderDate).getTime() : null
        };

        fetch('http://localhost:8080/api/v1/procurement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(merchantData)
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to add merchant');
                return response.json();
            })
            .then(newMerchant => {
                // Add the new merchant to the list
                setMerchants([...merchants, newMerchant]);
                handleCloseModals();
                setShowSuccessNotification("added");
                setShowNotification(true);
                setTimeout(() => {
                    setShowNotification(false);
                }, 3000);
            })
            .catch(error => {
                console.error('Error adding merchant:', error);
                // Handle error (could add error state and display it)
            });
    };

    const handleUpdateMerchant = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Create a merchant object from form data
        const merchantData = {
            name: formData.name,
            merchantType: formData.merchantType,
            // Make sure to include these fields even if they're empty strings
            contactEmail: formData.contactEmail || '',
            contactPhone: formData.contactPhone || '',
            contactSecondPhone: formData.contactSecondPhone || '',
            contactPersonName: formData.contactPersonName || '',
            address: formData.address || '',
            siteId: formData.siteId || '',
            preferredPaymentMethod: formData.preferredPaymentMethod || '',
            taxIdentificationNumber: formData.taxIdentificationNumber || '',
            reliabilityScore: formData.reliabilityScore ? parseFloat(formData.reliabilityScore) : null,
            averageDeliveryTime: formData.averageDeliveryTime ? parseFloat(formData.averageDeliveryTime) : null,
            lastOrderDate: formData.lastOrderDate ? new Date(formData.lastOrderDate).getTime() : null,
            notes: formData.notes || '',
            itemCategoryIds: formData.itemCategoryIds || ''
        };
        console.log('Updating merchant with data:', JSON.stringify(merchantData, null, 2));


        fetch(`http://localhost:8080/api/v1/procurement/${currentMerchantId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(merchantData)
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to update merchant');
                return response.json();
            })
            .then(updatedMerchant => {
                // Update the merchant in the list
                const updatedMerchants = merchants.map(m =>
                    m.id === updatedMerchant.id ? updatedMerchant : m
                );
                setShowSuccessNotification("updated");
                setMerchants(updatedMerchants);
                setShowNotification(true);
                handleCloseModals();
                setTimeout(() => {
                    setShowNotification(false);
                }, 3000);
            })
            .catch(error => {
                console.error('Error updating merchant:', error);
                // Handle error
            });
    };

    return (
        <div className="procurement-merchants-container">
            {/* Intro Card with centered title and search bar */}
            <div className="procurement-intro-card">
                <div className="procurement-intro-left">
                    <img
                        src={merchantsImage} // Provide the merchants image
                        alt="Merchants"
                        className="procurement-intro-image"
                    />
                </div>

                <div className="procurement-intro-content">
                    <div className="procurement-intro-header">
                        <span className="procurement-label">PROCUREMENT CENTER</span>
                        <h2 className="procurement-intro-title">Merchants</h2>
                    </div>

                    <div className="procurement-stats">
                        <div className="procurement-stat-item">
                            <span className="procurement-stat-value">{merchants.length}</span>
                            <span className="procurement-stat-label">Total Merchants</span>
                        </div>
                        <div className="procurement-stat-item">

                        </div>
                    </div>
                </div>

                <div className="procurement-intro-right">
                    <button className="procurement-info-button">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Search and Description */}
            <div className="procurement-requests-section-description">
                (Vendors, suppliers, and business partners that provide products or services)

                <div className="procurement-search-container">
                    <input
                        type="text"
                        placeholder="Search merchants..."
                        className="procurement-search-input"
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                    />
                    <svg className="procurement-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                </div>
            </div>

            {/* Then your merchants table like you already have */}


    <div className="procurement-merchants-table-container">

            <div className="procurement-merchants-table-wrapper">
                <div
                    className="procurement-merchants-table-card"
                    style={{ minHeight: filteredMerchants.length === 0 ? '300px' : 'auto' }}
                >
                    {loading ? (
                        <div className="procurement-merchants-loading-container">
                            <div className="procurement-merchants-loading-spinner"></div>
                            <p>Loading merchants data...</p>
                        </div>
                    ) : error ? (
                        <div className="procurement-merchants-error-container">
                            <p>Error: {error}</p>
                            <p>Please try again later or contact support.</p>
                        </div>
                    ) : (
                        <div className="procurement-merchants-table-body">
                            <div className="procurement-merchants-header-row">
                                <div className="procurement-merchants-header-cell name-cell">MERCHANT</div>
                                <div className="procurement-merchants-header-cell type-cell">TYPE</div>
                                <div className="procurement-merchants-header-cell email-cell">EMAIL</div>
                                <div className="procurement-merchants-header-cell phone-cell">PHONE</div>
                                <div className="procurement-merchants-header-cell address-cell">ADDRESS</div>
                                <div className="procurement-merchants-header-cell site-cell">SITE</div>
                                <div className="procurement-merchants-header-cell actions-cell">ACTIONS</div>
                            </div>

                            {filteredMerchants.length > 0 ? (
                                filteredMerchants.map((merchant, index) => (
                                    <div
                                        className="procurement-merchants-table-row"
                                        key={index}
                                        onClick={() => navigate(`/merchants/${merchant.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="procurement-merchants-table-cell name-cell">{merchant.name}</div>
                                        <div className="procurement-merchants-table-cell type-cell">{merchant.merchantType}</div>
                                        <div className="procurement-merchants-table-cell email-cell">
                                            {merchant.contactEmail || "-"}
                                        </div>
                                        <div className="procurement-merchants-table-cell phone-cell">
                                            {merchant.contactPhone || "-"}
                                        </div>
                                        <div className="procurement-merchants-table-cell address-cell">
                                            {merchant.address || "-"}
                                        </div>
                                        <div className="procurement-merchants-table-cell site-cell">
                                            {merchant.site ? merchant.site.name : "None"}
                                        </div>
                                        <div
                                            className="procurement-merchants-table-cell actions-cell"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                className="procurement-merchants-edit-button"
                                                onClick={() => onEdit(merchant)}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="procurement-merchants-delete-button"
                                                onClick={() => onDelete(merchant.id)}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                    <line x1="10" y1="11" x2="10" y2="17" />
                                                    <line x1="14" y1="11" x2="14" y2="17" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="procurement-merchants-empty-state">
                                    <div className="procurement-merchants-empty-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </div>
                                    <h3>No merchants found</h3>
                                    <p>Try adjusting your search or add a new merchant</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>


                {userRole === 'PROCUREMENT' && (
                    <div className="procurement-merchants-add-button-container">
                        <button className="procurement-merchants-add-button"
                                onClick={handleOpenModal}>
                            <svg className="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Add Merchant Modal */}
            {showAddModal && (
                <div className="merchant-modal-overlay">
                    <div className="merchant-modal-content">
                        <div className="merchant-modal-header">
                            <h2>{modalMode === 'add' ? 'Add New Merchant' : 'Edit Merchant'}</h2>
                            <button className="merchant-modal-close-button" onClick={handleCloseModals}>×</button>
                        </div>

                        <div className="merchant-modal-body">
                            <div className="merchant-form-container">
                                <div className="merchant-form-card">
                                    <div className="merchant-form-profile-section">
                                        <label htmlFor="merchantImageUpload" className="merchant-form-image-label">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Merchant" className="merchant-form-image" />
                                            ) : (
                                                <div className="merchant-form-image-placeholder"></div>
                                            )}
                                            <span className="merchant-form-upload-text">Upload Logo</span>
                                        </label>
                                        <input
                                            type="file"
                                            id="merchantImageUpload"
                                            name="photo"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: "none" }}
                                        />
                                    </div>

                                    <div className="merchant-form-fields-section">
                                        <form onSubmit={modalMode === 'add' ? handleAddMerchant : handleUpdateMerchant}>
                                            <div className="merchant-form-grid">
                                                {/* Basic Information Section */}
                                                <div className="merchant-form-group">
                                                    <label className="merchant-form-label required-field">Merchant Name</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="merchant-form-input"
                                                        placeholder="Enter merchant name"
                                                    />
                                                </div>

                                                <div className="merchant-form-group">
                                                    <label className="merchant-form-label required-field">Merchant Type *</label>
                                                    <select
                                                        name="merchantType"
                                                        value={formData.merchantType}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="merchant-form-select"
                                                    >
                                                        <option value="">Select a Type</option>
                                                        <option value="SUPPLIER">Supplier</option>
                                                        <option value="DISTRIBUTOR">Distributor</option>
                                                        <option value="MANUFACTURER">Manufacturer</option>
                                                        <option value="SERVICE_PROVIDER">Service Provider</option>
                                                        <option value="RETAILER">Retailer</option>
                                                        <option value="WHOLESALER">Wholesaler</option>
                                                        <option value="OTHER">Other</option>
                                                    </select>
                                                </div>

                                                {/* Contact Information Section */}
                                                <div className="merchant-form-group">
                                                    <label className="merchant-form-label required-field">Contact Person Name </label>
                                                    <input
                                                        type="text"
                                                        name="contactPersonName"
                                                        value={formData.contactPersonName}
                                                        onChange={handleInputChange}
                                                        className="merchant-form-input"
                                                        placeholder="Enter contact person name"
                                                    />
                                                </div>

                                                <div className="merchant-form-group">
                                                    <label className="merchant-form-label required-field">Contact Email</label>
                                                    <input
                                                        type="email"
                                                        name="contactEmail"
                                                        value={formData.contactEmail}
                                                        onChange={handleInputChange}
                                                        className="merchant-form-input"
                                                        placeholder="Enter contact email"
                                                    />
                                                </div>

                                                <div className="merchant-form-group">
                                                    <label className="merchant-form-label required-field">Primary Phone</label>
                                                    <input
                                                        type="tel"
                                                        name="contactPhone"
                                                        value={formData.contactPhone}
                                                        onChange={handleInputChange}
                                                        className="merchant-form-input"
                                                        placeholder="Enter primary phone"
                                                    />
                                                </div>

                                                <div className="merchant-form-group">
                                                    <label className="merchant-form-label">Secondary Phone</label>
                                                    <input
                                                        type="tel"
                                                        name="contactSecondPhone"
                                                        value={formData.contactSecondPhone}
                                                        onChange={handleInputChange}
                                                        className="merchant-form-input"
                                                        placeholder="Enter secondary phone"
                                                    />
                                                </div>

                                                <div className="merchant-form-group">
                                                    <label className="merchant-form-label required-field">Address</label>
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        className="merchant-form-input"
                                                        placeholder="Enter address"
                                                    />
                                                </div>

                                                <div className="merchant-form-group">
                                                    <label className="merchant-form-label required-field">Site</label>
                                                    <select
                                                        name="siteId"
                                                        value={formData.siteId}
                                                        onChange={handleInputChange}
                                                        className="merchant-form-select"
                                                    >
                                                        <option value="">Select a Site</option>
                                                        {sites.map(site => (
                                                            <option key={site.id} value={site.id}>{site.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Business Information Section */}
                                                <div className="merchant-form-group">
                                                    <label className="merchant-form-label required-field">Preferred Payment Method</label>
                                                    <select
                                                        name="preferredPaymentMethod"
                                                        value={formData.preferredPaymentMethod}
                                                        onChange={handleInputChange}
                                                        className="merchant-form-select"
                                                    >
                                                        <option value="">Select Payment Method</option>
                                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                                        <option value="CREDIT_CARD">Credit Card</option>
                                                        <option value="CASH">Cash</option>
                                                        <option value="CHECK">Check</option>
                                                        <option value="PAYPAL">PayPal</option>
                                                        <option value="OTHER">Other</option>
                                                    </select>
                                                </div>

                                                <div className="merchant-form-group">
                                                    <label className="merchant-form-label required-field">Tax Identification Number</label>
                                                    <input
                                                        type="text"
                                                        name="taxIdentificationNumber"
                                                        value={formData.taxIdentificationNumber}
                                                        onChange={handleInputChange}
                                                        className="merchant-form-input"
                                                        placeholder="Enter tax ID number"
                                                    />
                                                </div>

                                                {/* Performance Metrics Section */}
                                                <div className="merchant-form-group">
                                                    <label className="merchant-form-label required-field">Reliability Score</label>
                                                    <input
                                                        type="number"
                                                        name="reliabilityScore"
                                                        value={formData.reliabilityScore}
                                                        onChange={handleInputChange}
                                                        className="merchant-form-input"
                                                        placeholder="Enter score (0-5)"
                                                        min="0"
                                                        max="5"
                                                        step="0.1"
                                                    />
                                                </div>

                                                <div className="merchant-form-group">
                                                    <label className="merchant-form-label">Average Delivery Time (days)</label>
                                                    <input
                                                        type="number"
                                                        name="averageDeliveryTime"
                                                        value={formData.averageDeliveryTime}
                                                        onChange={handleInputChange}
                                                        className="merchant-form-input"
                                                        placeholder="Enter avg. delivery time"
                                                        min="0"
                                                        step="0.1"
                                                    />
                                                </div>



                                                {/* Item Categories Section */}
                                                <div className="merchant-form-group merchant-description-group">
                                                    <label className="merchant-form-label required-field">Item Categories</label>
                                                    <div className="merchant-form-category-selector">
                                                        <div className="merchant-form-category-input-group">
                                                            <select
                                                                value={selectedCategory}
                                                                onChange={handleCategorySelect}
                                                                className="merchant-form-select"
                                                            >
                                                                <option value="">Select a Category</option>
                                                                {itemCategories
                                                                    .filter(cat => !selectedItemCategories.includes(cat.id))
                                                                    .map(category => (
                                                                        <option key={category.id} value={category.id}>
                                                                            {category.name}
                                                                        </option>
                                                                    ))
                                                                }
                                                            </select>
                                                            <button
                                                                type="button"
                                                                onClick={handleAddCategory}
                                                                disabled={!selectedCategory}
                                                                className="merchant-form-category-add-button"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>

                                                        {/* Display selected categories */}
                                                        <div className="merchant-form-selected-categories">
                                                            {selectedItemCategories.length > 0 ? (
                                                                selectedItemCategories.map((categoryId) => (
                                                                    <div key={categoryId} className="merchant-form-selected-category">
                                                                        <span>{getCategoryName(categoryId)}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveCategory(categoryId)}
                                                                            className="merchant-form-category-remove-button"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="merchant-form-no-categories">No categories selected</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Notes Section */}
                                                <div className="merchant-form-group merchant-description-group">
                                                    <label className="merchant-form-label">Notes</label>
                                                    <textarea
                                                        name="notes"
                                                        value={formData.notes}
                                                        onChange={handleInputChange}
                                                        className="merchant-form-textarea"
                                                        placeholder="Enter notes about this merchant"
                                                        rows="3"
                                                    ></textarea>
                                                </div>
                                            </div>

                                            <div className="merchant-form-button-group">
                                                <button type="submit" className="merchant-form-add-button">
                                                    {modalMode === 'add' ? 'Add Merchant' : 'Update Merchant'}
                                                </button>
                                                <button type="button" className="merchant-form-cancel-button" onClick={handleCloseModals}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showNotification && (
                <div className="notification success-notification">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                    <span>Merchant successfully {showSuccessNotification}</span>
                </div>
            )}
        </div>
        </div>
    );
};

export default ProcurementMerchants;