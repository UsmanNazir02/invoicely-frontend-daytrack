import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Wrench, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { serviceItemService } from '../../services';
import type { ServiceItem, CreateServiceItemDto } from '../../types';
import { Pagination } from '../../components/ui';

const serviceItemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    price: z.coerce.number().min(0, 'Price must be positive'),
    unit: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
});
type ServiceItemFormData = z.infer<typeof serviceItemSchema>;

type BadgeCfg = { bg: string; color: string; border: string };
const activeCfg: BadgeCfg = { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
const inactiveCfg: BadgeCfg = { bg: '#fff1f2', color: '#dc2626', border: '#fecaca' };

const inputBase: React.CSSProperties = {
    width: '100%', height: '40px', padding: '0 12px',
    fontSize: '13.5px', color: '#1e293b',
    background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: '9px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
    fontFamily: 'inherit',
};

function FocusInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input {...props}
            style={{ ...inputBase, ...props.style }}
            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
        />
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>{children}</label>;
}

function ErrorMsg({ msg }: { msg?: string }) {
    if (!msg) return null;
    return <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#ef4444' }}>{msg}</p>;
}

function Pill({ cfg, label }: { cfg: BadgeCfg; label: string }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
            borderRadius: '20px', fontSize: '12px', fontWeight: '700',
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap',
        }}>{label}</span>
    );
}

function IconBtn({ onClick, title, danger, children }: { onClick?: () => void; title?: string; danger?: boolean; children: React.ReactNode }) {
    return (
        <button onClick={onClick} title={title} style={{
            width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0',
            background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: danger ? '#dc2626' : '#374151', transition: 'background 0.15s, border-color 0.15s',
        }}
            onMouseEnter={e => { e.currentTarget.style.background = danger ? '#fff1f2' : '#f8fafc'; e.currentTarget.style.borderColor = danger ? '#fecaca' : '#cbd5e1'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >{children}</button>
    );
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ width: '100%', maxWidth: '520px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.2px' }}>{title}</h2>
                    <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}
                    ><X style={{ width: '14px', height: '14px' }} /></button>
                </div>
                <div style={{ padding: '20px 22px 22px' }}>{children}</div>
            </div>
        </div>
    );
}

