import React from "react";
import { auth } from "../../Firebase";
import { signOut } from "firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaBriefcase,
  FaCheckCircle,
  FaComments,
  FaCompass,
  FaBox,
  FaSignOutAlt
} from "react-icons/fa";
import "./Sidebar.css";

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
    <aside className="wf-sidebar">
      {/* Top menu */}
      <div className="wf-menu">
        <NavLink to="/home" className="wf-item">
          <FaHome />
          <span>Home</span>
        </NavLink>

        <NavLink to="/profile" className="wf-item">
          <FaUser />
          <span>Profile</span>
        </NavLink>

        <NavLink to="/jobs" className="wf-item">
          <FaBriefcase />
          <span>Jobs</span>
        </NavLink>

        <NavLink to="/applied" className="wf-item">
          <FaCheckCircle />
          <span>Applied</span>
        </NavLink>

        <NavLink to="/messages" className="wf-item">
          <FaComments />
          <span>Messages</span>
        </NavLink>

        <NavLink to="/discover" className="wf-item">
          <FaCompass />
          <span>Discover</span>
        </NavLink>

        <NavLink to="/on-demand" className="wf-item">
          <FaBox />
          <span>On-Demand</span>
        </NavLink>
      </div>

      {/* Bottom logout */}
      <button className="wf-item wf-logout" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
