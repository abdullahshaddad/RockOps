import React, { useState } from 'react';
import {
    FiPackage,
    FiEdit,
    FiInbox,
    FiClock,
    FiUser,
    FiCalendar,
    FiFileText,
    FiTag,
    FiFlag
} from 'react-icons/fi';
import Snackbar from '../../../../Components/Snackbar/Snackbar'; // Import your Snackbar component
import "../ProcurementOffers.scss"
import "./UnstartedOffers.scss"

const UnstartedOffers = ({ offers, activeOffer, setActiveOffer, handleOfferStatusChange }) => {
    // Snackbar state
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');

    // Start working on an offer (change from UNSTARTED to INPROGRESS)
    const startWorkingOnOffer = async (offer) => {
        try {
            await handleOfferStatusChange(offer.id, 'INPROGRESS');

            // Show success notification
            setNotificationMessage(`Offer "${offer.title}" is in progress`);
            setNotificationType('success');
            setShowNotification(true);
        } catch (error) {
            // Show error notification if something goes wrong
            setNotificationMessage('Failed to start working on offer. Please try again.');
            setNotificationType('error');
            setShowNotification(true);
        }
    };

    return (
        <div className="procurement-main-content">
            {/* Offers List */}
            <div className="procurement-list-section">
                <div className="procurement-list-header">
                    <h3>Unstarted Offers</h3>
                </div>

                {offers.length === 0 ? (
                    <div className="procurement-empty-state">
                        <FiInbox size={48} className="empty-icon" />
                        <p>No unstarted offers found.</p>
                    </div>
                ) : (
                    <div className="procurement-items-list">
                        {offers.map(offer => (
                            <div
                                key={offer.id}
                                className={`procurement-item-card ${activeOffer?.id === offer.id ? 'selected' : ''}`}
                                onClick={() => setActiveOffer(offer)}
                            >
                                <div className="procurement-item-header">
                                    <h4>{offer.title}</h4>
                                    <span className={`procurement-status-badge status-${offer.status.toLowerCase()}`}>
                                        {offer.status}
                                    </span>
                                </div>
                                <div className="procurement-item-footer">
                                    <span className="procurement-item-date">
                                        <FiClock /> {new Date(offer.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Offer Details Section */}
            <div className="procurement-details-section">
                {activeOffer ? (
                    <div className="procurement-details-content">
                        <div className="procurement-details-header">
                            <div>
                                <h3>{activeOffer.title}</h3>
                                <div className="procurement-header-meta">
                                    <span className={`procurement-status-badge status-${activeOffer.status.toLowerCase()}`}>
                                        {activeOffer.status}
                                    </span>
                                    <span className="procurement-meta-item">
                                        <FiClock /> Created: {new Date(activeOffer.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="procurement-details-actions">
                                <button
                                    className="procurement-button start-working"
                                    onClick={() => startWorkingOnOffer(activeOffer)}
                                >
                                    Start Working
                                </button>
                            </div>
                        </div>

                        {!activeOffer.requestOrder ? (
                            <div className="procurement-loading">
                                <div className="procurement-spinner"></div>
                                <p>Loading request order details...</p>
                            </div>
                        ) : (
                            /* Unstarted Offer Content with updated class names */
                            <div className="procurement-unstarted-offers-info">
                                <div className="procurement-request-summary-card">
                                    <h4>Request Order Details</h4>

                                    <div className="procurement-request-details-grid">
                                        <div className="request-detail-item">
                                            <div className="request-detail-icon">
                                                <FiUser size={18} />
                                            </div>
                                            <div className="request-detail-content">
                                                <span className="request-detail-label">Requester</span>
                                                <span className="request-detail-value">{activeOffer.requestOrder.requesterName || 'Unknown'}</span>
                                            </div>
                                        </div>

                                        <div className="request-detail-item">
                                            <div className="request-detail-icon">
                                                <FiCalendar size={18} />
                                            </div>
                                            <div className="request-detail-content">
                                                <span className="request-detail-label">Request Date</span>
                                                <span className="request-detail-value">{new Date(activeOffer.requestOrder.createdAt).toLocaleDateString()}</span>
                                            </div>

                                        </div>

                                        {activeOffer.requestOrder.description && (
                                            <div className="request-detail-item">
                                                <div className="request-detail-icon">
                                                    <FiFileText size={18} />
                                                </div>
                                                <div className="request-detail-content">
                                                    <span className="request-detail-label">Description</span>
                                                    <p className="request-detail-value description-text">
                                                        {activeOffer.requestOrder.description}
                                                    </p>
                                                </div>


                                            </div>
                                        )}
                                        <div className="request-detail-item">
                                            <div className="request-detail-icon">
                                                <FiCalendar size={18} />
                                            </div>
                                            <div className="request-detail-content">
                                                <span className="request-detail-label">Deadline</span>
                                                <span className="request-detail-value">{new Date(activeOffer.requestOrder.deadline).toLocaleDateString()}</span>
                                            </div>

                                        </div>




                                        {activeOffer.requestOrder.priority && (
                                            <div className="request-detail-item">
                                                <div className="request-detail-icon">
                                                    <FiFlag size={18} />
                                                </div>
                                                <div className="request-detail-content">
                                                    <span className="request-detail-label">Priority</span>
                                                    <span className={`request-detail-value request-priority ${activeOffer.requestOrder.priority.toLowerCase()}`}>
                                                        {activeOffer.requestOrder.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Show list of request items that will need procurement with updated class names */}
                                {activeOffer.requestOrder.requestItems && activeOffer.requestOrder.requestItems.length > 0 && (
                                    <div className="procurement-unstarted-offers-items-preview">
                                        <h4>Items That Will Need Procurement</h4>


                                        {/* Updated Item Cards with specific class names */}
                                        <div className="procurement-unstarted-offers-items-grid">
                                            {activeOffer.requestOrder.requestItems.map(item => (
                                                <div key={item.id} className="procurement-unstarted-offers-item-preview-card">
                                                    <div className="procurement-unstarted-offers-item-preview-header">
                                                        <div className="procurement-unstarted-offers-item-icon-container">
                                                            <FiPackage className="procurement-unstarted-offers-item-icon" size={20} />
                                                        </div>
                                                        <div className="procurement-unstarted-offers-item-title-container">
                                                            <div className="procurement-unstarted-offers-item-name">{item.itemType?.name || 'Unknown'}</div>
                                                            <div className="procurement-unstarted-offers-item-category">{item.itemType.category || 'Item'}</div>
                                                        </div>
                                                        <div className="procurement-unstarted-offers-item-badge">
                                                            {item.quantity} {item.itemType.measuringUnit || 'units'}
                                                        </div>
                                                    </div>

                                                    {item.comment && (
                                                        <div className="procurement-unstarted-offers-item-notes">
                                                            <div className="procurement-unstarted-offers-item-notes-label">Notes:</div>
                                                            <div className="procurement-unstarted-offers-item-notes-content">{item.comment}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="procurement-empty-state-container">
                        <div className="procurement-empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
                                <path d="M18 14v4" />
                                <path d="M15 18h6" />
                            </svg>

                            <h3>No Offers Selected</h3>

                            {offers.length > 0 ? (
                                <p>Select an offer from the list to view details</p>
                            ) : (
                                <p>Offers are created when a request order is accepted</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Snackbar Component */}
            <Snackbar
                type={notificationType}
                text={notificationMessage}
                isVisible={showNotification}
                onClose={() => setShowNotification(false)}
                duration={3000}
            />
        </div>
    );
};

export default UnstartedOffers;