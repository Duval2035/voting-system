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
import AuditorDashboard from "./pages/AuditorDashboard";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import CandidateResults from "./pages/CandidateResults";
import AuditorIntegrity from "./pages/AuditorIntegrity";
import VoterList from "./pages/VoterList";
import VoterEligibility from "./pages/VoterEligibility"; // ✅ NEW

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/request-otp" element={<RequestOtp />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/user/voting" element={<UserVoting />} />
        <Route path="/results/:id" element={<ResultsPage />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout><AdminDashboard /></Layout>
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
          path="/admin/voters"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout><VoterList /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/eligibility"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout><VoterEligibility /></Layout>
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Layout><UserDashboard /></Layout>
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

        {/* Auditor Routes */}
        <Route
          path="/auditor"
          element={
            <ProtectedRoute allowedRoles={["auditor"]}>
              <Layout><AuditorDashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditor/integrity"
          element={
            <ProtectedRoute allowedRoles={["auditor"]}>
              <Layout><AuditorIntegrity /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Candidate Routes */}
        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <Layout><CandidateDashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/results"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <Layout><CandidateResults /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback and Auth Error */}
        <Route path="/unauthorized" element={<Layout><UnauthorizedPage /></Layout>} />
        <Route path="*" element={<Layout><Home /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
