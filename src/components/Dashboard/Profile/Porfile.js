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
        <div>
            <div>
                <h2>My Profile</h2>

                <div>
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

                    <p>{profile.summary}</p>
                    <p><strong>Name:</strong> {profile.basicDetails.fullName}</p>
                    <p><strong>Email:</strong> {profile.basicDetails.email}</p>
                </div>
            </div>

            <p><strong>Skills:</strong> {profile.basicDetails.skills}</p>

            <h3>Education</h3>
            <p>{profile.education.degree}</p>
            <p>{profile.education.college}</p>
            <p>{profile.education.year}</p>

            <h3>Experience</h3>
            <p>{profile.experience.type}</p>

            <h3>Job Preferences</h3>
            <p>Role: {profile.jobPreferences.role}</p>
            <p>Work Mode: {profile.jobPreferences.workMode}</p>
            <p>Availability: {profile.jobPreferences.interviewAvailability}</p>
            <p>Notice Period: {profile.jobPreferences.noticePeriod}</p>

            <h3>Location Flexibility</h3>
            <p>Location: {profile.locationFlexibility.preferredLocations}</p>
            <p>Relocate: {profile.locationFlexibility.relocate}</p>

            <h3>Social Link</h3>
            <p>Github: <a href="{profile.socialLinks.github}">{profile.socialLinks.github}</a></p>
            <p>Kaggle: <a href="{profile.socialLinks.kaggle}">{profile.socialLinks.kaggle}</a></p>
            <p>Linkedin: <a href="{profile.socialLinks.linkedin}">{profile.socialLinks.linkedin}</a></p>
            <p>Portfolio: <a href="{profile.socialLinks.portfolio}">{profile.socialLinks.portfolio}</a></p>

            {profile.resumeURL && (
                <a href={profile.resumeURL} target="_blank" rel="noreferrer">
                    View Resume
                </a>
            )}
        </div>
    );
};

export default Profile;
