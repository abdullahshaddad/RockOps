import React from "react";
import { useNavigate } from "react-router-dom";
import { IoReturnUpBack } from "react-icons/io5";
import "./BackButton.scss";

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="BackButtonDiv" onClick={handleBack}>
        <IoReturnUpBack />
    </div>
  );
};

export default BackButton;
