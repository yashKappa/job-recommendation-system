import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateProfile from "./components/Profile/CreateProfile";
import Login from "./components/Profile/Login";
import Job from "./components/Dashboard/Job";
import Forgot from "./components/Profile/Forgot";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/job" element={<Job />} />
        <Route path="/forgot" element={<Forgot />} />
      </Routes>
    </Router>
  );
}

export default App;
