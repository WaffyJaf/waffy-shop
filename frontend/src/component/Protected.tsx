import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../component/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: ('ADMIN' | 'USER')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { token, user, isLoading } = useAuth();


  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
