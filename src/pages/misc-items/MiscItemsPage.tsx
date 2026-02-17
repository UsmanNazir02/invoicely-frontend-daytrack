import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    Card,
    CardHeader,
    CardContent,
    Button,
    Table,
    Modal,
    Input,
    Select,
    Badge,
} from '../../components';
import { miscItemService } from '../../services';
import type { MiscItem, CreateMiscItemDto } from '../../types';
import { MiscItemType } from '../../types';

const miscItemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum([
        MiscItemType.WIRE,
        MiscItemType.DB,
        MiscItemType.CIVIL_WORK,
        MiscItemType.TRANSPORTATION,
        MiscItemType.NET_METERING,
        MiscItemType.EARTHING,
        MiscItemType.LIGHTENING_ARRESTOR,
        MiscItemType.SMART_METER,
    ], { message: 'Type is required' }),
    price: z.string().transform((val) => Number(val) || 0).pipe(z.number().min(0, 'Price must be positive')),
    unit: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
});

type MiscItemFormData = {
    name: string;
    type: 'wire' | 'db' | 'civil_work' | 'transportation' | 'net_metering' | 'earthing' | 'lightening_arrestor' | 'smart_meter';
    price: number;
    unit?: string;
    description?: string;
    isActive?: boolean;
};

const miscItemTypeLabels: Record<string, string> = {
    [MiscItemType.WIRE]: 'Wire',
    [MiscItemType.DB]: 'DB',
    [MiscItemType.CIVIL_WORK]: 'Civil Work',
    [MiscItemType.TRANSPORTATION]: 'Transportation',
    [MiscItemType.NET_METERING]: 'Net Metering',
    [MiscItemType.EARTHING]: 'Earthing',
    [MiscItemType.LIGHTENING_ARRESTOR]: 'Lightning Arrestor',
    [MiscItemType.SMART_METER]: 'Smart Meter',
};

export function MiscItemsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MiscItem | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['misc-items'],
        queryFn: () => miscItemService.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateMiscItemDto) => miscItemService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['misc-items'] });
            toast.success('Misc item created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create misc item'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateMiscItemDto }) =>
            miscItemService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['misc-items'] });
            toast.success('Misc item updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update misc item'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => miscItemService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['misc-items'] });
            toast.success('Misc item deleted successfully');
        },
        onError: () => toast.error('Failed to delete misc item'),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MiscItemFormData>({
        resolver: zodResolver(miscItemSchema) as any,
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset({
            name: '',
            type: MiscItemType.WIRE,
            price: 0,
            unit: '',
            description: '',
            isActive: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: MiscItem) => {
        setEditingItem(item);
        reset({
            name: item.name,
            type: item.type as MiscItemFormData['type'],
            price: item.price,
            unit: item.unit || '',
            description: item.description || '',
            isActive: item.isActive,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        reset();
    };

    const onSubmit = (data: MiscItemFormData) => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns = [
        { key: 'name', header: 'Name' },
        {
            key: 'type',
            header: 'Type',
            render: (item: MiscItem) => (
                <Badge variant="info">{miscItemTypeLabels[item.type]}</Badge>
            ),
        },
        {
            key: 'price',
            header: 'Price',
            render: (item: MiscItem) => `Rs. ${Number(item.price).toLocaleString()}`,
        },
        {
            key: 'unit',
            header: 'Unit',
            render: (item: MiscItem) => item.unit || '-',
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (item: MiscItem) => (
                <Badge variant={item.isActive ? 'success' : 'danger'}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: MiscItem) => (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const items = data?.items || (Array.isArray(data) ? data : []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Misc Items</h1>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">All Misc Items</h2>
                </CardHeader>
                <CardContent className="p-0">
                    <Table columns={columns} data={items} isLoading={isLoading} />
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? 'Edit Misc Item' : 'Add Misc Item'}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Name"
                            placeholder="Enter item name"
                            error={errors.name?.message}
                            {...register('name')}
                        />

                        <Select
                            label="Type"
                            options={Object.entries(miscItemTypeLabels).map(([value, label]) => ({
                                value,
                                label,
                            }))}
                            error={errors.type?.message}
                            {...register('type')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Price (Rs.)"
                            type="number"
                            placeholder="Enter price"
                            error={errors.price?.message}
                            {...register('price')}
                        />

                        <Input
                            label="Unit"
                            placeholder="e.g., per meter, fixed"
                            error={errors.unit?.message}
                            {...register('unit')}
                        />
                    </div>

                    <Input
                        label="Description"
                        placeholder="Optional description"
                        error={errors.description?.message}
                        {...register('description')}
                    />

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            {...register('isActive')}
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                            Active
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingItem ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
