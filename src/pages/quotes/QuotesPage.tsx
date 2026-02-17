import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Plus,
    Eye,
    Trash2,
    FileText,
    Calendar,
    User,
    DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardContent, Button, Badge, Table } from '../../components';
import { quoteService } from '../../services';
import type { Quote } from '../../types';
import { QuoteStatus } from '../../types';

const statusColors: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
    [QuoteStatus.DRAFT]: 'default',
    [QuoteStatus.SENT]: 'info',
    [QuoteStatus.ACCEPTED]: 'success',
    [QuoteStatus.REJECTED]: 'danger',
};

const statusLabels: Record<string, string> = {
    [QuoteStatus.DRAFT]: 'Draft',
    [QuoteStatus.SENT]: 'Sent',
    [QuoteStatus.ACCEPTED]: 'Accepted',
    [QuoteStatus.REJECTED]: 'Rejected',
};

export function QuotesPage() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['quotes'],
        queryFn: () => quoteService.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => quoteService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            toast.success('Quote deleted successfully');
        },
        onError: () => toast.error('Failed to delete quote'),
    });

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this quote?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns = [
        {
            key: 'customerName',
            header: 'Customer',
            render: (quote: Quote) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{quote.customerName}</p>
                        {quote.customerPhone && (
                            <p className="text-sm text-gray-500">{quote.customerPhone}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'items',
            header: 'Items',
            render: (quote: Quote) => (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>{quote.items?.length || 0} items</span>
                </div>
            ),
        },
        {
            key: 'finalAmount',
            header: 'Amount',
            render: (quote: Quote) => (
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">
                        Rs. {Number(quote.finalAmount).toLocaleString()}
                    </span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (quote: Quote) => (
                <Badge variant={statusColors[quote.status]}>
                    {statusLabels[quote.status]}
                </Badge>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created',
            render: (quote: Quote) => (
                <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(quote.createdAt).toLocaleDateString()}</span>
                </div>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (quote: Quote) => (
                <div className="flex items-center gap-2">
                    <Link to={`/quotes/${quote.id}`}>
                        <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(quote.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const quotes = data?.items || (Array.isArray(data) ? data : []);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Quotes</h1>
                    <p className="text-gray-500 mt-1">View and manage your quotes</p>
                </div>
                <Link to="/quote-builder">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Quote
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <FileText className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
                                <p className="text-sm text-gray-500">Total Quotes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {quotes.filter((q: Quote) => q.status === QuoteStatus.SENT).length}
                                </p>
                                <p className="text-sm text-gray-500">Sent</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {quotes.filter((q: Quote) => q.status === QuoteStatus.ACCEPTED).length}
                                </p>
                                <p className="text-sm text-gray-500">Accepted</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <DollarSign className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    Rs. {quotes.reduce((sum: number, q: Quote) => sum + Number(q.finalAmount), 0).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">Total Value</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900">All Quotes</h2>
                </CardHeader>
                <CardContent className="p-0">
                    <Table
                        columns={columns}
                        data={quotes}
                        isLoading={isLoading}
                        emptyMessage="No quotes yet. Create your first quote!"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
