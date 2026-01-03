import React from "react";
import { auth } from "../../Firebase";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaUser,FaBriefcase, FaCheckCircle, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";
import Profile from "../Profile/Porfile";

const Sidebar = () => {
  const navigate = useNavigate();

const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // redirect after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div>
          <aside className="side-sidebar">
      <div className="side-menu">
        <span>
            <img src={`${process.env.PUBLIC_URL}/assets/logo1.png`} alt="rocket" />
        </span>
        <Link to="/home" className="side-item">
          <FaHome />
          <span>Home</span>
        </Link>

        <Link to="/profile" className="side-item">
          <FaUser />
          <span>Profile</span>
        </Link>

        <Link to="/jobs" className="side-item">
          <FaBriefcase />
          <span>Jobs</span>
        </Link>

        <Link to="/applied" className="side-item">
          <FaCheckCircle />
          <span>Applied</span>
        </Link>

      </div>

      <button className="side-item side-logout" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </aside>
    <div className="job">
            <Profile />
    </div>
    </div>
  );
};

export default Sidebar;
