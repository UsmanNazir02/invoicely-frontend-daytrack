import { useQuery } from '@tanstack/react-query';
import { Sun, Zap, Building, Package, Tag, TrendingUp, ArrowUpRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts';
import {
    brandService,
    solarPanelService,
    inverterService,
    structureService,
    miscItemService,
} from '../../services';
import { UserRole } from '../../types';

export function DashboardPage() {
    const { user } = useAuth();

    const { data: brands } = useQuery({
        queryKey: ['brands'],
        queryFn: () => brandService.getAll(),
    });

    const { data: solarPanels } = useQuery({
        queryKey: ['solar-panels'],
        queryFn: () => solarPanelService.getAll(),
    });

    const { data: inverters } = useQuery({
        queryKey: ['inverters'],
        queryFn: () => inverterService.getAll(),
    });

    const { data: structures } = useQuery({
        queryKey: ['structures'],
        queryFn: () => structureService.getAll(),
    });

    const { data: miscItems } = useQuery({
        queryKey: ['misc-items'],
        queryFn: () => miscItemService.getAll(),
    });

    const stats = [
        {
            name: 'Brands',
            value: brands?.items?.length ?? (Array.isArray(brands) ? brands.length : 0),
            icon: Tag,
            lightColor: '#eff6ff',
            iconColor: '#2563eb',
            borderColor: '#dbeafe',
            href: '/brands',
        },
        {
            name: 'Solar Panels',
            value: solarPanels?.items?.length ?? (Array.isArray(solarPanels) ? solarPanels.length : 0),
            icon: Sun,
            lightColor: '#fefce8',
            iconColor: '#ca8a04',
            borderColor: '#fef08a',
            href: '/solar-panels',
        },
        {
            name: 'Inverters',
            value: inverters?.items?.length ?? (Array.isArray(inverters) ? inverters.length : 0),
            icon: Zap,
            lightColor: '#f0fdf4',
            iconColor: '#16a34a',
            borderColor: '#bbf7d0',
            href: '/inverters',
        },
        {
            name: 'Structures',
            value: structures?.items?.length ?? (Array.isArray(structures) ? structures.length : 0),
            icon: Building,
            lightColor: '#faf5ff',
            iconColor: '#7c3aed',
            borderColor: '#e9d5ff',
            href: '/structures',
        },
        {
            name: 'Misc Items',
            value: miscItems?.items?.length ?? (Array.isArray(miscItems) ? miscItems.length : 0),
            icon: Package,
            lightColor: '#fff7ed',
            iconColor: '#ea580c',
            borderColor: '#fed7aa',
            href: '/misc-items',
        },
    ];

    return (
        <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>

            {/* ── Header ── */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                marginBottom: '32px',
                flexWrap: 'wrap',
            }}>
                <div>
                    <h1 style={{
                        margin: '0 0 6px',
                        fontSize: '24px',
                        fontWeight: '800',
                        color: '#0f172a',
                        letterSpacing: '-0.4px',
                    }}>
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}! 👋
                    </h1>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                        Here's what's happening with your solar products today.
                    </p>
                </div>

                {user?.role === UserRole.ADMIN && (
                    <Link to="/quote-builder" style={{ textDecoration: 'none', flexShrink: 0 }}>
                        <button
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                height: '40px',
                                padding: '0 18px',
                                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '14px',
                                border: 'none',
                                borderRadius: '9px',
                                cursor: 'pointer',
                                boxShadow: '0 2px 10px rgba(37,99,235,0.28)',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 18px rgba(37,99,235,0.38)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 10px rgba(37,99,235,0.28)';
                            }}
                        >
                            <FileText style={{ width: '15px', height: '15px' }} />
                            Create Quote
                        </button>
                    </Link>
                )}
            </div>

            {/* ── Stats Grid ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
            }}>
                {stats.map((stat) => (
                    <Link
                        key={stat.name}
                        to={stat.href}
                        style={{ textDecoration: 'none' }}
                    >
                        <div
                            style={{
                                background: '#fff',
                                border: '1px solid #f1f5f9',
                                borderRadius: '14px',
                                padding: '20px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                cursor: 'pointer',
                                height: '100%',
                                boxSizing: 'border-box',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: stat.lightColor,
                                    border: `1px solid ${stat.borderColor}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <stat.icon style={{ width: '18px', height: '18px', color: stat.iconColor }} />
                                </div>
                                <ArrowUpRight style={{ width: '15px', height: '15px', color: '#cbd5e1' }} />
                            </div>
                            <p style={{
                                margin: '0 0 4px',
                                fontSize: '30px',
                                fontWeight: '800',
                                color: '#0f172a',
                                letterSpacing: '-0.5px',
                                lineHeight: 1,
                            }}>
                                {stat.value}
                            </p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                                {stat.name}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ── Quick Actions ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
            }}>

                {/* Quick Start Guide */}
                <div style={{
                    background: '#fff',
                    border: '1px solid #f1f5f9',
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-start',
                }}>
                    <div style={{
                        flexShrink: 0,
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.30)',
                    }}>
                        <TrendingUp style={{ width: '24px', height: '24px', color: '#fff' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
                            Quick Start Guide
                        </h2>
                        <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                            Get started by adding your products. First add brands, then solar panels, inverters, structures, and misc items.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <Link to="/brands" style={{ textDecoration: 'none' }}>
                                <button style={{
                                    height: '34px',
                                    padding: '0 14px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#2563eb',
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
                                >
                                    Add Brands
                                </button>
                            </Link>
                            <Link to="/solar-panels" style={{ textDecoration: 'none' }}>
                                <button style={{
                                    height: '34px',
                                    padding: '0 14px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#2563eb',
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
                                >
                                    Add Panels
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Create Quote */}
                <div style={{
                    background: '#fff',
                    border: '1px solid #f1f5f9',
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-start',
                }}>
                    <div style={{
                        flexShrink: 0,
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(22,163,74,0.28)',
                    }}>
                        <FileText style={{ width: '24px', height: '24px', color: '#fff' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
                            Create Your First Quote
                        </h2>
                        <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                            Once you have products set up, use the Quote Builder to create professional quotes for your customers.
                        </p>
                        <Link to="/quote-builder" style={{ textDecoration: 'none' }}>
                            <button
                                style={{
                                    height: '34px',
                                    padding: '0 16px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#fff',
                                    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 8px rgba(37,99,235,0.28)',
                                    transition: 'transform 0.15s, box-shadow 0.15s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.38)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.28)';
                                }}
                            >
                                Start Building
                                <ArrowUpRight style={{ width: '14px', height: '14px' }} />
                            </button>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
