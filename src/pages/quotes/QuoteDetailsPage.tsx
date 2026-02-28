import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft, FileText, Calendar, User, Phone,
    Mail, MapPin, Package, DollarSign, Pencil, Plus,
} from 'lucide-react';
import { quoteService } from '../../services';
import type { Quote, QuoteItem } from '../../types';
import { QuoteStatus } from '../../types';

/* ── reused status badge ── */
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
            display: 'inline-flex', alignItems: 'center',
            padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
        }}>
            {cfg.label}
        </span>
    );
}

/* ── info row ── */
function InfoRow({ icon, value }: { icon: React.ReactNode; value: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: '#94a3b8', marginTop: '1px', flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: '13.5px', color: '#374151', wordBreak: 'break-word' }}>{value}</span>
        </div>
    );
}

/* ── section card ── */
function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div style={{
            background: '#fff', border: '1px solid #f1f5f9', borderRadius: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
        }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#2563eb' }}>{icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{title}</span>
            </div>
            <div style={{ padding: '16px 18px' }}>{children}</div>
        </div>
    );
}

export function QuoteDetailsPage() {
    const { id } = useParams<{ id: string }>();

    const { data: quote, isLoading } = useQuery({
        queryKey: ['quotes', id],
        queryFn: () => quoteService.getById(id!),
        enabled: !!id,
        refetchOnMount: 'always',
    });

    const items = useMemo(() => quote?.items ?? [], [quote]);

    if (isLoading || !quote) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        border: '3px solid #bfdbfe', borderTopColor: '#2563eb',
                        margin: '0 auto 12px', animation: 'qd-spin 0.8s linear infinite',
                    }} />
                    <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Loading quote…</p>
                </div>
                <style>{`@keyframes qd-spin { to { transform:rotate(360deg); } }`}</style>
            </div>
        );
    }

    const q = quote as Quote;

    const subtotal = Number(q.totalAmount);
    const discountAmt = Number(q.discountAmount);
    const discountPct = Number(q.discountPercentage);
    const finalAmt = Number(q.finalAmount);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link to="/quotes" style={{ textDecoration: 'none' }}>
                        <button
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                height: '36px', padding: '0 12px',
                                border: '1px solid #e2e8f0', borderRadius: '9px',
                                background: '#fff', cursor: 'pointer', fontSize: '13px',
                                fontWeight: '600', color: '#374151', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                        >
                            <ArrowLeft style={{ width: '14px', height: '14px' }} />
                            Back
                        </button>
                    </Link>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>
                                Quote
                            </h1>
                            <StatusBadge status={q.status} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#94a3b8' }}>
                            <Calendar style={{ width: '13px', height: '13px' }} />
                            <span style={{ fontSize: '12.5px' }}>
                                Created {new Date(q.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Link to={`/quote-builder?draft=${q.id}`} style={{ textDecoration: 'none' }}>
                        <button
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                height: '38px', padding: '0 16px', borderRadius: '9px',
                                border: '1.5px solid #e2e8f0', background: '#fff',
                                cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                        >
                            <Pencil style={{ width: '14px', height: '14px' }} />
                            Edit Quote
                        </button>
                    </Link>
                    <Link to="/quote-builder" style={{ textDecoration: 'none' }}>
                        <button
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                height: '38px', padding: '0 16px', borderRadius: '9px', border: 'none',
                                background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
                                color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
                                boxShadow: '0 2px 10px rgba(37,99,235,0.28)',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.38)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(37,99,235,0.28)'; }}
                        >
                            <Plus style={{ width: '14px', height: '14px' }} />
                            New Quote
                        </button>
                    </Link>
                </div>
            </div>

            {/* ── Body: 2-col grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

                {/* LEFT: items table */}
                <div>
                    <SectionCard
                        title={`Quote Items (${items.length})`}
                        icon={<FileText style={{ width: '16px', height: '16px' }} />}
                    >
                        {items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                                <Package style={{ width: '36px', height: '36px', margin: '0 auto 8px', opacity: 0.4 }} />
                                <p style={{ margin: 0, fontSize: '13px' }}>No items in this quote</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', margin: '-16px -18px -16px', padding: '0' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            {['Item', 'Qty', 'Unit Price', 'Total'].map(h => (
                                                <th key={h} style={{
                                                    padding: '10px 16px', textAlign: 'left',
                                                    fontSize: '11px', fontWeight: '700', color: '#64748b',
                                                    letterSpacing: '0.06em', textTransform: 'uppercase',
                                                    borderBottom: '1px solid #f1f5f9',
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item: QuoteItem, idx: number) => (
                                            <tr
                                                key={item.id}
                                                style={{ borderBottom: idx < items.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.12s' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#fafbff'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                                            >
                                                <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{
                                                            width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                                                            background: '#f8fafc', border: '1px solid #f1f5f9',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            <Package style={{ width: '15px', height: '15px', color: '#64748b' }} />
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <p style={{ margin: '0 0 2px', fontSize: '13.5px', fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {item.itemName}
                                                            </p>
                                                            <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', textTransform: 'capitalize' }}>
                                                                {item.itemType.replace(/_/g, ' ')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        minWidth: '28px', height: '24px', padding: '0 8px',
                                                        background: '#f1f5f9', borderRadius: '6px',
                                                        fontSize: '13px', fontWeight: '700', color: '#374151',
                                                    }}>
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                                                    <span style={{ fontSize: '13.5px', color: '#374151' }}>
                                                        Rs. {Number(item.unitPrice).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                                                    <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                                                        Rs. {Number(item.totalPrice).toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* RIGHT: customer + pricing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: '80px' }}>

                    {/* Customer */}
                    <SectionCard title="Customer" icon={<User style={{ width: '16px', height: '16px' }} />}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Avatar row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg,#eff6ff,#eef2ff)',
                                    border: '1px solid #c7d2fe',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#2563eb' }}>
                                        {q.customerName?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{q.customerName}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px', borderTop: '1px solid #f8fafc' }}>
                                {q.customerPhone && <InfoRow icon={<Phone style={{ width: '14px', height: '14px' }} />} value={q.customerPhone} />}
                                {q.customerEmail && <InfoRow icon={<Mail style={{ width: '14px', height: '14px' }} />} value={q.customerEmail} />}
                                {q.customerAddress && <InfoRow icon={<MapPin style={{ width: '14px', height: '14px' }} />} value={q.customerAddress} />}
                            </div>
                        </div>
                    </SectionCard>

                    {/* Pricing */}
                    <SectionCard title="Pricing" icon={<DollarSign style={{ width: '16px', height: '16px' }} />}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>Subtotal</span>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Rs. {subtotal.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>Discount</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#dc2626' }}>
                                    {discountPct}% (– Rs. {discountAmt.toLocaleString()})
                                </span>
                            </div>
                            <div style={{
                                paddingTop: '10px', borderTop: '1px solid #f1f5f9',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Total</span>
                                <span style={{ fontSize: '16px', fontWeight: '800', color: '#2563eb' }}>
                                    Rs. {finalAmt.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Notes */}
                    {q.notes && (
                        <div style={{
                            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px',
                            padding: '14px 16px',
                        }}>
                            <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#78350f', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{q.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}