import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, profile, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-stone-600">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-stone-700">Verifying codeLab forensic clearances...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.status === 'suspended') {
    return <Navigate to="/account-suspended" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // If superadmin, always allow access to admin and participant pages
    const hasRole =
      allowedRoles.includes(role) ||
      (role === 'superadmin' && (allowedRoles.includes('admin') || allowedRoles.includes('participant'))) ||
      (role === 'admin' && allowedRoles.includes('participant'));

    if (!hasRole) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return <>{children}</>;
};
