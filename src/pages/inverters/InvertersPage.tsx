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
import { inverterService, brandService } from '../../services';
import type { Inverter, CreateInverterDto } from '../../types';
import { BrandType } from '../../types';

const inverterSchema = z.object({
    model: z.string().min(1, 'Model is required'),
    price: z.string().transform((val) => Number(val) || 0).pipe(z.number().min(0, 'Price must be positive')),
    capacity: z.string().optional(),
    description: z.string().optional(),
    brandId: z.string().min(1, 'Brand is required'),
    isActive: z.boolean().optional(),
});

type InverterFormData = {
    model: string;
    price: number;
    capacity?: string;
    description?: string;
    brandId: string;
    isActive?: boolean;
};

export function InvertersPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInverter, setEditingInverter] = useState<Inverter | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['inverters'],
        queryFn: () => inverterService.getAll(),
    });

    const { data: brands } = useQuery({
        queryKey: ['brands', 'inverter'],
        queryFn: () => brandService.getByType(BrandType.INVERTER),
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateInverterDto) => inverterService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inverters'] });
            toast.success('Inverter created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create inverter'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateInverterDto }) =>
            inverterService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inverters'] });
            toast.success('Inverter updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update inverter'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => inverterService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inverters'] });
            toast.success('Inverter deleted successfully');
        },
        onError: () => toast.error('Failed to delete inverter'),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<InverterFormData>({
        resolver: zodResolver(inverterSchema) as any,
    });

    const openCreateModal = () => {
        setEditingInverter(null);
        reset({ model: '', price: 0, capacity: '', description: '', brandId: '', isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (inverter: Inverter) => {
        setEditingInverter(inverter);
        reset({
            model: inverter.model,
            price: inverter.price,
            capacity: inverter.capacity || '',
            description: inverter.description || '',
            brandId: inverter.brandId,
            isActive: inverter.isActive,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingInverter(null);
        reset();
    };

    const onSubmit = (data: InverterFormData) => {
        if (editingInverter) {
            updateMutation.mutate({ id: editingInverter.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this inverter?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns = [
        { key: 'model', header: 'Model' },
        {
            key: 'brand',
            header: 'Brand',
            render: (inverter: Inverter) => inverter.brand?.name || '-',
        },
        {
            key: 'capacity',
            header: 'Capacity',
            render: (inverter: Inverter) => inverter.capacity || '-',
        },
        {
            key: 'price',
            header: 'Price',
            render: (inverter: Inverter) => `Rs. ${Number(inverter.price).toLocaleString()}`,
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (inverter: Inverter) => (
                <Badge variant={inverter.isActive ? 'success' : 'danger'}>
                    {inverter.isActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (inverter: Inverter) => (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(inverter)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(inverter.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const inverters = data?.items || (Array.isArray(data) ? data : []);
    const brandOptions = (brands || []).map((b) => ({ value: b.id, label: b.name }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Inverters</h1>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Inverter
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">All Inverters</h2>
                </CardHeader>
                <CardContent className="p-0">
                    <Table columns={columns} data={inverters} isLoading={isLoading} />
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingInverter ? 'Edit Inverter' : 'Add Inverter'}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Model"
                            placeholder="e.g., Hybrid 10kW"
                            error={errors.model?.message}
                            {...register('model')}
                        />

                        <Select
                            label="Brand"
                            placeholder="Select brand"
                            options={brandOptions}
                            error={errors.brandId?.message}
                            {...register('brandId')}
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
                            label="Capacity"
                            placeholder="e.g., 10kW"
                            error={errors.capacity?.message}
                            {...register('capacity')}
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
                            {editingInverter ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
