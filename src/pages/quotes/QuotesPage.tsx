import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Plus, Eye, Pencil, Trash2, FileText,
    Calendar, User, DollarSign, Clock, Send, Users, FilePlus, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { quoteService, userService } from '../../services';
import { useAuth } from '../../contexts';
import { Pagination } from '../../components/ui';
import type { Quote } from '../../types';
import { QuoteStatus, UserRole } from '../../types';
import { pdf } from '@react-pdf/renderer';
import { QuotePDF } from '../../components/pdf/QuotePDF';

/* ── status config ── */
const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
    [QuoteStatus.DRAFT]: { label: 'Draft', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
    [QuoteStatus.CREATED]: { label: 'Created', bg: '#fdf4ff', color: '#c026d3', border: '#fce7f3' },
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

function IconBtn({ onClick, title, danger, disabled, children }: {
    onClick?: () => void; title?: string; danger?: boolean; disabled?: boolean; children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            disabled={disabled}
            style={{
                width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0',
                background: disabled ? '#f8fafc' : '#fff', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: danger ? '#dc2626' : (disabled ? '#cbd5e1' : '#374151'), transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
                if (disabled) return;
                e.currentTarget.style.background = danger ? '#fff1f2' : '#f8fafc';
                e.currentTarget.style.borderColor = danger ? '#fecaca' : '#cbd5e1';
            }}
            onMouseLeave={e => {
                if (disabled) return;
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#e2e8f0';
            }}
        >
            {children}
        </button>
    );
}

/* ── on-demand pdf downloader component ── */
function DownloadQuoteBtn({ quote }: { quote: Quote }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        const toastId = toast.loading('Generating PDF...');
        try {
            const blob = await pdf(<QuotePDF quote={quote} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Quote_${quote.customerName?.replace(/\s+/g, '_')}_${quote.id.slice(-6)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('PDF downloaded!', { id: toastId });
        } catch (error) {
            console.error('Failed to generate PDF', error);
            toast.error('Failed to generate PDF', { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <IconBtn title="Download PDF" onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? (
                <div style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    border: '2px solid #94a3b8', borderTopColor: '#374151',
                    animation: 'qd-spin 0.8s linear infinite',
                }} />
            ) : (
                <FileText style={{ width: '14px', height: '14px', color: '#374151' }} />
            )}
        </IconBtn>
    );
}

export function QuotesPage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [selectedAgentId, setSelectedAgentId] = useState<string>('ALL');
    const [page, setPage] = useState(1);
    const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);

    const isAdmin = user?.role === UserRole.ADMIN;

    const { data: agentsData } = useQuery({
        queryKey: ['sales-agents'],
        queryFn: () => userService.getSalesAgents({ limit: 100, roleFilter: 'BOTH' }),
        enabled: isAdmin,
    });

    // @ts-expect-error Backend returns data.data instead of data.items for this endpoint
    const allFetchedAccounts: User[] = agentsData?.data || agentsData?.items || [];
    const agentAccounts = allFetchedAccounts.filter(a => a.role === UserRole.SALES);

    const { data, isLoading } = useQuery({
        queryKey: ['quotes', selectedAgentId, page],
        queryFn: () => {
            // Handle custom role filtering system logic
            let roleFilterPayload: 'ADMIN' | 'SALES' | 'BOTH' | undefined = undefined;
            let userFilterPayload: string | undefined = undefined;

            if (selectedAgentId === 'ONLY_ADMINS') {
                roleFilterPayload = 'ADMIN';
            } else if (selectedAgentId === 'ONLY_AGENTS') {
                roleFilterPayload = 'SALES';
            } else if (selectedAgentId !== 'ALL') {
                userFilterPayload = selectedAgentId;
            }

            return quoteService.getAll({
                salesUserId: userFilterPayload,
                roleFilter: roleFilterPayload,
                page,
                limit: 10
            });
        },
        refetchOnMount: 'always',
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => quoteService.delete(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quotes'] }); toast.success('Quote deleted'); },
        onError: () => toast.error('Failed to delete quote'),
    });

    // @ts-expect-error Backend returns data.data instead of data.items for this endpoint
    const quotes: Quote[] = data?.data || data?.items || (Array.isArray(data) ? data : []);

    // @ts-expect-error Extract pagination details from flexible backend response
    const totalRecords = data?.totalCount ?? data?.total ?? quotes.length;
    const limit = (data as any)?.limit ?? 10;
    const totalPages = Math.ceil(totalRecords / limit);

    // Global stats from backend
    const statsData = (data as any)?.stats;
    const totalValue = statsData?.totalValue ?? quotes.reduce((s, q) => s + Number(q.finalAmount), 0);
    const sentCount = statsData?.sentCount ?? quotes.filter(q => q.status === QuoteStatus.SENT).length;
    const createdCount = statsData?.createdCount ?? quotes.filter(q => q.status === QuoteStatus.CREATED).length;
    const totalQuotes = statsData?.totalQuotes ?? totalRecords;

    const stats = [
        { label: 'Total Quotes', value: totalQuotes, icon: <FileText style={{ width: '18px', height: '18px', color: '#2563eb' }} />, bg: '#eff6ff', border: '#bfdbfe' },
        { label: 'Sent', value: sentCount, icon: <Send style={{ width: '18px', height: '18px', color: '#7c3aed' }} />, bg: '#faf5ff', border: '#e9d5ff' },
        { label: 'Created', value: createdCount, icon: <FilePlus style={{ width: '18px', height: '18px', color: '#c026d3' }} />, bg: '#fdf4ff', border: '#fce7f3' },
        { label: 'Total Value', value: `Rs. ${totalValue.toLocaleString()}`, icon: <DollarSign style={{ width: '18px', height: '18px', color: '#ca8a04' }} />, bg: '#fefce8', border: '#fef08a', wide: true },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <style>{`@keyframes qd-spin { to { transform:rotate(360deg); } }`}</style>

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isAdmin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
                            <Users style={{ width: '15px', height: '15px', color: '#2563eb' }} />
                        </div>
                        <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#475569' }}>Filter by Creator:</span>
                        <select
                            value={selectedAgentId}
                            onChange={e => {
                                setSelectedAgentId(e.target.value);
                                setPage(1);
                            }}
                            style={{
                                height: '34px', padding: '0 12px',
                                fontSize: '13px', color: '#0f172a', fontWeight: '500',
                                background: '#fff', border: '1.5px solid #e2e8f0',
                                borderRadius: '8px', outline: 'none', cursor: 'pointer',
                                minWidth: '200px', transition: 'border-color 0.15s, box-shadow 0.15s'
                            }}
                            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                        >
                            <option value="ALL">All Quotes</option>
                            <option value="ONLY_ADMINS">Created by Admin</option>
                            <option value="ONLY_AGENTS">Created by Sales Agents</option>
                            {agentAccounts.length > 0 && (
                                <optgroup label="Filter by Agent">
                                    {agentAccounts.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.fullName || agent.email}</option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>
                )}

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
            </div>

            {/* Table card */}
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>All Quotes</span>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        totalRecords={totalRecords}
                    />
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
                                    {['Customer', isAdmin ? 'Sales Agent' : null, 'Items', 'Amount', 'Status', 'Created', 'Actions'].filter(Boolean).map(h => (
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
                                        {/* Sales Agent (Admin Only) */}
                                        {isAdmin && (
                                            <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                                        background: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569' }}>
                                                            {quote.createdBy?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                                                        {quote.createdBy?.fullName || quote.createdBy?.email || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                        )}
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
                                                <Link to={`/quote-builder?draft=${quote.id}`} style={{ textDecoration: 'none' }}>
                                                    <IconBtn title="Edit quote">
                                                        <Pencil style={{ width: '14px', height: '14px' }} />
                                                    </IconBtn>
                                                </Link>
                                                <DownloadQuoteBtn quote={quote} />
                                                <Link to={`/quotes/${quote.id}`} style={{ textDecoration: 'none' }}>
                                                    <IconBtn title="View quote">
                                                        <Eye style={{ width: '14px', height: '14px' }} />
                                                    </IconBtn>
                                                </Link>
                                                <IconBtn title="Delete" danger onClick={() => setQuoteToDelete(quote.id)}>
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

            {/* Delete Confirmation Modal */}
            {quoteToDelete && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 200,
                        background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                    }}
                    onClick={e => { if (e.target === e.currentTarget) setQuoteToDelete(null); }}
                >
                    <div style={{
                        width: '100%', maxWidth: '400px',
                        background: '#fff', borderRadius: '16px',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
                        overflow: 'hidden',
                        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '18px 22px 14px',
                            borderBottom: '1px solid #f1f5f9',
                        }}>
                            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.2px' }}>
                                Delete Quote
                            </h2>
                            <button onClick={() => setQuoteToDelete(null)} style={{
                                width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e2e8f0',
                                background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}
                            >
                                <X style={{ width: '14px', height: '14px' }} />
                            </button>
                        </div>
                        <div style={{ padding: '20px 22px 22px' }}>
                            <p style={{ margin: '0 0 24px', fontSize: '13.5px', color: '#475569', lineHeight: '1.5' }}>
                                Are you sure you want to delete this quote? This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button onClick={() => setQuoteToDelete(null)} style={{
                                    height: '38px', padding: '0 18px', borderRadius: '9px', border: '1.5px solid #e2e8f0',
                                    background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151', transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        deleteMutation.mutate(quoteToDelete);
                                        setQuoteToDelete(null);
                                    }}
                                    disabled={deleteMutation.isPending}
                                    style={{
                                        height: '38px', padding: '0 20px', borderRadius: '9px', border: 'none',
                                        background: '#ef4444', color: '#fff',
                                        fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                                        boxShadow: '0 2px 10px rgba(239, 68, 68, 0.28)', transition: 'transform 0.15s, box-shadow 0.15s',
                                        opacity: deleteMutation.isPending ? 0.7 : 1,
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.38)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(239, 68, 68, 0.28)'; }}
                                >
                                    {deleteMutation.isPending ? 'Deleting...' : 'Delete Quote'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}