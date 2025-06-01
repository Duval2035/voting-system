import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateElection from "./pages/CreateElection";
import ManageElection from "./pages/ManageElection";
import VotePage from "./pages/VotePage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RequestOtp from "./pages/RequestOtp";
import VerifyOtp from "./pages/VerifyOtp";
import UserVoting from "./pages/UserVoting";
import ResultsPage from "./pages/ResultsPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/request-otp" element={<RequestOtp />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/user/voting" element={<UserVoting />} />
        <Route path="/results/:id" element={<ResultsPage />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Layout><UserDashboard /></Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-election"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout><CreateElection /></Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-election/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout><ManageElection /></Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vote/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Layout><VotePage /></Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
