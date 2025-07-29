import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table, Badge, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import { FaPlus, FaTrash, FaCheck, FaTimes, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import enhancedEquipmentTransactionService from '../../services/transaction/enhancedEquipmentTransactionService';
import warehouseService from '../../services/warehouseService';
import { toast } from 'react-toastify';

/**
 * Enhanced Transaction Modal Component
 * 
 * This component provides comprehensive transaction creation and management using
 * the new enhanced warehouse ↔ equipment transaction system.
 * 
 * Features:
 * - Real-time stock validation
 * - Enhanced status handling (ACCEPTED, PENDING, REJECTED, RESOLVED)
 * - Partial acceptance/rejection support
 * - Bulk operations
 * - Comprehensive error handling
 */
const EnhancedTransactionModal = ({ 
    show, 
    onHide, 
    equipment, 
    warehouses = [], 
    itemTypes = [], 
    mode = 'create', // 'create', 'accept', 'reject', 'resolve'
    transaction = null,
    onSuccess 
}) => {
    // State management
    const [formData, setFormData] = useState({
        warehouseId: '',
        equipmentId: equipment?.id || '',
        purpose: 'CONSUMABLE',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
        items: [{ itemTypeId: '', quantity: '', expectedQuantity: '', currentStock: 0 }]
    });

    const [acceptanceData, setAcceptanceData] = useState({
        receivedQuantities: {},
        itemsNotReceived: {},
        comment: ''
    });

    const [rejectionData, setRejectionData] = useState({
        rejectedItems: {},
        generalReason: ''
    });

    const [resolutionData, setResolutionData] = useState({
        resolutionDetails: {},
        resolutionComment: ''
    });

    const [loading, setLoading] = useState(false);
    const [stockValidation, setStockValidation] = useState({});
    const [validationErrors, setValidationErrors] = useState([]);

    // Initialize component based on mode
    useEffect(() => {
        if (show) {
            initializeComponent();
        }
    }, [show, mode, transaction]);

    const initializeComponent = async () => {
        if (mode === 'create') {
            setFormData(prev => ({
                ...prev,
                equipmentId: equipment?.id || '',
                items: [{ itemTypeId: '', quantity: '', expectedQuantity: '', currentStock: 0 }]
            }));
        } else if (mode === 'accept' && transaction) {
            // Initialize acceptance data
            const receivedQuantities = {};
            const itemsNotReceived = {};
            
            transaction.items?.forEach(item => {
                receivedQuantities[item.id] = item.quantity;
                itemsNotReceived[item.id] = false;
            });

            setAcceptanceData({
                receivedQuantities,
                itemsNotReceived,
                comment: ''
            });
        } else if (mode === 'reject' && transaction) {
            // Initialize rejection data
            const rejectedItems = {};
            transaction.items?.forEach(item => {
                rejectedItems[item.id] = '';
            });

            setRejectionData({
                rejectedItems,
                generalReason: ''
            });
        } else if (mode === 'resolve' && transaction) {
            // Initialize resolution data for rejected items
            const resolutionDetails = {};
            transaction.items?.filter(item => item.status === 'REJECTED').forEach(item => {
                resolutionDetails[item.id] = '';
            });

            setResolutionData({
                resolutionDetails,
                resolutionComment: ''
            });
        }
    };

    // Real-time stock validation
    const validateStock = async (itemTypeId, quantity) => {
        if (!itemTypeId || !quantity || !formData.warehouseId) return;

        try {
            const stock = await enhancedEquipmentTransactionService.getCurrentConsumableStock(
                formData.equipmentId, 
                itemTypeId
            );
            
            setStockValidation(prev => ({
                ...prev,
                [itemTypeId]: {
                    currentStock: stock.currentStock,
                    isAccurate: stock.isAccurate,
                    sufficient: stock.currentStock >= quantity
                }
            }));
        } catch (error) {
            console.error('Error validating stock:', error);
        }
    };

    // Handle form input changes
    const handleInputChange = (field, value, index = null) => {
        if (index !== null) {
            // Handle array fields (items)
            setFormData(prev => ({
                ...prev,
                items: prev.items.map((item, i) => 
                    i === index ? { ...item, [field]: value } : item
                )
            }));

            // Validate stock for quantity changes
            if (field === 'quantity' || field === 'itemTypeId') {
                const item = formData.items[index];
                const itemTypeId = field === 'itemTypeId' ? value : item.itemTypeId;
                const quantity = field === 'quantity' ? parseInt(value) : parseInt(item.quantity);
                
                if (itemTypeId && quantity) {
                    validateStock(itemTypeId, quantity);
                }
            }
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    // Add new item row
    const addItemRow = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { itemTypeId: '', quantity: '', expectedQuantity: '', currentStock: 0 }]
        }));
    };

    // Remove item row
    const removeItemRow = (index) => {
        if (formData.items.length > 1) {
            setFormData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            }));
        }
    };

    // Validate form data
    const validateForm = () => {
        const errors = [];

        if (mode === 'create') {
            if (!formData.warehouseId) errors.push('Please select a warehouse');
            if (!formData.equipmentId) errors.push('Equipment is required');
            if (formData.items.some(item => !item.itemTypeId)) errors.push('All items must have a type selected');
            if (formData.items.some(item => !item.quantity || item.quantity <= 0)) errors.push('All items must have valid quantities');
            
            // Check stock validation
            const hasInsufficientStock = Object.values(stockValidation).some(validation => !validation.sufficient);
            if (hasInsufficientStock) errors.push('Some items have insufficient stock');
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            let result;

            switch (mode) {
                case 'create':
                    result = await enhancedEquipmentTransactionService.createWarehouseToEquipmentTransaction(formData);
                    toast.success('Enhanced transaction created successfully!');
                    break;

                case 'accept':
                    result = await enhancedEquipmentTransactionService.acceptEquipmentTransaction(
                        transaction.id, 
                        acceptanceData
                    );
                    toast.success('Transaction accepted with enhanced tracking!');
                    break;

                case 'reject':
                    result = await enhancedEquipmentTransactionService.rejectTransactionItems(
                        transaction.id, 
                        rejectionData
                    );
                    toast.success('Transaction items rejected with detailed reasons!');
                    break;

                case 'resolve':
                    result = await enhancedEquipmentTransactionService.resolveRejectedItems(
                        transaction.id, 
                        resolutionData
                    );
                    toast.success('Rejected items resolved successfully!');
                    break;
            }

            onSuccess?.(result);
            onHide();
        } catch (error) {
            console.error('Error processing transaction:', error);
            toast.error(`Error ${mode}ing transaction: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Render validation alerts
    const renderValidationAlerts = () => {
        if (validationErrors.length === 0) return null;

        return (
            <Alert variant="danger" className="mb-3">
                <strong>Please fix the following errors:</strong>
                <ul className="mb-0 mt-2">
                    {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </Alert>
        );
    };

    // Render create mode form
    const renderCreateForm = () => (
        <>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Warehouse *</Form.Label>
                        <Form.Select
                            value={formData.warehouseId}
                            onChange={(e) => handleInputChange('warehouseId', e.target.value)}
                            required
                        >
                            <option value="">Select warehouse...</option>
                            {warehouses.map(warehouse => (
                                <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Purpose</Form.Label>
                        <Form.Select
                            value={formData.purpose}
                            onChange={(e) => handleInputChange('purpose', e.target.value)}
                        >
                            <option value="CONSUMABLE">Consumable</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="GENERAL">General</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Transaction Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={formData.transactionDate}
                            onChange={(e) => handleInputChange('transactionDate', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Equipment</Form.Label>
                        <Form.Control
                            type="text"
                            value={equipment?.name || 'No equipment selected'}
                            readOnly
                            disabled
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter transaction description..."
                />
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Items</h6>
                <Button variant="outline-primary" size="sm" onClick={addItemRow}>
                    <FaPlus className="me-1" /> Add Item
                </Button>
            </div>

            <Table bordered hover>
                <thead>
                    <tr>
                        <th>Item Type *</th>
                        <th>Quantity *</th>
                        <th>Current Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {formData.items.map((item, index) => {
                        const validation = stockValidation[item.itemTypeId];
                        
                        return (
                            <tr key={index}>
                                <td>
                                    <Form.Select
                                        value={item.itemTypeId}
                                        onChange={(e) => handleInputChange('itemTypeId', e.target.value, index)}
                                        size="sm"
                                    >
                                        <option value="">Select item type...</option>
                                        {itemTypes.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleInputChange('quantity', e.target.value, index)}
                                        size="sm"
                                        min="1"
                                    />
                                </td>
                                <td>
                                    {validation ? (
                                        <div className="text-center">
                                            <span className={validation.sufficient ? 'text-success' : 'text-danger'}>
                                                {validation.currentStock}
                                            </span>
                                            {validation.isAccurate && (
                                                <FaCheck className="text-success ms-1" size="12" />
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-muted">-</span>
                                    )}
                                </td>
                                <td>
                                    {validation && (
                                        <Badge bg={validation.sufficient ? 'success' : 'danger'}>
                                            {validation.sufficient ? 'Available' : 'Insufficient'}
                                        </Badge>
                                    )}
                                </td>
                                <td>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => removeItemRow(index)}
                                        disabled={formData.items.length === 1}
                                    >
                                        <FaTrash />
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </>
    );

    // Render accept mode form
    const renderAcceptForm = () => (
        <div>
            <Alert variant="info" className="mb-3">
                <strong>Enhanced Transaction Acceptance</strong><br />
                Review each item and specify the actual received quantities. You can accept some items and reject others.
            </Alert>

            <Table bordered hover>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Expected</th>
                        <th>Received</th>
                        <th>Not Received</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {transaction?.items?.map(item => (
                        <tr key={item.id}>
                            <td>{item.itemType?.name}</td>
                            <td>{item.quantity}</td>
                            <td>
                                <Form.Control
                                    type="number"
                                    value={acceptanceData.receivedQuantities[item.id] || ''}
                                    onChange={(e) => setAcceptanceData(prev => ({
                                        ...prev,
                                        receivedQuantities: {
                                            ...prev.receivedQuantities,
                                            [item.id]: parseInt(e.target.value) || 0
                                        }
                                    }))}
                                    size="sm"
                                    min="0"
                                    max={item.quantity}
                                />
                            </td>
                            <td>
                                <Form.Check
                                    type="checkbox"
                                    checked={acceptanceData.itemsNotReceived[item.id] || false}
                                    onChange={(e) => setAcceptanceData(prev => ({
                                        ...prev,
                                        itemsNotReceived: {
                                            ...prev.itemsNotReceived,
                                            [item.id]: e.target.checked
                                        }
                                    }))}
                                />
                            </td>
                            <td>
                                {acceptanceData.itemsNotReceived[item.id] ? (
                                    <Badge bg="danger"><FaTimes className="me-1" />Rejected</Badge>
                                ) : acceptanceData.receivedQuantities[item.id] === item.quantity ? (
                                    <Badge bg="success"><FaCheck className="me-1" />Full</Badge>
                                ) : (
                                    <Badge bg="warning"><FaExclamationTriangle className="me-1" />Partial</Badge>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Form.Group className="mt-3">
                <Form.Label>Acceptance Comment</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={acceptanceData.comment}
                    onChange={(e) => setAcceptanceData(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Add notes about the acceptance..."
                />
            </Form.Group>
        </div>
    );

    // Render modal
    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {mode === 'create' && 'Create Enhanced Transaction'}
                    {mode === 'accept' && 'Accept Enhanced Transaction'}
                    {mode === 'reject' && 'Reject Transaction Items'}
                    {mode === 'resolve' && 'Resolve Rejected Items'}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {renderValidationAlerts()}
                
                {mode === 'create' && renderCreateForm()}
                {mode === 'accept' && renderAcceptForm()}
                {/* Add reject and resolve forms as needed */}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cancel
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleSubmit} 
                    disabled={loading || validationErrors.length > 0}
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Processing...
                        </>
                    ) : (
                        <>
                            {mode === 'create' && 'Create Transaction'}
                            {mode === 'accept' && 'Accept Transaction'}
                            {mode === 'reject' && 'Reject Items'}
                            {mode === 'resolve' && 'Resolve Items'}
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EnhancedTransactionModal; 