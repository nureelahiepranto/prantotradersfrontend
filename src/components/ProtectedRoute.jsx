import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useContext(AuthContext);

  // wait for loading
  if (loading) return <p>Loading...</p>;

  // not logged in
  if (!user) return <Navigate to="/login" />;

  // role not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
}
