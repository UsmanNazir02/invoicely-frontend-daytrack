import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Sun,
    Zap,
    Building,
    LogOut,
    Menu,
    X,
    Tag,
    FileText,
    ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts';
import { UserRole } from '../../types';

const adminNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Brands', href: '/brands', icon: Tag },
    { name: 'Solar Panels', href: '/solar-panels', icon: Sun },
    { name: 'Inverters', href: '/inverters', icon: Zap },
    { name: 'Structures', href: '/structures', icon: Building },
    { name: 'Misc Items', href: '/misc-items', icon: Package },
];

const salesNavigation = [
    { name: 'Quote Builder', href: '/quote-builder', icon: FileText },
    { name: 'My Quotes', href: '/quotes', icon: LayoutDashboard },
];

interface SidebarProps {
    children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isAdmin = user?.role === UserRole.ADMIN;
    const navigation = isAdmin ? adminNavigation : salesNavigation;

    // Get current page title
    const getCurrentPageTitle = () => {
        const currentNav = [...adminNavigation, ...salesNavigation].find(
            (nav) => nav.href === location.pathname
        );
        return currentNav?.name || 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-xl">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Invoicely</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* User info card */}
                    <div className="px-4 py-4">
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <span className="text-white font-semibold text-sm">
                                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user?.fullName || 'User'}
                                </p>
                                <p className="text-xs text-blue-600 font-medium capitalize">
                                    {user?.role === UserRole.ADMIN ? 'Administrator' : 'Sales Person'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                        <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {isAdmin ? 'Management' : 'Sales'}
                        </p>
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                            {item.name}
                                        </div>
                                        <ChevronRight className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white opacity-100' : 'text-gray-400'}`} />
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <div className="flex items-center justify-between h-full px-4 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <Menu className="h-5 w-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">{getCurrentPageTitle()}</h1>
                                <p className="text-xs text-gray-500 hidden sm:block">
                                    {isAdmin ? 'Manage your solar products' : 'Create and manage quotes'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs font-medium text-gray-600">Online</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
