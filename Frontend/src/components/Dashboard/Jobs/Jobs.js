import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../Firebase";
import "./Jobs.css";

const Jobs = () => {
  const [resumeURL, setResumeURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchResume(user.uid);
      } else {
        setResumeURL(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchResume = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        setResumeURL(snap.data().resumeURL);
      }
    } catch (err) {
      console.error("Error fetching resume:", err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeResume = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch("http://localhost:5000/analyze-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeURL }),
      });

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Resume analysis failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <p>Loading resume...</p>;
  if (!resumeURL) return <p>No resume uploaded yet.</p>;

  const fileExtension = resumeURL.split(".").pop().toLowerCase();

  const renderFile = () => {
    if (fileExtension === "pdf") {
      return (
        <embed
          src={resumeURL}
          type="application/pdf"
          width="100%"
          height="500px"
          style={{ borderRadius: "8px" }}
          className="resume-box"
        />
      );
    }

    if (["jpg", "jpeg", "png"].includes(fileExtension)) {
      return (
        <img
          src={resumeURL}
          alt="Resume"
          style={{ width: "100%", borderRadius: "8px" }}
        />
      );
    }

    return (
      <p>
        Preview not available.{" "}
        <a href={resumeURL} target="_blank" rel="noreferrer">
          Download Resume
        </a>
      </p>
    );
  };

  return (
    <div className="jobs-container">
      <div className="resume-box">
        {renderFile()}
      </div>

      <button
        onClick={analyzeResume}
        disabled={analyzing}
        className="analyze-btn"
      >
        {analyzing ? "Analyzing..." : "Analyze Resume (AI)"}
      </button>

      {analysis && (
        <div className="analysis-box">
          <h3>Resume Analysis</h3>

          <div className="resumeData">
            <p><strong>Skills:</strong></p>
          <ul>
            {analysis.skills?.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
          </div>

          <div className="resumeData">
            <p><strong>locations:</strong></p>
          <ul>
            {analysis.location?.map((locations, i) => (
              <li key={i}>{locations}</li>
            ))}
          </ul>
          </div>

          <div className="resumeData">
  <p><strong>Experience:</strong></p>
  <ul>
    {analysis.experience && analysis.experience.length > 0 ? (
      analysis.experience.map((exp, i) => <li key={i}>{exp}</li>)
    ) : (
      <li>Fresher</li>
    )}
  </ul>
</div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
