import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../Firebase";

const Saved = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setSavedJobs([]);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDocs(
          collection(db, "users", user.uid, "savedJobs")
        );

        const jobs = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSavedJobs(jobs);
      } catch (err) {
        console.error("Failed to load saved jobs:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const removeSavedJob = async (jobId) => {
    if (!auth.currentUser) return;

    await deleteDoc(
      doc(db, "users", auth.currentUser.uid, "savedJobs", jobId)
    );

    setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  /* ------------------ UI ------------------ */
  if (loading) return <p className="load">Loading saved jobs...</p>;

  return (
    <div className="SavedContent">
      <h2>Saved Jobs</h2>

      {savedJobs.length === 0 ? (
        <div className="empty-jobs">
          <img
            src={`${process.env.PUBLIC_URL}/assets/NoData.svg`}
            alt="No saved jobs"
          />
          <p>No saved jobs yet.</p>
        </div>
      ) : (
        <div className="jobs-box">
          <div className="job-results">
            {savedJobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="card-data">
                  <h4>{job.title}</h4>
                  <p><strong>Company:</strong> {job.company}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Match Score:</strong> {job.score}</p>
                </div>

                <div className="job-actions">
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noreferrer"
                    className="apply-btn"
                  >
                    Apply Now ↗
                  </a>

                  <button
                    className="save-btn"
                    onClick={() => removeSavedJob(job.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Saved;
