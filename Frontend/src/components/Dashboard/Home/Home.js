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

const COLORS = ["#1e3a8a", "#f97316"];

const AnalyticsDashboard = () => {
const [stats, setStats] = useState({});
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchStats = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const ref = doc(
      db,
      "users",
      auth.currentUser.uid,
      "analytics",
      "jobStats"
    );

    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // 👇 important
      setStats({});
      setLoading(false);
      return;
    }

    const data = snap.data();
    setStats(data);
    setAppliedJobs(Object.values(data.appliedJobs || {}));
    setLoading(false);
  };

  fetchStats();
}, []);

if (loading) {
  return <p className="load">Loading analytics...</p>;
}

/* ---------- DATA PROCESSING ---------- */

// ✅ rebuild skillMatchFrequency from flat Firestore keys
const skillChartData = Object.entries(stats)
  .filter(([key, value]) =>
    key.startsWith("skillMatchFrequency.") &&
    typeof value === "number" &&
    value > 0
  )
  .map(([key, value]) => ({
    skill: key
      .replace("skillMatchFrequency.", "")
      .replace(/\./g, " ")
      .toUpperCase(),
    count: value
  }))
  .sort((a, b) => b.count - a.count);

// ✅ total skill frequency
const totalSkillFrequency = skillChartData.reduce(
  (sum, item) => sum + item.count,
  0
);

// ✅ pie chart
const pieData = [
  { name: "Applied", value: stats.applyClickCount || 0 },
  { name: "Viewed", value: stats.jobsShownCount || 0 }
];

  return (
    <div className="analytics-page">
      <h2>📊 Job Analytics Dashboard</h2>

      {/* ================= STATS ================= */}
      <div className="stats-grid">
        <StatCard icon={<FaBriefcase />} label="Jobs Applied" value={stats.applyClickCount || 0} />
        <StatCard icon={<FaEye />} label="Jobs Shown" value={stats.jobsShownCount || 0} />
        <StatCard icon={<FaBrain />} label="Resume Analyzed" value={stats.resumeAnalysisCount || 0} />
        <StatCard icon={<FaTools />} label="Skills Detected" value={stats.skillsCount || 0} />
        <StatCard icon={<FaKey />} label="Keywords Found" value={stats.keywordsCount || 0} />
        <StatCard icon={<FaKey />} label="Total Skill Matches" value={totalSkillFrequency} />
      </div>

      {/* ================= SKILL BAR CHART ================= */}
      <div className="chart-card">
        <h3>🧠 Skill Match Frequency</h3>

        {skillChartData.length === 0 ? (
          <p className="empty-chart">No skill matches detected yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillChartData}>
              <XAxis dataKey="skill" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ================= PIE CHART ================= */}
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

      {/* ================= APPLIED JOBS ================= */}
      <div className="chart-card full-width">
        <h3>📄 Applied Jobs</h3>

        <div className="table-wrapper">
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
              {appliedJobs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No jobs applied yet
                  </td>
                </tr>
              ) : (
                appliedJobs.map((job, i) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ================= STAT CARD ================= */
const StatCard = ({ icon, label, value }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <h4>{label}</h4>
    <p>{value}</p>
  </div>
);

export default AnalyticsDashboard;
