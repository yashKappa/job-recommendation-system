
import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../Firebase";
import JobResults from "./jobService";
import "./Jobs.css";

const buildSkillFrequency = (skills, jobs) => {
  const freq = {};

  skills.forEach(skill => {
    freq[skill] = 0;

    jobs.forEach(job => {
      const description = job.description?.toLowerCase() || "";
      const jobSkills = (job.matched_skills || []).map(s => s.toLowerCase());

      // ✅ Match ONLY if skill is actually required
      if (
        description.includes(skill.toLowerCase()) ||
        jobSkills.includes(skill.toLowerCase())
      ) {
        freq[skill]++;
      }
    });
  });

  return freq;
};


const Jobs = () => {
  const [resumeURL, setResumeURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [jobs, setJobs] = useState([]);

  /* ------------------ LOAD LOCAL DATA ------------------ */
  useEffect(() => {
    const a = localStorage.getItem("resumeAnalysis");
    const j = localStorage.getItem("recommendedJobs");

    if (a) setAnalysis(JSON.parse(a));
    if (j) setJobs(JSON.parse(j));
  }, []);

  /* ------------------ AUTH ------------------ */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setResumeURL(null);
        setLoading(false);

        // clear only your keys
        localStorage.removeItem("resumeAnalysis");
        localStorage.removeItem("recommendedJobs");

        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setResumeURL(snap.data().resumeURL || null);
        }
      } catch (err) {
        console.error("Resume fetch error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ------------------ ANALYZE RESUME ------------------ */
  const analyzeResume = async () => {
    if (!resumeURL || !auth.currentUser) return;

    setAnalyzing(true);
    setAnalysis(null);
    setJobs([]);

    // clear only analysis data
    localStorage.removeItem("resumeAnalysis");
    localStorage.removeItem("recommendedJobs");

    try {
      const res = await fetch("http://127.0.0.1:10000/analyze-and-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeURL }),
      });

      const data = await res.json();

      const skillFrequency = buildSkillFrequency(
  data.analysis.skills || [],
  data.jobs.jobs || []
);

const skillFrequencyUpdates = {};
Object.entries(skillFrequency).forEach(([skill, count]) => {
  skillFrequencyUpdates[`skillMatchFrequency.${skill}`] = increment(count);
});


      setAnalysis(data.analysis);
      setJobs(data.jobs.jobs || []);

      localStorage.setItem("resumeAnalysis", JSON.stringify(data.analysis));
      localStorage.setItem("recommendedJobs", JSON.stringify(data.jobs.jobs));

      await setDoc(
  doc(db, "users", auth.currentUser.uid, "analytics", "jobStats"),
  {
    resumeAnalysisCount: increment(1),
    jobsShownCount: data.jobs.length,
    keywordsCount: data.analysis.keywords?.length || 0,
    skillsCount: data.analysis.skills?.length || 0,
    lastAnalyzedAt: serverTimestamp(),
    ...skillFrequencyUpdates
  },
  { merge: true }
);

    } catch (err) {
      console.error("Analyze error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  /* ------------------ UI ------------------ */
  if (loading) return <p className="load">Loading...</p>;
  if (!resumeURL) return <p className="load">No resume uploaded.</p>;

  return (
    <div className="jobContent">

      <JobResults jobs={jobs} analysis={analysis} />

      <div className="jobs-container">
        <button
          onClick={analyzeResume}
          disabled={analyzing}
          className="analyze-btn"
        >
          {analyzing ? "Analyzing..." : "Analyze Resume (AI)"}
        </button>

        {analyzing && (
          <span className="Analyzing">
            <img
              src="https://ielts24x7.com/public/images/loading-gif-orange-5.gif"
              alt="loading"
            />
          </span>
        )}

        {analysis ? (
          <div className="analysis-box">
            <h3>Resume Analysis</h3>

            <div className="resumeData">
              <p><strong>Skills:</strong></p>
              <ul>
                {analysis.skills?.length
                  ? analysis.skills.map((s, i) => <li key={i}>{s}</li>)
                  : <li>No skills detected</li>}
              </ul>
            </div>

            <div className="resumeData">
              <p><strong>Locations:</strong></p>
              <ul>
                {analysis.location?.length
                  ? analysis.location.map((l, i) => <li key={i}>{l}</li>)
                  : <li>No location detected</li>}
              </ul>
            </div>

            <div className="resumeData">
              <p><strong>Experience:</strong></p>
              <ul>
                {analysis.experience?.length
                  ? analysis.experience.map((e, i) => <li key={i}>{e}</li>)
                  : <li>Fresher</li>}
              </ul>
            </div>

            <div className="resumeData">
              <p><strong>Email:</strong> {analysis.email || "Not found"}</p>
            </div>

            <div className="resumeData">
              <p><strong>Keywords:</strong></p>
              <ul>
                {analysis.keywords?.length
                  ? analysis.keywords.map((k, i) => <li key={i}>{k}</li>)
                  : <li>No keywords detected</li>}
              </ul>
            </div>
          </div>
        ) : (
          <div className="empty-analysis">
            <img src={`${process.env.PUBLIC_URL}/assets/analysis.svg`} alt="Analyze" />
            <p>
              Click <strong>Analyze Resume</strong> to get job recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;

