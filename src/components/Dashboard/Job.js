import React from "react";
import { auth } from "../Firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";

const Job = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // redirect after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Sidebar />
    </div>
  );
};

export default Job;
