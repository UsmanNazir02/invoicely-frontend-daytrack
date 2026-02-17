import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '../components';
import { useAuth } from '../contexts';
import { ProtectedRoute } from './ProtectedRoute';
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
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <DashboardPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/brands"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <BrandsPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/solar-panels"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <SolarPanelsPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inverters"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <InvertersPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/structures"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <StructuresPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/misc-items"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <MiscItemsPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Sales routes */}
                <Route
                    path="/quote-builder"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <QuoteBuilderPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/quotes"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <QuotesPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Catch all - redirect based on role */}
                <Route path="*" element={<Navigate to={defaultRoute} replace />} />
            </Routes>
        </BrowserRouter>
    );
}
