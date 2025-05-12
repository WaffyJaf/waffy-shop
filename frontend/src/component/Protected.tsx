import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../component/AuthContext'; // เปลี่ยน path ตามจริง

interface ProtectedRouteProps {
  allowedRoles: ('ADMIN' | 'USER')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