export function ServiceItemsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({ queryKey: ['service-items', page], queryFn: () => serviceItemService.getAll({ page, limit: 10 }) });

    const createMutation = useMutation({
        mutationFn: (d: CreateServiceItemDto) => serviceItemService.create(d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['service-items'] }); toast.success('Service item created'); closeModal(); },
        onError: () => toast.error('Failed to create service item'),
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateServiceItemDto }) => serviceItemService.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['service-items'] }); toast.success('Service item updated'); closeModal(); },
        onError: () => toast.error('Failed to update service item'),
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => serviceItemService.delete(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['service-items'] }); toast.success('Service item deleted'); },
        onError: () => toast.error('Failed to delete service item'),
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceItemFormData>({ resolver: zodResolver(serviceItemSchema) });

    const openCreateModal = () => { setEditingItem(null); reset({ name: '', price: 0, unit: '', description: '', isActive: true }); setIsModalOpen(true); };
    const openEditModal = (item: ServiceItem) => { setEditingItem(item); reset({ name: item.name, price: item.price, unit: item.unit || '', description: item.description || '', isActive: item.isActive }); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingItem(null); reset(); };
    const onSubmit = (d: ServiceItemFormData) => editingItem ? updateMutation.mutate({ id: editingItem.id, data: d }) : createMutation.mutate(d);

    // @ts-expect-error Backend returns data.data instead of data.items for this endpoint
    const items: ServiceItem[] = data?.items || data?.data || (Array.isArray(data) ? data : []);
    const totalRecords = (data as any)?.totalCount ?? (data as any)?.total ?? items.length;
    const limit = (data as any)?.limit ?? 10;
    const totalPages = Math.ceil(totalRecords / limit);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>Services</h1>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>Manage service items (priced per system size)</p>
                </div>
                <button onClick={openCreateModal} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    height: '40px', padding: '0 18px', flexShrink: 0,
                    background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff',
                    fontWeight: '700', fontSize: '13.5px', border: 'none', borderRadius: '9px',
                    cursor: 'pointer', boxShadow: '0 2px 10px rgba(37,99,235,0.28)',
                    transition: 'transform 0.15s, box-shadow 0.15s', whiteSpace: 'nowrap',
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(37,99,235,0.38)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(37,99,235,0.28)'; }}
                >
                    <Plus style={{ width: '15px', height: '15px' }} /> Add Service
                </button>
            </div>

            {/* ── Table card ── */}
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>All Services</span>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalRecords={totalRecords} />
                </div>

                {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px' }}>Loading…</div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Wrench style={{ width: '40px', height: '40px', color: '#e2e8f0', margin: '0 auto 10px' }} />
                        <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#374151' }}>No service items yet</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Add your first service to get started</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '580px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['Name', 'Price (per kW×1000)', 'Unit', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: '11.5px', fontWeight: '700', color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={item.id}
                                        style={{ borderBottom: idx < items.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.12s' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#fafbff'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                                    >
                                        {/* Name */}
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Wrench style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>{item.name}</span>
                                                    {item.description && <p style={{ margin: '1px 0 0', fontSize: '12px', color: '#64748b' }}>{item.description}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Price */}
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle' }}>
                                            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>Rs. {Number(item.price).toLocaleString()}</span>
                                        </td>
                                        {/* Unit */}
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle' }}>
                                            {item.unit
                                                ? <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>per {item.unit}</span>
                                                : <span style={{ fontSize: '13px', color: '#94a3b8' }}>—</span>
                                            }
                                        </td>
                                        {/* Status */}
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle' }}>
                                            <Pill cfg={item.isActive ? activeCfg : inactiveCfg} label={item.isActive ? 'Active' : 'Inactive'} />
                                        </td>
                                        {/* Actions */}
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <IconBtn title="Edit" onClick={() => openEditModal(item)}>
                                                    <Pencil style={{ width: '14px', height: '14px' }} />
                                                </IconBtn>
                                                <IconBtn title="Delete" danger onClick={() => { if (confirm('Delete this service item?')) deleteMutation.mutate(item.id); }}>
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

            {/* ── Modal ── */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Edit Service' : 'Add Service'}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Name */}
                        <div>
                            <FieldLabel>Name</FieldLabel>
                            <FocusInput placeholder="Enter service name" {...register('name')} />
                            <ErrorMsg msg={errors.name?.message} />
                        </div>

                        {/* Row: Price + Unit */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <FieldLabel>Rate (Rs.)</FieldLabel>
                                <FocusInput type="number" placeholder="Enter rate" {...register('price')} />
                                <ErrorMsg msg={errors.price?.message} />
                            </div>
                            <div>
                                <FieldLabel>Unit</FieldLabel>
                                <FocusInput placeholder="e.g., kW, fixed" {...register('unit')} />
                                <ErrorMsg msg={errors.unit?.message} />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <FieldLabel>Description</FieldLabel>
                            <FocusInput placeholder="Optional description" {...register('description')} />
                            <ErrorMsg msg={errors.description?.message} />
                        </div>

                        {/* Active toggle */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer', flexShrink: 0 }} {...register('isActive')} />
                            <div>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Active Service</p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Visible in quote builder when active</p>
                            </div>
                        </label>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
                            <button type="button" onClick={closeModal} style={{
                                height: '38px', padding: '0 18px', borderRadius: '9px', border: '1.5px solid #e2e8f0',
                                background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151', transition: 'background 0.15s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                            >Cancel</button>
                            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{
                                height: '38px', padding: '0 20px', borderRadius: '9px', border: 'none',
                                background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff',
                                fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                                boxShadow: '0 2px 10px rgba(37,99,235,0.28)', transition: 'transform 0.15s, box-shadow 0.15s',
                                opacity: createMutation.isPending || updateMutation.isPending ? 0.7 : 1,
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.38)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(37,99,235,0.28)'; }}
                            >
                                {editingItem ? 'Update Service' : 'Create Service'}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
