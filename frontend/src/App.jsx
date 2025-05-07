import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateElection from "./pages/CreateElection";
import ManageElection from "./pages/ManageElection";
import AddCandidate from "./pages/AddCandidate";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-election" element={<CreateElection />} />
        <Route path="/admin/elections/:electionId" element={<ManageElection />} />
        <Route path="/admin/elections/:electionId/add-candidate" element={<AddCandidate />} />
      </Routes>
    </Router>
  );
}

export default App;
