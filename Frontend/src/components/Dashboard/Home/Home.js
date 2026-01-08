import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../Firebase";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  FaBriefcase, FaEye, FaBrain, FaTools, FaKey
} from "react-icons/fa";
import "./Home.css";

const COLORS = ["#1e3a8a", "#f97316", "#22c55e", "#ef4444"];

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!auth.currentUser) return;

      const ref = doc(
        db,
        "users",
        auth.currentUser.uid,
        "analytics",
        "jobStats"
      );

      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data();
      setStats(data);

      // Map → Array
      const jobsArray = Object.values(data.appliedJobs || {});
      setAppliedJobs(jobsArray);
    };

    fetchStats();
  }, []);

  if (!stats) return <p>Loading analytics...</p>;

  /* ---------- DATA PROCESSING ---------- */

  const skillChartData = Object.entries(
    stats.skillMatchFrequency || {}
  ).map(([skill, count]) => ({
    skill,
    count
  }));

  const totalSkillFrequency = Object.values(
    stats.skillMatchFrequency || {}
  ).reduce((sum, count) => sum + count, 0);

  const pieData = [
    { name: "Applied", value: stats.applyClickCount || 0 },
    { name: "Viewed", value: stats.jobsShownCount || 0 },
  ];

  return (
    <div className="analytics-page">
      <h2>📊 Job Analytics Dashboard</h2>

      {/* ===== TOP STATS ===== */}
      <div className="stats-grid">
        <StatCard icon={<FaBriefcase />} label="Jobs Applied" value={stats.applyClickCount} />
        <StatCard icon={<FaEye />} label="Jobs Shown" value={stats.jobsShownCount} />
        <StatCard icon={<FaBrain />} label="Resume Analyzed" value={stats.resumeAnalysisCount} />
        <StatCard icon={<FaTools />} label="Skills Detected" value={stats.skillsCount} />
        <StatCard icon={<FaKey />} label="Keywords Found" value={stats.keywordsCount} />
        <StatCard icon={<FaKey />} label="Total Skill Matches" value={totalSkillFrequency} />
      </div>

      {/* ===== SKILL MATCH BAR CHART ===== */}
      <div className="chart-card">
        <h3>🧠 Skill Match Frequency</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={skillChartData}>
            <XAxis dataKey="skill" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ===== APPLY VS VIEW PIE ===== */}
      <div className="chart-card">
        <h3>🎯 Apply vs Viewed Jobs</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={90} label>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ===== APPLIED JOBS TABLE ===== */}
      <div className="chart-card full-width">
        <h3>📄 Applied Jobs</h3>
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Company</th>
              <th>Applied At</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {appliedJobs.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No jobs applied yet
                </td>
              </tr>
            )}
            {appliedJobs.map((job, i) => (
              <tr key={i}>
                <td>{job.title}</td>
                <td>{job.company}</td>
                <td>{job.clickedAt?.toDate().toLocaleString()}</td>
                <td>
                  <a href={job.link} target="_blank" rel="noreferrer">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------- STAT CARD ---------- */
const StatCard = ({ icon, label, value }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <h4>{label}</h4>
    <p>{value}</p>
  </div>
);

export default AnalyticsDashboard;
