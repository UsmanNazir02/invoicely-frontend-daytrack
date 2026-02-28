import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Users, Search, X, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services';
import type { CreateSalesAgentDto, UpdateSalesAgentDto } from '../../services/user.service';
import { Pagination } from '../../components/ui';
import type { User } from '../../types';

const salesAgentSchema = z.object({
    fullName: z.string().min(1, 'Full Name is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SalesAgentFormData = z.infer<typeof salesAgentSchema>;

const editAgentSchema = z.object({
    fullName: z.string().min(1, 'Full Name is required'),
    email: z.string().email('Valid email is required'),
    password: z.union([z.string().min(6, 'Password must be at least 6 characters'), z.literal(''), z.undefined()]),
});

type EditAgentFormData = z.infer<typeof editAgentSchema>;

/* ── shared primitives ── */
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
        <input
            {...props}
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

/* ── status / type badges ── */
type BadgeCfg = { bg: string; color: string; border: string };
const activeCfg: BadgeCfg = { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
const inactiveCfg: BadgeCfg = { bg: '#fff1f2', color: '#dc2626', border: '#fecaca' };

function Pill({ cfg, label }: { cfg: BadgeCfg; label: string }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
            borderRadius: '20px', fontSize: '12px', fontWeight: '700',
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap',
        }}>{label}</span>
    );
}

/* ── modal backdrop + card ── */
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                width: '100%', maxWidth: '440px',
                background: '#fff', borderRadius: '16px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
                overflow: 'hidden',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 22px 14px',
                    borderBottom: '1px solid #f1f5f9',
                }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.2px' }}>{title}</h2>
                    <button onClick={onClose} style={{
                        width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}
                    ><X style={{ width: '14px', height: '14px' }} /></button>
                </div>
                <div style={{ padding: '20px 22px 22px' }}>{children}</div>
            </div>
        </div>
    );
}

