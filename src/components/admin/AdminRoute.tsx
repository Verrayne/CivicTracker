import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingSpinner } from "../feedback/States";
import { useAuth } from "../../context/auth";

export function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner label="Checking administrator access..." />;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
