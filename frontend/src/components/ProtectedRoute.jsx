import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Role-based protected route component.
 * Only allows access if user has a valid token and correct role.
 *
 * @param {ReactNode} children - The child components (optional)
 * @param {string[]} allowedRoles - Array of roles allowed to access this route
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Redirect if not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if role not authorized
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // If children prop is passed (element style), use it
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