export function SalesAgentsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
    const [deleteInput, setDeleteInput] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['sales-agents', page],
        queryFn: () => userService.getSalesAgents({ page, limit: 10 })
    });

    const createMutation = useMutation({
        mutationFn: (d: CreateSalesAgentDto) => userService.createSalesAgent(d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales-agents'] }); toast.success('Sales Agent created'); closeCreateModal(); },
        onError: (error: any) => {
            const msg = error.response?.data?.message || error.message || 'Failed to create sales agent';
            toast.error(msg);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSalesAgentDto }) => userService.updateSalesAgent(id, data),
        onSuccess: (updatedAgent) => {
            queryClient.invalidateQueries({ queryKey: ['sales-agents'] });
            toast.success('Sales Agent updated');

            // Sync `selectedAgent` if it's currently open
            if (selectedAgent && selectedAgent.id === updatedAgent.id) {
                setSelectedAgent(updatedAgent);
            }

            closeEditModal();
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || error.message || 'Failed to update sales agent';
            toast.error(msg);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => userService.deleteSalesAgent(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales-agents'] }); toast.success('Sales Agent deleted'); closeDeleteModal(); },
        onError: (error: any) => {
            const msg = error.response?.data?.message || error.message || 'Failed to delete sales agent';
            toast.error(msg);
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => userService.updateSalesAgent(id, { isActive }),
        onSuccess: (updatedAgent, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sales-agents'] });
            toast.success(`Sales Agent ${variables.isActive ? 'activated' : 'deactivated'}`);

            // Sync `selectedAgent` to reflect changes immediately in modal
            if (selectedAgent && selectedAgent.id === updatedAgent.id) {
                setSelectedAgent(updatedAgent);
            }
        },
        onError: (error: any) => { toast.error('Failed to change status: ' + (error.response?.data?.message || error.message)); },
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<SalesAgentFormData>({ resolver: zodResolver(salesAgentSchema) });
    const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEdit, setValue: setEditValue, formState: { errors: editErrors } } = useForm<EditAgentFormData>({
        resolver: zodResolver(editAgentSchema)
    });

    const openCreateModal = () => { reset({ fullName: '', email: '', password: '' }); setIsCreateModalOpen(true); };
    const closeCreateModal = () => { setIsCreateModalOpen(false); reset(); };
    const onSubmitCreate = (d: SalesAgentFormData) => createMutation.mutate(d);

    const openEditModal = (agent: User) => {
        setSelectedAgent(agent);
        setEditValue('fullName', agent.fullName || '');
        setEditValue('email', agent.email || '');
        setEditValue('password', undefined); // Clear password field initially
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => { setIsEditModalOpen(false); setSelectedAgent(null); resetEdit(); };
    const onSubmitEdit = (d: EditAgentFormData) => {
        if (!selectedAgent) return;
        const payload: UpdateSalesAgentDto = {
            fullName: d.fullName,
            email: d.email,
        };
        if (d.password && d.password.trim() !== '') {
            payload.password = d.password;
        }
        updateMutation.mutate({ id: selectedAgent.id, data: payload });
    };

    const openDeleteModal = (agent: User) => { setSelectedAgent(agent); setDeleteInput(''); setIsDeleteModalOpen(true); };
    const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedAgent(null); setDeleteInput(''); };
    const onConfirmDelete = () => {
        if (deleteInput.toLowerCase() === 'delete' && selectedAgent) {
            deleteMutation.mutate(selectedAgent.id);
        }
    };

    // @ts-expect-error Backend returns data.data instead of data.items for this endpoint
    const agents: User[] = data?.data || data?.items || (Array.isArray(data) ? data : []);

    // @ts-expect-error Extract pagination details from flexible backend response
    const totalRecords = data?.totalCount ?? data?.total ?? agents.length;
    const limit = (data as any)?.limit ?? 10;
    const totalPages = Math.ceil(totalRecords / limit);

    const filtered = agents.filter(a =>
        a.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>Sales Agents</h1>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>Manage your sales team members</p>
                </div>
                <button onClick={openCreateModal} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    height: '40px', padding: '0 18px', flexShrink: 0,
                    background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff',
                    fontWeight: '700', fontSize: '13.5px', border: 'none', borderRadius: '9px',
                    cursor: 'pointer', boxShadow: '0 2px 10px rgba(37,99,235,0.28)', transition: 'transform 0.15s, box-shadow 0.15s', whiteSpace: 'nowrap',
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(37,99,235,0.38)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(37,99,235,0.28)'; }}
                >
                    <Plus style={{ width: '15px', height: '15px' }} /> Add Agent
                </button>
            </div>

            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>All Agents</span>
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
                            placeholder="Search agents…"
                            style={{ ...inputBase, height: '36px', paddingLeft: '32px', fontSize: '13px' }}
                            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px' }}>Loading…</div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Users style={{ width: '40px', height: '40px', color: '#e2e8f0', margin: '0 auto 10px' }} />
                        <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#374151' }}>No sales agents found</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Add your first sales agent to get started</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '10px 18px', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: '11.5px', fontWeight: '700', color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((agent, idx) => (
                                    <tr key={agent.id}
                                        style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 0.12s' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#fafbff'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                                    >
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#3730a3' }}>
                                                        {agent.fullName?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>{agent.fullName}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle', fontSize: '13.5px', color: '#475569' }}>
                                            {agent.email}
                                        </td>
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Sales Person</span>
                                        </td>
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle' }}>
                                            <Pill cfg={agent.isActive ? activeCfg : inactiveCfg} label={agent.isActive ? 'Active' : 'Inactive'} />
                                        </td>
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle', fontSize: '13px', color: '#64748b' }}>
                                            {new Date(agent.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '13px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button onClick={() => openEditModal(agent)} title="Edit Agent" style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.15s' }}>
                                                    <Pencil style={{ width: '14px', height: '14px' }} />
                                                </button>
                                                <button onClick={() => openDeleteModal(agent)} title="Delete Agent" style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff1f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', transition: 'all 0.15s' }}>
                                                    <Trash2 style={{ width: '14px', height: '14px' }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Add Sales Agent">
                <form onSubmit={handleSubmit(onSubmitCreate)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <FieldLabel>Full Name</FieldLabel>
                            <FocusInput placeholder="Enter full name" {...register('fullName')} />
                            <ErrorMsg msg={errors.fullName?.message} />
                        </div>

                        <div>
                            <FieldLabel>Email Address</FieldLabel>
                            <FocusInput type="email" placeholder="agent@company.com" {...register('email')} />
                            <ErrorMsg msg={errors.email?.message} />
                        </div>

                        <div>
                            <FieldLabel>Password</FieldLabel>
                            <FocusInput type="password" placeholder="Min 6 characters" {...register('password')} />
                            <ErrorMsg msg={errors.password?.message} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
                            <button type="button" onClick={closeCreateModal} style={{
                                height: '38px', padding: '0 18px', borderRadius: '9px', border: '1.5px solid #e2e8f0',
                                background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151', transition: 'background 0.15s',
                            }}>Cancel</button>
                            <button type="submit" disabled={createMutation.isPending} style={{
                                height: '38px', padding: '0 20px', borderRadius: '9px', border: 'none',
                                background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff',
                                fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                                opacity: createMutation.isPending ? 0.7 : 1,
                            }}>
                                {createMutation.isPending ? 'Creating...' : 'Create Agent'}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Sales Agent">
                <form onSubmit={handleEditSubmit(onSubmitEdit)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <FieldLabel>Full Name</FieldLabel>
                            <FocusInput placeholder="Enter full name" {...registerEdit('fullName')} />
                            <ErrorMsg msg={editErrors.fullName?.message} />
                        </div>

                        <div>
                            <FieldLabel>Email Address</FieldLabel>
                            <FocusInput type="email" placeholder="agent@company.com" {...registerEdit('email')} />
                            <ErrorMsg msg={editErrors.email?.message} />
                        </div>

                        <div>
                            <FieldLabel>New Password (Optional)</FieldLabel>
                            <FocusInput type="password" placeholder="Leave blank to keep unchanged" {...registerEdit('password')} />
                            <ErrorMsg msg={editErrors.password?.message} />
                            <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#64748b' }}>If provided, must be at least 6 characters.</p>
                        </div>

                        {selectedAgent && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: selectedAgent.isActive ? '#f0fdf4' : '#fff1f2', borderRadius: '8px', border: `1px solid ${selectedAgent.isActive ? '#bbf7d0' : '#fecaca'}`, marginTop: '4px' }}>
                                <div>
                                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: selectedAgent.isActive ? '#16a34a' : '#dc2626' }}>
                                        {selectedAgent.isActive ? 'Agent is Active' : 'Agent is Deactivated'}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                                        {selectedAgent.isActive ? 'They can log in normally.' : 'They currently cannot log in.'}
                                    </p>
                                </div>
                                <button type="button"
                                    onClick={() => toggleStatusMutation.mutate({ id: selectedAgent.id, isActive: !selectedAgent.isActive })}
                                    style={{
                                        height: '32px', padding: '0 14px', borderRadius: '6px', border: 'none',
                                        background: selectedAgent.isActive ? '#eab308' : '#10b981', color: '#fff',
                                        fontWeight: '600', fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s'
                                    }}>
                                    {selectedAgent.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
                            <button type="button" onClick={closeEditModal} style={{
                                height: '38px', padding: '0 18px', borderRadius: '9px', border: '1.5px solid #e2e8f0',
                                background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151', transition: 'background 0.15s',
                            }}>Cancel</button>
                            <button type="submit" disabled={updateMutation.isPending} style={{
                                height: '38px', padding: '0 20px', borderRadius: '9px', border: 'none',
                                background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff',
                                fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                                opacity: updateMutation.isPending ? 0.7 : 1,
                            }}>
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Delete Sales Agent">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: '#fff1f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
                        <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '700', color: '#b91c1c' }}>Warning!</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#991b1b', lineHeight: 1.5 }}>
                            You are about to delete the sales agent <strong>{selectedAgent?.fullName}</strong>. This will deactivate their login and hide their profile. To confirm, please type <strong>delete</strong> below.
                        </p>
                    </div>

                    <div>
                        <FieldLabel>Confirm Delete</FieldLabel>
                        <FocusInput
                            placeholder="Type 'delete'"
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
                        <button type="button" onClick={closeDeleteModal} style={{
                            height: '38px', padding: '0 18px', borderRadius: '9px', border: '1.5px solid #e2e8f0',
                            background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151', transition: 'background 0.15s',
                        }}>Cancel</button>
                        <button type="button" onClick={onConfirmDelete} disabled={deleteInput.toLowerCase() !== 'delete' || deleteMutation.isPending} style={{
                            height: '38px', padding: '0 20px', borderRadius: '9px', border: 'none',
                            background: '#ef4444', color: '#fff',
                            fontWeight: '700', fontSize: '13px', cursor: deleteInput.toLowerCase() !== 'delete' ? 'not-allowed' : 'pointer',
                            opacity: (deleteInput.toLowerCase() !== 'delete' || deleteMutation.isPending) ? 0.5 : 1,
                        }}>
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete Agent'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
