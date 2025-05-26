import React, { Fragment, useEffect, useState } from "react";
// import "../../formStyle.scss";
import { NavLink, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { IoDocumentOutline, IoArrowBackOutline } from "react-icons/io5";
import { BsPrinter } from "react-icons/bs";
import { equipmentService } from "../../../services/equipmentService.js";


const ViewEquipmentData = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [equipmentData, setEquipmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEquipmentData = async () => {
            try {
                console.log("Fetching equipment with ID:", params.EquipmentID);
                const response = await equipmentService.getEquipmentById(params.EquipmentID);
                console.log("Fetched Equipment Data:", response.data);
                setEquipmentData(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching equipment data:", error);
                setError(error.response?.data?.message || error.message);
                setLoading(false);
            }
        };

        fetchEquipmentData();
    }, [params.EquipmentID]);

    const handleGoBack = () => {
        navigate(-1); // Navigate back to the previous page
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!equipmentData) return <p>No equipment data found</p>;

    // Use the data directly from the response
    const equipment = equipmentData;

    const categorizedData = [
        {
            title: "General Information",
            inputs: [
                { label: "Equipment ID", type: "text", name: "equipmentID", value: equipment.id || "N/A" },
                { label: "Equipment Name", type: "text", name: "equipmentName", value: equipment.name || "N/A" },
                { label: "Model", type: "text", name: "model", value: equipment.model || "N/A" },
                { label: "Model Number", type: "text", name: "modelNumber", value: equipment.modelNumber || "N/A" },
                { label: "Equipment Type", type: "text", name: "equipmentType", value: equipment.typeName || "N/A" },
                { label: "Equipment Brand", type: "text", name: "equipmentBrand", value: equipment.brandName || "N/A" },
            ],
        },
        {
            title: "Operational Information",
            inputs: [
                { label: "Worked Hours", type: "text", name: "workedHours", value: equipment.workedHours || "N/A" },
                { label: "Status", type: "text", name: "status", value: equipment.status || "N/A" },
                {
                    label: "Main Driver",
                    type: "text",
                    name: "mainDriver",
                    value: equipment.mainDriverName || "N/A",
                },
                {
                    label: "Sub Driver",
                    type: "text",
                    name: "subDriver",
                    value: equipment.subDriverName || "N/A",
                },
            ],
        },
        {
            title: "Ownership & Delivery",
            inputs: [
                {
                    label: "Site",
                    type: "text",
                    name: "site",
                    value: equipment.siteName || "N/A",
                },
                { label: "Manufacture Year", type: "text", name: "manufactureYear", value: equipment.manufactureYear || "N/A" },
                { label: "Purchase Date", type: "text", name: "purchaseDate", value: equipment.purchasedDate || "N/A" },
                { label: "Delivered Date", type: "text", name: "deliveredDate", value: equipment.deliveredDate || "N/A" },
                { label: "Purchased From", type: "text", name: "purchasedFrom", value: equipment.purchasedFromName || "N/A" },
                { label: "Examined By", type: "text", name: "examinedBy", value: equipment.examinedBy || "N/A" },
            ],
        },
        {
            title: "Financial Information",
            inputs: [
                { label: "Dollar Price", type: "text", name: "dollarPrice", value: equipment.dollarPrice ? `$${equipment.dollarPrice.toLocaleString()}` : "N/A" },
                { label: "EGP Price", type: "text", name: "egpPrice", value: equipment.egpPrice ? `EGP ${equipment.egpPrice.toLocaleString()}` : "N/A" },
            ],
        },
        {
            title: "Additional Information",
            inputs: [
                {
                    label: "Equipment Complaints",
                    type: "text",
                    name: "equipmentComplains",
                    value: equipment.equipmentComplaints || "N/A",
                },
                { label: "Country Of Origin", type: "text", name: "countryOfOrigin", value: equipment.countryOfOrigin || "N/A" },
                { label: "Serial Number", type: "text", name: "serialNumber", value: equipment.serialNumber || "N/A" },
                { label: "Shipping Status", type: "text", name: "shippingStatus", value: equipment.shipping || "N/A" },
                { label: "Customs Status", type: "text", name: "customsStatus", value: equipment.customs || "N/A" },
            ],
        },
    ];

    const LabelInputComponent = ({ label, type, name, value }) => (
        <div className="input-container">
            <input className="input-field" type={type} name={name} value={value} readOnly />
            <label className="input-label" htmlFor={name}>{label}</label>
        </div>
    );

    const handlePrint = () => {
        const printContent = document.getElementById("print-section");
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = printContent.innerHTML;
        window.print();

        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    return (
        <Fragment>
            <div id="print-section" className="DetailsContainer">
                <div className="InformationHeaderSection">
                    <div className="HeaderLefttSide">
                        {/*<BackButton />*/}
                    </div>
                    <h1>Equipment Information</h1>
                    <div className="actionButtons">
                        <NavLink
                            to={`/RelatedDocuments/equipment/${params.EquipmentID}`}
                            className={({ isActive }) => isActive ? "active" : ""}>
                            <IoDocumentOutline />
                        </NavLink>
                        <button onClick={handlePrint}>
                            <BsPrinter />
                        </button>
                    </div>
                </div>
                <div className="DetailsImage">
                    <img
                        src={equipment.imageUrl}
                        alt="Equipment Profile"
                        onError={(e) => { e.target.src = Excavator1; }} // Fallback if image fails
                    />
                </div>
                <div className="DetailsInputs">
                    <div className="categoryContainer">
                        {categorizedData.map((category, index) => (
                            <div key={index} className="categorySection">
                                <h2>{category.title}</h2>
                                <div className="categoryInputs">
                                    {category.inputs.map((input, idx) => (
                                        <LabelInputComponent
                                            key={idx}
                                            label={input.label}
                                            type={input.type}
                                            name={input.name}
                                            value={input.value}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default ViewEquipmentData;