import React from 'react';

const DocumentsTab = ({ employee }) => {
    return (
        <div className="documents-info tab-panel">
            <h3>Employee Documents</h3>

            <div className="documents-grid">
                <div className="document-card">
                    <div className="document-thumbnail">
                        <img src={employee.idFrontImage || 'https://via.placeholder.com/150?text=No+Image'} alt="ID Card Front" />
                    </div>
                    <div className="document-info">
                        <h4>ID Card - Front</h4>
                        {employee.idFrontImage ? (
                            <a href={employee.idFrontImage} target="_blank" rel="noopener noreferrer" className="view-document">
                                View Full Size
                            </a>
                        ) : (
                            <p className="no-document">Not uploaded</p>
                        )}
                    </div>
                </div>

                <div className="document-card">
                    <div className="document-thumbnail">
                        <img src={employee.idBackImage || 'https://via.placeholder.com/150?text=No+Image'} alt="ID Card Back" />
                    </div>
                    <div className="document-info">
                        <h4>ID Card - Back</h4>
                        {employee.idBackImage ? (
                            <a href={employee.idBackImage} target="_blank" rel="noopener noreferrer" className="view-document">
                                View Full Size
                            </a>
                        ) : (
                            <p className="no-document">Not uploaded</p>
                        )}
                    </div>
                </div>

                {/* Additional document placeholders */}
                <div className="document-card">
                    <div className="document-thumbnail document-placeholder">
                        <span className="document-icon">📄</span>
                    </div>
                    <div className="document-info">
                        <h4>License</h4>
                        <p className="no-document">{employee.license || 'Not uploaded'}</p>
                        <button className="upload-document">Upload</button>
                    </div>
                </div>

                <div className="document-card">
                    <div className="document-thumbnail document-placeholder">
                        <span className="document-icon">📄</span>
                    </div>
                    <div className="document-info">
                        <h4>Resume / CV</h4>
                        <p className="no-document">Not uploaded</p>
                        <button className="upload-document">Upload</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentsTab;