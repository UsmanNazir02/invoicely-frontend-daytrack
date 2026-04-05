import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Sun,
    Zap,
    Building,
    LogOut,
    Tag,
    FileText,
    ChevronLeft,
    ChevronRight,
    Users,
    BatteryFull,
    Wrench,
    Plug,
} from 'lucide-react';
import { useAuth } from '../../contexts';
import { UserRole } from '../../types';

const adminNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Quote Builder', href: '/quote-builder', icon: FileText },
    { name: 'Quotes', href: '/quotes', icon: FileText },
    { name: 'Sales Agents', href: '/sales-agents', icon: Users },
    { name: 'Brands', href: '/brands', icon: Tag },
    { name: 'Solar Panels', href: '/solar-panels', icon: Sun },
    { name: 'Inverters', href: '/inverters', icon: Zap },
    { name: 'Structures', href: '/structures', icon: Building },
    { name: 'Misc Items', href: '/misc-items', icon: Package },
    { name: 'Batteries', href: '/batteries', icon: BatteryFull },
    { name: 'Services', href: '/service-items', icon: Wrench },
    { name: 'Electrical', href: '/electrical-items', icon: Plug },
];

const salesNavigation = [
    { name: 'Quote Builder', href: '/quote-builder', icon: FileText },
    { name: 'My Quotes', href: '/quotes', icon: LayoutDashboard },
];

interface SidebarProps { children: React.ReactNode }

const EXPANDED_WIDTH = 256;
const COLLAPSED_WIDTH = 68;

export function Sidebar({ children }: SidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try { return localStorage.getItem('sidebarCollapsed') === '1'; } catch { return false; }
    });

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        try { localStorage.setItem('sidebarCollapsed', isCollapsed ? '1' : '0'); } catch { /* ignore */ }
    }, [isCollapsed]);

    const handleLogout = async () => { await logout(); navigate('/login'); };

    const isAdmin = user?.role === UserRole.ADMIN;
    const navItems = isAdmin ? adminNavigation : salesNavigation;

    const getCurrentTitle = () => {
        const found = [...adminNavigation, ...salesNavigation].find(n => n.href === location.pathname);
        return found?.name || 'Dashboard';
    };

    const sidebarW = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

    /* ─── shared nav-link style ─── */
    const linkStyle = (isActive: boolean, collapsed: boolean): React.CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: '10px',
        padding: collapsed ? '10px' : '9px 12px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        textDecoration: 'none',
        transition: 'background 0.15s, color 0.15s',
        color: isActive ? '#fff' : '#4b5563',
        background: isActive
            ? 'linear-gradient(135deg,#2563eb,#4f46e5)'
            : 'transparent',
        boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.28)' : 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>

            {/* ── Mobile backdrop ── */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 40,
                        background: 'rgba(15,23,42,0.55)',
                        backdropFilter: 'blur(4px)',
                    }}
                />
            )}

            {/* ══════════ SIDEBAR ══════════ */}
            <aside
                style={{
                    position: 'fixed',
                    top: 0, left: 0, bottom: 0,
                    zIndex: 50,
                    width: `${sidebarW}px`,
                    background: '#fff',
                    borderRight: '1px solid #f1f5f9',
                    boxShadow: '2px 0 16px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.25s ease, transform 0.25s ease',
                    /* mobile: hide off-screen; desktop: always visible */
                    transform: mobileOpen ? 'translateX(0)' : undefined,
                } as React.CSSProperties}
                className={`${mobileOpen ? '' : '-translate-x-full'} md:translate-x-0`}
            >
                {/* ── Logo bar ── */}
                <div style={{
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    padding: isCollapsed ? '0 12px' : '0 16px',
                    borderBottom: '1px solid #f1f5f9',
                    flexShrink: 0,
                }}>
                    {!isCollapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '9px',
                                background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(37,99,235,0.30)',
                                flexShrink: 0,
                            }}>
                                <Zap style={{ width: '17px', height: '17px', color: '#fff' }} strokeWidth={2.5} />
                            </div>
                            <span style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>
                                Invoicely
                            </span>
                        </div>
                    )}

                    {isCollapsed && (
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '9px',
                            background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(37,99,235,0.30)',
                        }}>
                            <Zap style={{ width: '17px', height: '17px', color: '#fff' }} strokeWidth={2.5} />
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <button
                            onClick={() => setIsCollapsed(v => !v)}
                            className="hidden md:flex"
                            style={{
                                width: '28px', height: '28px', borderRadius: '7px',
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#64748b',
                                transition: 'background 0.15s',
                            }}
                        >
                            {isCollapsed
                                ? <ChevronRight style={{ width: '14px', height: '14px' }} />
                                : <ChevronLeft style={{ width: '14px', height: '14px' }} />
                            }
                        </button>
                    </div>
                </div>

                {/* ── User card ── */}
                <div style={{ padding: '12px', flexShrink: 0 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        gap: '10px',
                        padding: isCollapsed ? '8px' : '10px 12px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg,#eff6ff,#eef2ff)',
                        border: '1px solid #dde5ff',
                    }}>
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                        }}>
                            <span style={{ color: '#fff', fontWeight: '700', fontSize: '13px' }}>
                                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        {!isCollapsed && (
                            <div style={{ minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user?.fullName || 'User'}
                                </p>
                                <p style={{ margin: 0, fontSize: '11px', color: '#2563eb', fontWeight: '600' }}>
                                    {user?.role === UserRole.ADMIN ? 'Administrator' : 'Sales Person'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Nav section label ── */}
                {!isCollapsed && (
                    <p style={{
                        margin: '4px 0 6px',
                        padding: '0 16px',
                        fontSize: '10.5px',
                        fontWeight: '700',
                        letterSpacing: '0.08em',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                    }}>
                        {isAdmin ? 'Management' : 'Sales'}
                    </p>
                )}

                {/* ── Nav links ── */}
                <nav style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: '0 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={() => setMobileOpen(false)}
                            style={({ isActive }) => linkStyle(isActive, isCollapsed)}
                            title={isCollapsed ? item.name : undefined}
                        >
                            {({ isActive }) => (
                                <>
                                    <div style={{
                                        display: 'flex', alignItems: 'center',
                                        gap: '10px', minWidth: 0, flex: 1,
                                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                        }}>
                                            <item.icon style={{
                                                width: '17px', height: '17px',
                                                color: isActive ? '#fff' : '#64748b',
                                                flexShrink: 0,
                                            }} />
                                        </div>
                                        {!isCollapsed && (
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.name}
                                            </span>
                                        )}
                                    </div>
                                    {!isCollapsed && (
                                        <ChevronRight style={{
                                            width: '14px', height: '14px', flexShrink: 0,
                                            color: isActive ? 'rgba(255,255,255,0.7)' : '#cbd5e1',
                                        }} />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* ── Sign out ── */}
                <div style={{ padding: '10px', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? 'Sign Out' : undefined}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            gap: '10px',
                            width: '100%',
                            padding: isCollapsed ? '10px' : '9px 12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#64748b',
                            transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#fff1f2';
                            e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#64748b';
                        }}
                    >
                        <LogOut style={{ width: '17px', height: '17px', flexShrink: 0 }} />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* ══════════ MAIN AREA ══════════ */}
            <div style={{
                flex: 1,
                minWidth: 0,
                marginLeft: `${sidebarW}px`,
                transition: 'margin-left 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
            }}
                className="md:ml-auto"
            >
                {/* ── Top bar ── */}
                <header style={{
                    position: 'sticky', top: 0, zIndex: 30,
                    height: '60px',
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    boxShadow: '0 1px 0 #f1f5f9',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                                {getCurrentTitle()}
                            </h1>
                            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                                {isAdmin ? 'Manage your solar products' : 'Create and manage quotes'}
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '5px 12px', borderRadius: '20px',
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                    }}>
                        <div style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            background: '#22c55e',
                            boxShadow: '0 0 0 2px rgba(34,197,94,0.25)',
                            animation: 'sb-pulse 2s infinite',
                        }} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>Online</span>
                    </div>
                </header>

                {/* ── Page content ── */}
                <main style={{ flex: 1, padding: '24px 28px', minWidth: 0 }}>
                    {children}
                </main>
            </div>

            <style>{`
                @keyframes sb-pulse {
                    0%,100% { opacity:1; }
                    50%      { opacity:0.5; }
                }
                /* ensure sidebar is always visible on md+ screens */
                @media (min-width:768px) {
                    aside { transform: translateX(0) !important; }
                }
            `}</style>
        </div>
    );
}