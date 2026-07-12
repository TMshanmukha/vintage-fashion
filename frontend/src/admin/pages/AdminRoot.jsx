import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminLogin from "./AdminLogin";

export default function AdminRoot() {
  const { isAuthenticated } = useAdminAuth();
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return <AdminLogin />;
}
