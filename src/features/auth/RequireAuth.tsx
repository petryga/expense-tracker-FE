import { type FC, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { isAuthEnabled } from '../../lib/supabaseClient';

export const RequireAuth: FC<{ children: ReactNode }> = ({ children }) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (!isAuthEnabled) return <>{children}</>;

  if (isLoading) return <></>;

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
