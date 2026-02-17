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
import { solarPanelService, brandService } from '../../services';
import type { SolarPanel, CreateSolarPanelDto } from '../../types';
import { BrandType } from '../../types';

const solarPanelSchema = z.object({
    model: z.string().min(1, 'Model is required'),
    price: z.string().transform((val) => Number(val) || 0).pipe(z.number().min(0, 'Price must be positive')),
    wattage: z.string().optional().transform((val) => val ? Number(val) : undefined),
    description: z.string().optional(),
    brandId: z.string().min(1, 'Brand is required'),
    isActive: z.boolean().optional(),
});

type SolarPanelFormData = {
    model: string;
    price: number;
    wattage?: number;
    description?: string;
    brandId: string;
    isActive?: boolean;
};

export function SolarPanelsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPanel, setEditingPanel] = useState<SolarPanel | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['solar-panels'],
        queryFn: () => solarPanelService.getAll(),
    });

    const { data: brands } = useQuery({
        queryKey: ['brands', 'solar-panel'],
        queryFn: () => brandService.getByType(BrandType.SOLAR_PANEL),
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateSolarPanelDto) => solarPanelService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solar-panels'] });
            toast.success('Solar panel created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create solar panel'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateSolarPanelDto }) =>
            solarPanelService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solar-panels'] });
            toast.success('Solar panel updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update solar panel'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => solarPanelService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solar-panels'] });
            toast.success('Solar panel deleted successfully');
        },
        onError: () => toast.error('Failed to delete solar panel'),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SolarPanelFormData>({
        resolver: zodResolver(solarPanelSchema) as any,
    });

    const openCreateModal = () => {
        setEditingPanel(null);
        reset({ model: '', price: 0, wattage: undefined, description: '', brandId: '', isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (panel: SolarPanel) => {
        setEditingPanel(panel);
        reset({
            model: panel.model,
            price: panel.price,
            wattage: panel.wattage,
            description: panel.description || '',
            brandId: panel.brandId,
            isActive: panel.isActive,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPanel(null);
        reset();
    };

    const onSubmit = (data: SolarPanelFormData) => {
        if (editingPanel) {
            updateMutation.mutate({ id: editingPanel.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this solar panel?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns = [
        { key: 'model', header: 'Model' },
        {
            key: 'brand',
            header: 'Brand',
            render: (panel: SolarPanel) => panel.brand?.name || '-',
        },
        {
            key: 'wattage',
            header: 'Wattage',
            render: (panel: SolarPanel) => (panel.wattage ? `${panel.wattage}W` : '-'),
        },
        {
            key: 'price',
            header: 'Price',
            render: (panel: SolarPanel) => `Rs. ${Number(panel.price).toLocaleString()}`,
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (panel: SolarPanel) => (
                <Badge variant={panel.isActive ? 'success' : 'danger'}>
                    {panel.isActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (panel: SolarPanel) => (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(panel)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(panel.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const panels = data?.items || (Array.isArray(data) ? data : []);
    const brandOptions = (brands || []).map((b) => ({ value: b.id, label: b.name }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Solar Panels</h1>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Solar Panel
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">All Solar Panels</h2>
                </CardHeader>
                <CardContent className="p-0">
                    <Table columns={columns} data={panels} isLoading={isLoading} />
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingPanel ? 'Edit Solar Panel' : 'Add Solar Panel'}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Model"
                            placeholder="e.g., 550W Mono"
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
                            label="Wattage"
                            type="number"
                            placeholder="e.g., 550"
                            error={errors.wattage?.message}
                            {...register('wattage')}
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
                            {editingPanel ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
