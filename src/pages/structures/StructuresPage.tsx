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
import { structureService } from '../../services';
import type { Structure, CreateStructureDto } from '../../types';
import { StructureType } from '../../types';

const structureSchema = z.object({
    type: z.enum([StructureType.GROUND_MOUNT, StructureType.ELEVATED, StructureType.ROOFTOP], { message: 'Type is required' }),
    price: z.string().transform((val) => Number(val) || 0).pipe(z.number().min(0, 'Price must be positive')),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
});

type StructureFormData = {
    type: 'ground_mount' | 'elevated' | 'rooftop';
    price: number;
    description?: string;
    isActive?: boolean;
};

const structureTypeLabels: Record<string, string> = {
    [StructureType.GROUND_MOUNT]: 'Ground Mount',
    [StructureType.ELEVATED]: 'Elevated',
    [StructureType.ROOFTOP]: 'Rooftop',
};

export function StructuresPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStructure, setEditingStructure] = useState<Structure | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['structures'],
        queryFn: () => structureService.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateStructureDto) => structureService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['structures'] });
            toast.success('Structure created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create structure'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateStructureDto }) =>
            structureService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['structures'] });
            toast.success('Structure updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update structure'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => structureService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['structures'] });
            toast.success('Structure deleted successfully');
        },
        onError: () => toast.error('Failed to delete structure'),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<StructureFormData>({
        resolver: zodResolver(structureSchema) as any,
    });

    const openCreateModal = () => {
        setEditingStructure(null);
        reset({ type: StructureType.ROOFTOP, price: 0, description: '', isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (structure: Structure) => {
        setEditingStructure(structure);
        reset({
            type: structure.type as StructureFormData['type'],
            price: structure.price,
            description: structure.description || '',
            isActive: structure.isActive,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStructure(null);
        reset();
    };

    const onSubmit = (data: StructureFormData) => {
        if (editingStructure) {
            updateMutation.mutate({ id: editingStructure.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this structure?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns = [
        {
            key: 'type',
            header: 'Type',
            render: (structure: Structure) => (
                <Badge variant="info">{structureTypeLabels[structure.type]}</Badge>
            ),
        },
        {
            key: 'price',
            header: 'Price',
            render: (structure: Structure) => `Rs. ${Number(structure.price).toLocaleString()}`,
        },
        {
            key: 'description',
            header: 'Description',
            render: (structure: Structure) => structure.description || '-',
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (structure: Structure) => (
                <Badge variant={structure.isActive ? 'success' : 'danger'}>
                    {structure.isActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (structure: Structure) => (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(structure)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(structure.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const structures = data?.items || (Array.isArray(data) ? data : []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Structures</h1>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Structure
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">All Structures</h2>
                </CardHeader>
                <CardContent className="p-0">
                    <Table columns={columns} data={structures} isLoading={isLoading} />
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingStructure ? 'Edit Structure' : 'Add Structure'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Select
                        label="Type"
                        options={Object.entries(structureTypeLabels).map(([value, label]) => ({
                            value,
                            label,
                        }))}
                        error={errors.type?.message}
                        {...register('type')}
                    />

                    <Input
                        label="Price (Rs.)"
                        type="number"
                        placeholder="Enter price"
                        error={errors.price?.message}
                        {...register('price')}
                    />

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
                            {editingStructure ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
