import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Tag, Search } from 'lucide-react';
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
import { brandService } from '../../services';
import type { Brand, CreateBrandDto } from '../../types';
import { BrandType } from '../../types';

const brandSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum([BrandType.INVERTER, BrandType.SOLAR_PANEL], { message: 'Type is required' }),
    isActive: z.boolean().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

export function BrandsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['brands'],
        queryFn: () => brandService.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateBrandDto) => brandService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            toast.success('Brand created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create brand'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateBrandDto }) =>
            brandService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            toast.success('Brand updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update brand'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => brandService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            toast.success('Brand deleted successfully');
        },
        onError: () => toast.error('Failed to delete brand'),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<BrandFormData>({
        resolver: zodResolver(brandSchema),
    });

    const openCreateModal = () => {
        setEditingBrand(null);
        reset({ name: '', type: BrandType.INVERTER, isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (brand: Brand) => {
        setEditingBrand(brand);
        reset({ name: brand.name, type: brand.type as BrandFormData['type'], isActive: brand.isActive });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBrand(null);
        reset();
    };

    const onSubmit = (data: BrandFormData) => {
        if (editingBrand) {
            updateMutation.mutate({ id: editingBrand.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this brand?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Brand Name',
            render: (brand: Brand) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Tag className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{brand.name}</span>
                </div>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            render: (brand: Brand) => (
                <Badge variant={brand.type === BrandType.INVERTER ? 'info' : 'warning'}>
                    {brand.type === BrandType.INVERTER ? 'Inverter' : 'Solar Panel'}
                </Badge>
            ),
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (brand: Brand) => (
                <Badge variant={brand.isActive ? 'success' : 'danger'}>
                    {brand.isActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (brand: Brand) => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(brand)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(brand.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const brands = data?.items || (Array.isArray(data) ? data : []);
    const filteredBrands = brands.filter((brand: Brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
                    <p className="text-gray-500 mt-1">Manage your product brands</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Brand
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">All Brands</h2>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search brands..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table columns={columns} data={filteredBrands} isLoading={isLoading} />
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingBrand ? 'Edit Brand' : 'Add Brand'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <Input
                        label="Brand Name"
                        placeholder="Enter brand name"
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <Select
                        label="Brand Type"
                        options={[
                            { value: BrandType.INVERTER, label: 'Inverter' },
                            { value: BrandType.SOLAR_PANEL, label: 'Solar Panel' },
                        ]}
                        error={errors.type?.message}
                        {...register('type')}
                    />

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            {...register('isActive')}
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                            Active Brand
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button type="button" variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingBrand ? 'Update Brand' : 'Create Brand'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
