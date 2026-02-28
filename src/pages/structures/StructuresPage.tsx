import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Building, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { structureService } from '../../services';
import type { Structure, CreateStructureDto } from '../../types';
import { StructureType } from '../../types';
import { Pagination } from '../../components/ui';

const structureSchema = z.object({
    type: z.enum([StructureType.GROUND_MOUNT, StructureType.ELEVATED, StructureType.ROOFTOP], { message: 'Type is required' }),
    price: z.coerce.number().min(0, 'Price must be positive'),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
});
type StructureFormData = z.infer<typeof structureSchema>;
type StructureFormValues = z.input<typeof structureSchema>;

const structureTypeLabels: Record<string, string> = {
    [StructureType.GROUND_MOUNT]: 'Ground Mount',
    [StructureType.ELEVATED]: 'Elevated',
    [StructureType.ROOFTOP]: 'Rooftop',
};

type BadgeCfg = { bg: string; color: string; border: string };
const activeCfg: BadgeCfg = { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
const inactiveCfg: BadgeCfg = { bg: '#fff1f2', color: '#dc2626', border: '#fecaca' };
const groundCfg: BadgeCfg = { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' };
const elevatedCfg: BadgeCfg = { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
const rooftopCfg: BadgeCfg = { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' };

function typeCfg(type: string): BadgeCfg {
    if (type === StructureType.GROUND_MOUNT) return groundCfg;
    if (type === StructureType.ELEVATED) return elevatedCfg;
    return rooftopCfg;
}

/* ── shared style primitives ── */
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

function FocusSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select {...props}
            style={{ ...inputBase, appearance: 'none', cursor: 'pointer', paddingRight: '36px', ...props.style }}
            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
        />
    );
}

const Chevron = () => (
    <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>{children}</label>;
}

function ErrorMsg({ msg }: { msg?: string }) {
    if (!msg) return null;
    return <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#ef4444' }}>{msg}</p>;
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

function Pill({ cfg, label }: { cfg: BadgeCfg; label: string }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
            borderRadius: '20px', fontSize: '12px', fontWeight: '700',
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap',
        }}>{label}</span>
    );
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ width: '100%', maxWidth: '440px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
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

export function StructuresPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStructure, setEditingStructure] = useState<Structure | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({ queryKey: ['structures', page], queryFn: () => structureService.getAll({ page, limit: 10 }) });

    const createMutation = useMutation({
        mutationFn: (d: CreateStructureDto) => structureService.create(d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['structures'] }); toast.success('Structure created'); closeModal(); },
        onError: () => toast.error('Failed to create structure'),
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateStructureDto }) => structureService.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['structures'] }); toast.success('Structure updated'); closeModal(); },
        onError: () => toast.error('Failed to update structure'),
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => structureService.delete(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['structures'] }); toast.success('Structure deleted'); },
        onError: () => toast.error('Failed to delete structure'),
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<StructureFormValues, unknown, StructureFormData>({ resolver: zodResolver(structureSchema) });

    const openCreateModal = () => { setEditingStructure(null); reset({ type: StructureType.ROOFTOP, price: 0, description: '', isActive: true }); setIsModalOpen(true); };
    const openEditModal = (s: Structure) => { setEditingStructure(s); reset({ type: s.type as StructureFormData['type'], price: s.price, description: s.description || '', isActive: s.isActive }); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingStructure(null); reset(); };
    const onSubmit = (d: StructureFormData) => editingStructure ? updateMutation.mutate({ id: editingStructure.id, data: d }) : createMutation.mutate(d);

    // @ts-expect-error Backend returns data.data instead of data.items for this endpoint
    const structures: Structure[] = data?.items || data?.data || (Array.isArray(data) ? data : []);
    const totalRecords = (data as any)?.totalCount ?? (data as any)?.total ?? structures.length;
    const limit = (data as any)?.limit ?? 10;
    const totalPages = Math.ceil(totalRecords / limit);

    const filtered = structures.filter(s => s.type.toLowerCase().includes(searchTerm.toLowerCase()) || (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase())));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>Structures</h1>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>Manage your mounting structure types</p>
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
                    <Plus style={{ width: '15px', height: '15px' }} /> Add Structure
                </button>
            </div>

            {/* Table card */}
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>All Structures</span>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            totalRecords={totalRecords}
                        />
                    </div>
                    <div style={{ position: 'relative', width: '220px' }}>
                        <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input
                            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                            placeholder="Search structures…"
                            style={{ ...inputBase, height: '36px', paddingLeft: '32px', fontSize: '13px' }} />
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px' }}>Loading…</div>
                ) : structures.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Building style={{ width: '40px', height: '40px', color: '#e2e8f0', margin: '0 auto 10px' }} />
                        <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#374151' }}>No structures yet</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Add your first structure to get started</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['Type', 'Price', 'Description', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: '11.5px', fontWeight: '700', color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, idx) => (
                                    <tr key={s.id}
                                        style={{ borderBottom: idx < structures.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.12s' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#fafbff'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                                    >
                                        {/* Type */}
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#faf5ff', border: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Building style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
                                                </div>
                                                <Pill cfg={typeCfg(s.type)} label={structureTypeLabels[s.type] ?? s.type} />
                                            </div>
                                        </td>
                                        {/* Price */}
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle' }}>
                                            <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>Rs. {Number(s.price).toLocaleString()}</span>
                                        </td>
                                        {/* Description */}
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle', maxWidth: '260px' }}>
                                            {s.description
                                                ? <span style={{ fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{s.description}</span>
                                                : <span style={{ fontSize: '13px', color: '#94a3b8' }}>—</span>
                                            }
                                        </td>
                                        {/* Status */}
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle' }}>
                                            <Pill cfg={s.isActive ? activeCfg : inactiveCfg} label={s.isActive ? 'Active' : 'Inactive'} />
                                        </td>
                                        {/* Actions */}
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <IconBtn title="Edit" onClick={() => openEditModal(s)}>
                                                    <Pencil style={{ width: '14px', height: '14px' }} />
                                                </IconBtn>
                                                <IconBtn title="Delete" danger onClick={() => { if (confirm('Delete this structure?')) deleteMutation.mutate(s.id); }}>
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

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingStructure ? 'Edit Structure' : 'Add Structure'}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Type */}
                        <div>
                            <FieldLabel>Structure Type</FieldLabel>
                            <div style={{ position: 'relative' }}>
                                <FocusSelect {...register('type')}>
                                    {Object.entries(structureTypeLabels).map(([val, lbl]) => (
                                        <option key={val} value={val}>{lbl}</option>
                                    ))}
                                </FocusSelect>
                                <Chevron />
                            </div>
                            <ErrorMsg msg={errors.type?.message} />
                        </div>

                        {/* Price */}
                        <div>
                            <FieldLabel>Price (Rs.)</FieldLabel>
                            <FocusInput type="number" placeholder="Enter price" {...register('price')} />
                            <ErrorMsg msg={errors.price?.message} />
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
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Active Structure</p>
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
                                {editingStructure ? 'Update Structure' : 'Create Structure'}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}