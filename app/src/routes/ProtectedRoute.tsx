// components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../redux/hooks.ts";

function ProtectedRoute() {
  const { user, status } = useAppSelector((state) => state.auth);

  if (status === "loading") return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />; // 👈 renders the nested child routes
}

export default ProtectedRoute;
