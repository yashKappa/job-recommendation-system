import React, { useState } from "react";
import { auth } from "../Firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Profile.css"; // reuse the same CSS

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="data">
          <div className="img">
            <img
              src={`${process.env.PUBLIC_URL}/assets/forgot.svg`}
              alt="flaticorn"
            />
            <p className="motivation-text">
              Forgot your password?<br />
              Enter your email below and we’ll send you a link to reset it.
            </p>
          </div>
        </div>

        <div className="profile-card slide">
          <div className="logo">
            <img src={`${process.env.PUBLIC_URL}/assets/Logo.png`} alt="logo" />
          </div>

          <h2>Reset Password</h2>

          <form onSubmit={handleReset}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {message && <small className="success-text">{message}</small>}
            {error && <small className="error-text">{error}</small>}

            <div className="forgot-password">

            <a className="back-btn" href="/login"> ← Back to Login</a>
              
            <button type="submit" className="next-btn">
              Send Reset Link
            </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Forgot;
