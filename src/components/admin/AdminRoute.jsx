import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = sessionStorage.getItem("adminToken");
  // console.log("AdminRoute - Token check:", token);

  if (!token) {
    // console.log("AdminRoute - No token, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // console.log("AdminRoute - Token found, allowing access");
  return children;
};

export default AdminRoute;
