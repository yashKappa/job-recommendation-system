import React, { useState } from "react";
import "./Profile.css";
import { auth, db } from "../Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const CreateProfile = () => {
  const [step, setStep] = useState(1);
  const [experienceType, setExperienceType] = useState("experienced");
  const [summary, setSummary] = useState("");
  const [resume, setResume] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [jobPreferences, setJobPreferences] = useState({
    role: "",
    workMode: "",
    shift: "",
    noticePeriod: "",
    interviewAvailability: ""
  });
  const [softSkills, setSoftSkills] = useState({
    communication: false,
    teamwork: false,
    leadership: false,
    problemSolving: false
  });


  const [education, setEducation] = useState({
    degree: "",
    college: "",
    year: ""
  });
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    linkedin: "",
    portfolio: "",
    kaggle: ""
  });

  const [locationFlexibility, setLocationFlexibility] = useState({
    relocate: "",
    preferredLocations: ""
  });

const [fullName, setFullName] = useState("");
const [email, setEmail] = useState("");
const [skills, setSkills] = useState("");


  const navigate = useNavigate();

const handleSubmit = async () => {
  try {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // 1️⃣ Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // 2️⃣ Supabase Resume Upload
    let resumeURL = "";
    if (resume) {
      const sanitizedFileName = resume.name.replace(/\s/g, "_");
      const filePath = `${userId}/${Date.now()}_${sanitizedFileName}`;

      const { error: uploadError } = await supabase.storage.from("resume").upload(filePath, resume);
      if (uploadError) throw uploadError;

      const { data: publicData, error: publicError } = supabase.storage.from("resume").getPublicUrl(filePath);
      if (publicError) throw publicError;

      resumeURL = publicData.publicUrl;
    }

    // 3️⃣ Firestore Save
    await setDoc(doc(db, "users", userId), {
      basicDetails: { fullName, email, skills },
      education,
      jobPreferences,
      locationFlexibility,
      experience: { type: experienceType },
      socialLinks,
      summary,
      softSkills,
      resumeURL,
      createdAt: serverTimestamp(),
    });

    navigate("/login");

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};


  return (
    <div className="profile-container">
      <div className="profile-content">

        <div className="data">
          <div className="img">
            <img src={`${process.env.PUBLIC_URL}/assets/startup.png`} alt="rocket" />
            <p className="motivation-text">
              Take the first step towards your next career opportunity.<br />
              Let AI match your skills with the right opportunities <br />
              <br />
            </p>
          </div>
        </div>

        <div className="profile-card slide">
          <div className="progress-container">
            <div className="progress-text">
              Step {step} of 6
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
          <div className="logo">
            <img src={`${process.env.PUBLIC_URL}/assets/Logo.png`} alt="logo" />
          </div>
          {step === 1 && (
            <>
              <h2>Basic Details</h2>

              <div className="row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Working Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} />
               </div>
              </div>

              <div className="row">
                <div className="form-group password-field">
                  <label>Password</label>
                  <div className="password-input">
                    <input
                      type="password"
                      placeholder="Create password"
                      value={password}
                      maxLength={8}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <small className="hint">Maximum 8 characters allowed</small>
                </div>

                <div className="form-group password-field">
                  <label>Confirm Password</label>
                  <div className="password-input">
                    <input
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      maxLength={8}
                      onChange={(e) => {
                        const value = e.target.value;
                        setConfirmPassword(value);

                        if (password && value !== password) {
                          setPasswordError("Passwords do not match");
                        } else {
                          setPasswordError("");
                        }
                      }}
                    />
                  </div>

                  {passwordError && (
                    <small className="error-text">{passwordError}</small>
                  )}
                </div>

              </div>

              <div className="row">
                <div className="form-group">
                  <label>Skills</label>
                  <input value={skills} placeholder="React.js, Firebase,..." onChange={e => setSkills(e.target.value)} />
                </div>
              </div>

              <button className="next-btn" onClick={() => setStep(2)}>
                Next →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Education</h2>

              <div className="row">
                <div className="form-group">
                  <label>Highest Qualification</label>
                  <input
                    placeholder="B.Sc IT / M.Sc IT / B.Tech"
                    value={education.degree}
                    onChange={(e) =>
                      setEducation({ ...education, degree: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Passing Year</label>
                  <input
                    placeholder="2025"
                    value={education.year}
                    onChange={(e) =>
                      setEducation({ ...education, year: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>College / University</label>
                <input
                  placeholder="University name"
                  value={education.college}
                  onChange={(e) =>
                    setEducation({ ...education, college: e.target.value })
                  }
                />
              </div>

              <div className="button-row">
                <button className="back-btn" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="next-btn" onClick={() => setStep(3)}>
                  Next →
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2>Preferred Job Details</h2>

              <div className="row">
                <div className="form-group">
                  <label>Preferred Role</label>
                  <select
                    value={jobPreferences.role}
                    onChange={(e) =>
                      setJobPreferences({ ...jobPreferences, role: e.target.value })
                    }
                  >
                    <option value="">Select Role</option>
                    <option>Frontend Developer</option>
                    <option>Backend Developer</option>
                    <option>Full Stack Developer</option>
                    <option>ML Engineer</option>
                    <option>Data Analyst</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Preferred Work Mode</label>
                  <select
                    value={jobPreferences.workMode}
                    onChange={(e) =>
                      setJobPreferences({ ...jobPreferences, workMode: e.target.value })
                    }
                  >
                    <option value="">Select Mode</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="form-group">
                  <label>Preferred Shift</label>
                  <select
                    value={jobPreferences.shift}
                    onChange={(e) =>
                      setJobPreferences({ ...jobPreferences, shift: e.target.value })
                    }
                  >
                    <option value="">Select Shift</option>
                    <option>Day</option>
                    <option>Night</option>
                    <option>Flexible</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Job Type</label>
                  <select>
                    <option>Full Time</option>
                    <option>Internship</option>
                    <option>Remote</option>
                  </select>
                </div>
              </div>

              {/* Notice Period & Availability */}
              <div className="row">
                <div className="form-group">
                  <label>Notice Period</label>
                  <select
                    value={jobPreferences.noticePeriod}
                    onChange={(e) =>
                      setJobPreferences({ ...jobPreferences, noticePeriod: e.target.value })
                    }
                  >
                    <option value="">Select Notice Period</option>
                    <option>Immediate</option>
                    <option>15 Days</option>
                    <option>30 Days</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Interview Availability</label>
                  <select
                    value={jobPreferences.interviewAvailability}
                    onChange={(e) =>
                      setJobPreferences({
                        ...jobPreferences,
                        interviewAvailability: e.target.value
                      })
                    }
                  >
                    <option value="">Select Availability</option>
                    <option>Weekdays</option>
                    <option>Weekends</option>
                    <option>Anytime</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="form-group">
                  <label>Willing to Relocate?</label>
                  <select
                    value={locationFlexibility.relocate}
                    onChange={(e) =>
                      setLocationFlexibility({
                        ...locationFlexibility,
                        relocate: e.target.value
                      })
                    }
                  >
                    <option value="">Select</option>
                    <option>Yes</option>
                    <option>No</option>
                    <option>Depends</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Preferred Locations</label>
                  <input
                    placeholder="Bangalore, Pune, Remote"
                    value={locationFlexibility.preferredLocations}
                    onChange={(e) =>
                      setLocationFlexibility({
                        ...locationFlexibility,
                        preferredLocations: e.target.value
                      })
                    }
                  />
                </div>
              </div>


              <div className="button-row">
                <button className="back-btn" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button className="next-btn" onClick={() => setStep(4)}>
                  Next →
                </button>
              </div>
            </>
          )}


          {/* STEP 2 */}
          {step === 4 && (
            <>
              <h2>Experience</h2>

              <div className="form-group">
                <label>Experience</label>
                <select
                  value={experienceType}
                  onChange={(e) => setExperienceType(e.target.value)}
                >
                  <option value="experienced">Experienced</option>
                  <option value="fresher">Fresher</option>
                </select>
              </div>

              {experienceType === "experienced" && (
                <>
                  <div className="row">
                    <div className="form-group">
                      <label>Previous Company</label>
                      <input placeholder="Company name" />
                    </div>

                    <div className="form-group">
                      <label>Current CTC (₹)</label>
                      <input placeholder="400000" />
                    </div>
                  </div>

                  <div className="row">
                    <div className="form-group">
                      <label>Years</label>
                      <input placeholder="Years" />
                    </div>

                    <div className="form-group">
                      <label>Months</label>
                      <input placeholder="Months" />
                    </div>
                  </div>
                  <div className="row">
                    <div className="form-group">
                      <label>Expected CTC (₹)</label>
                      <input placeholder="600000" />
                    </div>
                  </div>
                </>
              )}

              <div className="button-row">
                <button className="back-btn" onClick={() => setStep(3)}>
                  ← Back
                </button>
                <button className="next-btn" onClick={() => setStep(5)}>
                  Next →
                </button>
              </div>
            </>
          )}


          {step === 5 && (
            <>
              <h2>Social & Portfolio Links</h2>

              <div className="row">
                <div className="form-group">
                  <label>GitHub</label>
                  <input
                    placeholder="https://github.com/username"
                    value={socialLinks.github}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, github: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    placeholder="https://linkedin.com/in/username"
                    value={socialLinks.linkedin}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, linkedin: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="row">
                <div className="form-group">
                  <label>Portfolio Website</label>
                  <input
                    placeholder="https://yourportfolio.com"
                    value={socialLinks.portfolio}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, portfolio: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Kaggle (ML roles)</label>
                  <input
                    placeholder="https://kaggle.com/username"
                    value={socialLinks.kaggle}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, kaggle: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="button-row">
                <button className="back-btn" onClick={() => setStep(4)}>
                  ← Back
                </button>
                <button className="next-btn" onClick={() => setStep(6)}>
                  Next →
                </button>
              </div>
            </>
          )}


          {step === 6 && (
            <>
              <h2>Summary</h2>

              <div className="form-group">
                <label>Profile Summary</label>
                <textarea
                  rows="4"
                  placeholder="Brief summary about yourself, skills, and career goals..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>

              <div className="soft-skills">
                <div className="form-group">
                  <label>Profile Summary</label>
                </div>
                <div className="skills">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={softSkills.communication}
                      onChange={() =>
                        setSoftSkills({
                          ...softSkills,
                          communication: !softSkills.communication
                        })
                      }
                    />
                    Communication
                  </label>

                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={softSkills.teamwork}
                      onChange={() =>
                        setSoftSkills({
                          ...softSkills,
                          teamwork: !softSkills.teamwork
                        })
                      }
                    />
                    Teamwork
                  </label>

                </div>

                <div className="skills">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={softSkills.leadership}
                      onChange={() =>
                        setSoftSkills({
                          ...softSkills,
                          leadership: !softSkills.leadership
                        })
                      }
                    />
                    Leadership
                  </label>

                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={softSkills.problemSolving}
                      onChange={() =>
                        setSoftSkills({
                          ...softSkills,
                          problemSolving: !softSkills.problemSolving
                        })
                      }
                    />
                    Problem Solving
                  </label>
                </div>
              </div>
              <div className="form-group">
              </div>

              <div className="form-group">
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResume(e.target.files[0])}
                />
                <label htmlFor="resume" className="file-label">
                  {resume ? resume.name : "Upload Resume / CV"}
                </label>
              </div>

              <div className="button-row">
                <button className="back-btn" onClick={() => setStep(5)}>
                  ← Back
                </button>
                <button className="submit-btn" onClick={handleSubmit}>
                  Submit Profile
                </button>

              </div>
            </>
          )}


        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
