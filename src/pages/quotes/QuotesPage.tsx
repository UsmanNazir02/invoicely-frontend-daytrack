import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Plus, Eye, Pencil, Trash2, FileText,
    Calendar, User, DollarSign, CheckCircle, Clock, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { quoteService } from '../../services';
import type { Quote } from '../../types';
import { QuoteStatus } from '../../types';

/* ── status config ── */
const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
    [QuoteStatus.DRAFT]: { label: 'Draft', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
    [QuoteStatus.SENT]: { label: 'Sent', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    [QuoteStatus.ACCEPTED]: { label: 'Accepted', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    [QuoteStatus.REJECTED]: { label: 'Rejected', bg: '#fff1f2', color: '#dc2626', border: '#fecaca' },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status] ?? statusConfig[QuoteStatus.DRAFT];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            whiteSpace: 'nowrap',
        }}>
            {cfg.label}
        </span>
    );
}

function IconBtn({ onClick, title, danger, children }: {
    onClick?: () => void; title?: string; danger?: boolean; children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{
                width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0',
                background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: danger ? '#dc2626' : '#374151', transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = danger ? '#fff1f2' : '#f8fafc';
                e.currentTarget.style.borderColor = danger ? '#fecaca' : '#cbd5e1';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#e2e8f0';
            }}
        >
            {children}
        </button>
    );
}

export function QuotesPage() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['quotes'],
        queryFn: () => quoteService.getAll(),
        refetchOnMount: 'always',
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => quoteService.delete(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quotes'] }); toast.success('Quote deleted'); },
        onError: () => toast.error('Failed to delete quote'),
    });

    const quotes: Quote[] = data?.items || (Array.isArray(data) ? data : []);

    const totalValue = quotes.reduce((s, q) => s + Number(q.finalAmount), 0);
    const sentCount = quotes.filter(q => q.status === QuoteStatus.SENT).length;
    const acceptedCount = quotes.filter(q => q.status === QuoteStatus.ACCEPTED).length;

    const stats = [
        { label: 'Total Quotes', value: quotes.length, icon: <FileText style={{ width: '18px', height: '18px', color: '#2563eb' }} />, bg: '#eff6ff', border: '#bfdbfe' },
        { label: 'Sent', value: sentCount, icon: <Send style={{ width: '18px', height: '18px', color: '#7c3aed' }} />, bg: '#faf5ff', border: '#e9d5ff' },
        { label: 'Accepted', value: acceptedCount, icon: <CheckCircle style={{ width: '18px', height: '18px', color: '#16a34a' }} />, bg: '#f0fdf4', border: '#bbf7d0' },
        { label: 'Total Value', value: `Rs. ${totalValue.toLocaleString()}`, icon: <DollarSign style={{ width: '18px', height: '18px', color: '#ca8a04' }} />, bg: '#fefce8', border: '#fef08a', wide: true },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>
                        Quotes
                    </h1>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>View and manage all your quotes</p>
                </div>
                <Link to="/quote-builder" style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <button
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            height: '40px', padding: '0 18px',
                            background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
                            color: '#fff', fontWeight: '700', fontSize: '13.5px',
                            border: 'none', borderRadius: '9px', cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(37,99,235,0.28)', transition: 'transform 0.15s, box-shadow 0.15s',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(37,99,235,0.38)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(37,99,235,0.28)'; }}
                    >
                        <Plus style={{ width: '15px', height: '15px' }} />
                        New Quote
                    </button>
                </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px' }}>
                {stats.map(s => (
                    <div key={s.label} style={{
                        background: '#fff', border: '1px solid #f1f5f9', borderRadius: '14px',
                        padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        display: 'flex', alignItems: 'center', gap: '14px',
                    }}>
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '11px', flexShrink: 0,
                            background: s.bg, border: `1px solid ${s.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {s.icon}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ margin: '0 0 2px', fontSize: typeof s.value === 'string' ? '15px' : '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.value}
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table card */}
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>All Quotes</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>{quotes.length} records</span>
                </div>

                {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#94a3b8', gap: '10px' }}>
                        <Clock style={{ width: '18px', height: '18px' }} />
                        <span style={{ fontSize: '14px' }}>Loading quotes…</span>
                    </div>
                ) : quotes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <FileText style={{ width: '48px', height: '48px', color: '#e2e8f0', margin: '0 auto 12px' }} />
                        <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#374151' }}>No quotes yet</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Create your first quote to get started</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['Customer', 'Items', 'Amount', 'Status', 'Created', 'Actions'].map(h => (
                                        <th key={h} style={{
                                            padding: '10px 18px', textAlign: 'left',
                                            fontSize: '11.5px', fontWeight: '700', color: '#64748b',
                                            letterSpacing: '0.06em', textTransform: 'uppercase',
                                            borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {quotes.map((quote, idx) => (
                                    <tr
                                        key={quote.id}
                                        style={{ borderBottom: idx < quotes.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.12s' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#fafbff'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                                    >
                                        {/* Customer */}
                                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                                    background: 'linear-gradient(135deg,#eff6ff,#eef2ff)',
                                                    border: '1px solid #c7d2fe',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <User style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ margin: '0 0 1px', fontSize: '13.5px', fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {quote.customerName}
                                                    </p>
                                                    {quote.customerPhone && (
                                                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{quote.customerPhone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Items */}
                                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FileText style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                                                <span style={{ fontSize: '13.5px', color: '#374151', fontWeight: '600' }}>
                                                    {quote.items?.length || 0} items
                                                </span>
                                            </div>
                                        </td>
                                        {/* Amount */}
                                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                                            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap' }}>
                                                Rs. {Number(quote.finalAmount).toLocaleString()}
                                            </span>
                                        </td>
                                        {/* Status */}
                                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                                            <StatusBadge status={quote.status} />
                                        </td>
                                        {/* Created */}
                                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                                <Calendar style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                                                <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                                                    {new Date(quote.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Actions */}
                                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {quote.status === QuoteStatus.DRAFT && (
                                                    <Link to={`/quote-builder?draft=${quote.id}`} style={{ textDecoration: 'none' }}>
                                                        <IconBtn title="Continue editing">
                                                            <Pencil style={{ width: '14px', height: '14px' }} />
                                                        </IconBtn>
                                                    </Link>
                                                )}
                                                <Link to={`/quotes/${quote.id}`} style={{ textDecoration: 'none' }}>
                                                    <IconBtn title="View quote">
                                                        <Eye style={{ width: '14px', height: '14px' }} />
                                                    </IconBtn>
                                                </Link>
                                                <IconBtn title="Delete" danger onClick={() => {
                                                    if (confirm('Delete this quote?')) deleteMutation.mutate(quote.id);
                                                }}>
                                                    <Trash2 style={{ width: '14px', height: '14px' }} />
                                                </IconBtn>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}