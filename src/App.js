import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
 import CreateProfile from "./components/Profile/CreateProfile";
import Login from "./components/Profile/Login";
import Job from "./components/Dashboard/Job";
import Forgot from "./components/Profile/Forgot";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/Dashboard/Profile/Porfile";
import Sidebar from "./components/Dashboard/Sidebar/Sidebar";

function App() {
  return (
    <Router basename="/job-recommendation-system">
      <Routes>
        <Route path="/create" element={<CreateProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sidebar" element={<Sidebar />} />

        {/* 🔐 Protected Route */}
        <Route
          path="/job"
          element={
            <ProtectedRoute>
              <Job />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
