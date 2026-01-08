import React, { useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import "./Pop.css";

const Pop = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <FaCheckCircle size={18} />,
    error: <FaTimesCircle size={18} />,
    info: <FaInfoCircle size={18} />
  };

  return (
    <div className={`pop-container ${type}`}>
    <span className="pop-message">{message}</span>
      <span className="pop-icon">{icons[type]}</span>
    </div>
  );
};

export default Pop;
