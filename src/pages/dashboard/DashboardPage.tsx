import { useQuery } from '@tanstack/react-query';
import { Sun, Zap, Building, Package, Tag, TrendingUp, ArrowUpRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button } from '../../components';
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
            value: brands?.items?.length || (Array.isArray(brands) ? brands.length : 0),
            icon: Tag,
            color: 'bg-blue-500',
            lightColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            href: '/brands',
        },
        {
            name: 'Solar Panels',
            value: solarPanels?.items?.length || (Array.isArray(solarPanels) ? solarPanels.length : 0),
            icon: Sun,
            color: 'bg-yellow-500',
            lightColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
            href: '/solar-panels',
        },
        {
            name: 'Inverters',
            value: inverters?.items?.length || (Array.isArray(inverters) ? inverters.length : 0),
            icon: Zap,
            color: 'bg-green-500',
            lightColor: 'bg-green-50',
            textColor: 'text-green-600',
            href: '/inverters',
        },
        {
            name: 'Structures',
            value: structures?.items?.length || (Array.isArray(structures) ? structures.length : 0),
            icon: Building,
            color: 'bg-purple-500',
            lightColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            href: '/structures',
        },
        {
            name: 'Misc Items',
            value: miscItems?.items?.length || (Array.isArray(miscItems) ? miscItems.length : 0),
            icon: Package,
            color: 'bg-orange-500',
            lightColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            href: '/misc-items',
        },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Here's what's happening with your solar products today.
                    </p>
                </div>
                {user?.role === UserRole.ADMIN && (
                    <Link to="/quote-builder">
                        <Button>
                            <FileText className="h-4 w-4 mr-2" />
                            Create Quote
                        </Button>
                    </Link>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.map((stat) => (
                    <Link key={stat.name} to={stat.href}>
                        <Card hover className="h-full">
                            <CardContent className="py-5">
                                <div className="flex items-center justify-between">
                                    <div className={`p-3 rounded-xl ${stat.lightColor}`}>
                                        <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                                </div>
                                <div className="mt-4">
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-500 mt-1">{stat.name}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="py-8">
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                                <TrendingUp className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Quick Start Guide
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    Get started by adding your products. First, add brands, then add solar panels, inverters, structures, and miscellaneous items.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Link to="/brands">
                                        <Button variant="outline" size="sm">
                                            Add Brands
                                        </Button>
                                    </Link>
                                    <Link to="/solar-panels">
                                        <Button variant="outline" size="sm">
                                            Add Panels
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="py-8">
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                                <FileText className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Create Your First Quote
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    Once you have products set up, use the Quote Builder to create professional quotes for your customers.
                                </p>
                                <Link to="/quote-builder">
                                    <Button size="sm">
                                        Start Building
                                        <ArrowUpRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
