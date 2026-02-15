
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import React, { Fragment } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <div className="animate-pulse text-primary font-medium">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to onboarding with return path
    return <Navigate to="/onboarding/welcome" state={{ from: location }} replace />;
  }

  return <div>{children}</div>;
};

export default ProtectedRoute;
