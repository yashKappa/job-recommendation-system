import React, { useEffect, useState } from "react";
import { auth, db } from "../../Firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Profile.css"

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const user = auth.currentUser;

                if (!user) {
                    setError("User not logged in");
                    setLoading(false);
                    return;
                }

                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                } else {
                    setError("Profile not found");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="profileData">
                <h2>My Profile</h2>

                <div className="profileHead">
                    {profile.profileImageURL ? (
                        <div>
                            <img
                                src={profile.profileImageURL} // Supabase URL
                                alt="Profile"
                                className="profile-img"
                            />
                            <br />
                        </div>
                    ) : (
                        <div className="profile-placeholder">No Image</div>
                    )}
                    <div className="subData">
                    <p><strong>Summary: </strong>{profile.summary}</p>
                    <p><strong>Name:</strong> {profile.basicDetails.fullName}</p>
                    <p><strong>Email:</strong> {profile.basicDetails.email}</p>
                    </div>
                </div>

            <div className="profileSubData">
            <h3>Education</h3>
            <p><strong>Degree: </strong>{profile.education.degree}</p>
            <p><strong>College: </strong>{profile.education.college}</p>
            <p><strong>Passing Year:</strong>{profile.education.year}</p>
            </div>

            <div className="profileSubData">
            <h3>Experience</h3>
            <p>{profile.experience.type}</p>
            <p><strong>Skills: </strong> {profile.basicDetails.skills}</p>
            </div>
            
            <div className="profileSubData">
            <h3>Job Preferences</h3>
            <p><strong>Role: </strong> {profile.jobPreferences.role}</p>
            <p><strong>Work mode: </strong> {profile.jobPreferences.workMode}</p>
            <p><strong>Availability: </strong> {profile.jobPreferences.interviewAvailability}</p>
            <p><strong>Notice Period: </strong> {profile.jobPreferences.noticePeriod}</p>
            </div>

            <div className="profileSubData">
            <h3>Location Flexibility</h3>
            <p><strong>Location: </strong>{profile.locationFlexibility.preferredLocations}</p>
            <p><strong>Relocate: </strong> {profile.locationFlexibility.relocate}</p>
            </div>

            <div className="profileSubData">
            <h3>Social Link</h3>
            <div className="links">
            <p><div className="linkImg"><img src={`${process.env.PUBLIC_URL}/assets/github.png`} alt="rocket" /></div><div><a href="{profile.socialLinks.github}"> Github</a></div></p>
            <p><div className="linkImg"><img src={`${process.env.PUBLIC_URL}/assets/linkedin.png`} alt="rocket" /></div><div><a href="{profile.socialLinks.linkedin}"> linkedin</a></div></p>
            <p><div className="linkImg"><img src={`${process.env.PUBLIC_URL}/assets/facebook.png`} alt="rocket" /></div><div><a href="{profile.socialLinks.kaggle}"> facebook</a></div></p>
            <p><div className="linkImg"><img src={`${process.env.PUBLIC_URL}/assets/briefcase.png`} alt="rocket" /></div><div><a href="{profile.socialLinks.portfolio}"> portfolio</a></div></p>
            </div>
            </div>

             {profile.resumeURL && (
                <a className="resume" href={profile.resumeURL} target="_blank" rel="noreferrer">
                    View Resume
                </a>
            )}
        </div>
    );
};

export default Profile;
