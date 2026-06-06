
import React, { useEffect, useState } from "react";
import { doc, setDoc, increment, Timestamp, getDocs, collection } from "firebase/firestore";
import { auth, db } from "../../Firebase";
import "./Jobs.css"
import Pop from "../../Pop";

const JobResults = ({ jobs, analysis }) => {
  const [popup, setPopup] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  /* ------------------ LOAD SAVED JOBS ------------------ */
  useEffect(() => {
    if (!auth.currentUser) return;

    const loadSavedJobs = async () => {
      const snap = await getDocs(
        collection(db, "users", auth.currentUser.uid, "savedJobs")
      );

      const ids = new Set(snap.docs.map(doc => doc.id));
      setSavedJobIds(ids);
    };

    loadSavedJobs();
  }, []);

  /* ------------------ APPLY CLICK ------------------ */
  const trackApplyClick = async (job) => {
    if (!auth.currentUser) return;

    await setDoc(
      doc(db, "users", auth.currentUser.uid, "analytics", "jobStats"),
      {
        applyClickCount: increment(1),
        appliedJobs: {
          [job.apply_link]: {
            title: job.title,
            company: job.company,
            link: job.apply_link,
            clickedAt: Timestamp.now()
          }
        }
      },
      { merge: true }
    );
  };

  /* ------------------ SAVE JOB ------------------ */
  const saveJob = async (job) => {
    if (!auth.currentUser) return;

    const jobId = btoa(job.apply_link).replace(/[/+=]/g, "");

    if (savedJobIds.has(jobId)) return;

    try {
      await setDoc(
  doc(db, "users", auth.currentUser.uid, "savedJobs", jobId),
  {
    ...job,
    detected_role: analysis?.role || "",
    savedAt: Timestamp.now()
  }
);

      setSavedJobIds(prev => new Set(prev).add(jobId));
      setPopup({ message: "Job saved successfully", type: "success" });

      setTimeout(() => setPopup(null), 2500);
    } catch (err) {
      console.error(err);
      setPopup({ message: "Failed to save job", type: "error" });
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="Matching-Job">
      {popup && (
        <Pop
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup(null)}
        />
      )}

      {!analysis && (
        <div className="empty-jobs">
          <img src={`${process.env.PUBLIC_URL}/assets/jobCard.svg`} alt="Jobs" />
          <p>Analyze your resume to see matching jobs</p>
        </div>
      )}

      {analysis && jobs.length > 0 && (
        <div className="jobs-box">
          <h3>Jobs Matching Your Skills ({jobs.length})</h3>

          <div className="job-results">
            {jobs.map((job, i) => {
              const jobId = btoa(job.apply_link).replace(/[/+=]/g, "");
              const isSaved = savedJobIds.has(jobId);

              return (
                <div key={i} className="job-card">
                  <div className="card-data">
                    <h4>{job.title}</h4>
                    <p><strong>Company:</strong> {job.company}</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Salary:</strong> {job.salary || "N/A"}</p>
                    <p><strong>Match Score:</strong> {job.score}</p>
                    <p><strong>Match %: </strong>{job.match_percentage}%</p>
{/* <p>
  Matched Skills:
  {job.matched_skills?.length
    ? job.matched_skills.join(", ")
    : " None"}
</p> */}
                      <p>
    <strong>Detected Role:</strong>{" "}
    {analysis.role || "Software Engineer"}
  </p>
  <p>
  <strong>Matched Skills:</strong>{" "}
  {job.matched_skills?.join(", ") || "None"}
</p>

<p>
  <strong>AI Similarity:</strong>
  {job.semantic_score}%
</p>

                  </div>

                  <div className="job-actions">
                    <a
                      href={job.apply_link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackApplyClick(job)}
                    >
                      Apply now ↗
                    </a>

                    {!isSaved ? (
    <button
      className="save-btn"
      onClick={() => saveJob(job)}
    >
      Save
    </button>
  ) : (
    <button className="save-btn save">
      Saved ✓
    </button>
  )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {analysis && jobs.length === 0 && (
        <div className="empty-jobs">
          <img src={`${process.env.PUBLIC_URL}/assets/NoData.svg`} alt="No Jobs" />
          <p>No matching jobs found for this resume.</p>
        </div>
      )}
    </div>
  );
};

export default JobResults;

