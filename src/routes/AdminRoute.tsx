import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import { UserRole } from '../types';

interface AdminRouteProps {
    children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role !== UserRole.ADMIN) {
        return <Navigate to="/quote-builder" replace />;
    }

    return <>{children}</>;
}
