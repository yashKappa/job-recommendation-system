import React, { useState, useEffect } from "react";
import { auth } from "../Firebase";
import { signInWithEmailAndPassword, onAuthStateChanged  } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import "./Profile.css"; // reuse the same CSS for styling

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/job"); // redirect after successful login
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      navigate("/job");
    }
  });

  return () => unsubscribe();
},);

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="data">
          <div className="img">
  <img src={`${process.env.PUBLIC_URL}/assets/startup.png`} alt="rocket" />
  <p className="motivation-text">
    Welcome back!<br />
    Log in to continue your journey<br />
    towards your dream career opportunities.<br />
    Your skills + AI = Perfect match.
  </p>
  <div className="create">
<Link to="/create">New here? Create an account</Link>
  </div>
</div>

        </div>

        <div className="profile-card slide">
          <div className="logo">
            <img src={`${process.env.PUBLIC_URL}/assets/Logo.png`} alt="logo" />
          </div>

          <h2>Login</h2>

          <form onSubmit={handleLogin}>
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

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <small className="error-text">{error}</small>}

            <div className="forgot-password">
            <button type="submit" className="back-btn">
              Login
            </button>

            <Link className="next-btn" to="/forgot"> Forgot Password? </Link>
              
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
