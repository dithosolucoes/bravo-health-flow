import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
  role?: UserRole | UserRole[];
}

const RequireAuth = ({ children, role }: RequireAuthProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-pulse text-bravo-blue text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role) {
    const roles = Array.isArray(role) ? role : [role];

    if (!roles.includes(user.role)) {
      let redirectPath = '/';
      switch (user.role) {
        case 'ADMIN':
          redirectPath = '/admin/dashboard';
          break;
        case 'MEDICO':
          redirectPath = '/medico/dashboard';
          break;
        case 'CLIENTE':
          redirectPath = '/cliente/dashboard';
          break;
      }

      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default RequireAuth;
