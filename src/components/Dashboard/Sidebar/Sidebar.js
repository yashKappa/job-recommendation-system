import React, { useState, useEffect } from "react";
import { auth } from "../../Firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaBriefcase,
  FaCheckCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";

import Profile from "../Profile/Porfile";
import Home from "../Home/Home";
import Jobs from "../Jobs/Jobs";
import Saved from "../Saved/Saved";

const Sidebar = () => {
  const navigate = useNavigate();

  // ✅ sessionStorage = survives refresh, dies on tab close
  const [activePage, setActivePage] = useState(() => {
    return sessionStorage.getItem("activePage") || "home";
  });

  // ✅ Persist per tab session
  useEffect(() => {
    sessionStorage.setItem("activePage", activePage);
  }, [activePage]);

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem("activePage");
    navigate("/login");
  };

  const renderComponent = () => {
    switch (activePage) {
      case "profile":
        return <Profile />;
      case "jobs":
        return <Jobs />;
      case "applied":
        return <Saved />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="layout">
      <aside className="side-sidebar">
        <div className="side-menu">
          <span>
            <img
              src={`${process.env.PUBLIC_URL}/assets/logo1.png`}
              alt="logo"
            />
          </span>

          <button
            className={`side-item ${activePage === "home" ? "active" : ""}`}
            onClick={() => setActivePage("home")}
          >
            <FaHome />
            <span>Home</span>
          </button>

          <button
            className={`side-item ${activePage === "profile" ? "active" : ""}`}
            onClick={() => setActivePage("profile")}
          >
            <FaUser />
            <span>Profile</span>
          </button>

          <button
            className={`side-item ${activePage === "jobs" ? "active" : ""}`}
            onClick={() => setActivePage("jobs")}
          >
            <FaBriefcase />
            <span>Jobs</span>
          </button>

          <button
            className={`side-item ${activePage === "applied" ? "active" : ""}`}
            onClick={() => setActivePage("applied")}
          >
            <FaCheckCircle />
            <span>Applied</span>
          </button>
        </div>

        <button className="side-item side-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </aside>

      <main className="job">{renderComponent()}</main>
    </div>
  );
};

export default Sidebar;
