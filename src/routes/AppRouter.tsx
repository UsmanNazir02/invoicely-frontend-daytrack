import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '../components';
import { useAuth } from '../contexts';
import { ProtectedRoute, AdminRoute } from './index';
import { UserRole } from '../types';
import {
    LoginPage,
    DashboardPage,
    BrandsPage,
    SolarPanelsPage,
    InvertersPage,
    StructuresPage,
    MiscItemsPage,
    QuoteBuilderPage,
    QuotesPage,
    QuoteDetailsPage,
    SalesAgentsPage,
} from '../pages';

function AppLayout({ children }: { children: React.ReactNode }) {
    return <Sidebar>{children}</Sidebar>;
}

export function AppRouter() {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    const isAdmin = user?.role === UserRole.ADMIN;
    const defaultRoute = isAdmin ? '/' : '/quote-builder';

    return (
        <BrowserRouter>
            <Routes>
                {/* Public route */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <LoginPage />}
                />

                {/* Admin routes */}
                <Route path="/" element={<AdminRoute><AppLayout><DashboardPage /></AppLayout></AdminRoute>} />
                <Route path="/brands" element={<AdminRoute><AppLayout><BrandsPage /></AppLayout></AdminRoute>} />
                <Route path="/solar-panels" element={<AdminRoute><AppLayout><SolarPanelsPage /></AppLayout></AdminRoute>} />
                <Route path="/inverters" element={<AdminRoute><AppLayout><InvertersPage /></AppLayout></AdminRoute>} />
                <Route path="/structures" element={<AdminRoute><AppLayout><StructuresPage /></AppLayout></AdminRoute>} />
                <Route path="/misc-items" element={<AdminRoute><AppLayout><MiscItemsPage /></AppLayout></AdminRoute>} />
                <Route path="/sales-agents" element={<AdminRoute><AppLayout><SalesAgentsPage /></AppLayout></AdminRoute>} />

                {/* Sales routes */}
                <Route path="/quote-builder" element={<ProtectedRoute><AppLayout><QuoteBuilderPage /></AppLayout></ProtectedRoute>} />
                <Route path="/quotes" element={<ProtectedRoute><AppLayout><QuotesPage /></AppLayout></ProtectedRoute>} />
                <Route path="/quotes/:id" element={<ProtectedRoute><AppLayout><QuoteDetailsPage /></AppLayout></ProtectedRoute>} />

                {/* Catch all - redirect based on role */}
                <Route path="*" element={<Navigate to={defaultRoute} replace />} />
            </Routes>
        </BrowserRouter>
    );
}
