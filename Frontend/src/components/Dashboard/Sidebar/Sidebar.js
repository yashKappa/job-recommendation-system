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

  const [activePage, setActivePage] = useState(() => {
    return sessionStorage.getItem("activePage") || "home";
  });

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
      {/* ===== MOBILE TOP NAV ===== */}
      <header className="mobile-topbar">
        <img
          src={`${process.env.PUBLIC_URL}/assets/Logo.png`}
          alt="logo"
        />
        <button onClick={handleLogout}>
          <FaSignOutAlt />
        </button>
      </header>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="side-sidebar">
        <div className="side-menu">
          <img
            src={`${process.env.PUBLIC_URL}/assets/Logo1.png`}
            alt="logo"
          />

          <SidebarButton icon={<FaHome />} label="Home" page="home" activePage={activePage} setActivePage={setActivePage} />
          <SidebarButton icon={<FaUser />} label="Profile" page="profile" activePage={activePage} setActivePage={setActivePage} />
          <SidebarButton icon={<FaBriefcase />} label="Jobs" page="jobs" activePage={activePage} setActivePage={setActivePage} />
          <SidebarButton icon={<FaCheckCircle />} label="Applied" page="applied" activePage={activePage} setActivePage={setActivePage} />
        </div>

        <button className="side-item side-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="job">{renderComponent()}</main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="mobile-bottom-nav">
        <BottomNavButton icon={<FaHome />} page="home" activePage={activePage} setActivePage={setActivePage} />
        <BottomNavButton icon={<FaUser />} page="profile" activePage={activePage} setActivePage={setActivePage} />
        <BottomNavButton icon={<FaBriefcase />} page="jobs" activePage={activePage} setActivePage={setActivePage} />
        <BottomNavButton icon={<FaCheckCircle />} page="applied" activePage={activePage} setActivePage={setActivePage} />
      </nav>
    </div>
  );
};

const SidebarButton = ({ icon, label, page, activePage, setActivePage }) => (
  <button
    className={`side-item ${activePage === page ? "active" : ""}`}
    onClick={() => setActivePage(page)}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const BottomNavButton = ({ icon, page, activePage, setActivePage }) => (
  <button
    className={`bottom-item ${activePage === page ? "active" : ""}`}
    onClick={() => setActivePage(page)}
  >
    {icon}
  </button>
);

export default Sidebar;
