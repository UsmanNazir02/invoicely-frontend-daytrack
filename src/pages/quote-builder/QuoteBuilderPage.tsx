import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Sun,
    Zap,
    Building,
    Package,
    Plus,
    Minus,
    Trash2,
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    Calculator,
    Send,
    Save,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, Button, Input, Badge } from '../../components';
import {
    solarPanelService,
    inverterService,
    structureService,
    miscItemService,
    quoteService,
} from '../../services';
import type {
    SolarPanel,
    Inverter,
    Structure,
    MiscItem,
    CreateQuoteItemDto,
} from '../../types';
import { QuoteItemType } from '../../types';

interface CartItem extends CreateQuoteItemDto {
    tempId: string;
}

type ProductTab = 'solar-panels' | 'inverters' | 'structures' | 'misc-items';

export function QuoteBuilderPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<ProductTab>('solar-panels');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    });
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');

    // Fetch all products
    const { data: solarPanels, isLoading: loadingPanels } = useQuery({
        queryKey: ['solar-panels'],
        queryFn: () => solarPanelService.getAll(),
    });

    const { data: inverters, isLoading: loadingInverters } = useQuery({
        queryKey: ['inverters'],
        queryFn: () => inverterService.getAll(),
    });

    const { data: structures, isLoading: loadingStructures } = useQuery({
        queryKey: ['structures'],
        queryFn: () => structureService.getAll(),
    });

    const { data: miscItems, isLoading: loadingMiscItems } = useQuery({
        queryKey: ['misc-items'],
        queryFn: () => miscItemService.getAll(),
    });

    const createQuoteMutation = useMutation({
        mutationFn: quoteService.create,
        onSuccess: () => {
            toast.success('Quote created successfully!');
            navigate('/quotes');
        },
        onError: () => toast.error('Failed to create quote'),
    });

    // Calculate totals
    const { subtotal, discountAmount, total } = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const discountAmount = (subtotal * discount) / 100;
        const total = subtotal - discountAmount;
        return { subtotal, discountAmount, total };
    }, [cart, discount]);

    // Add item to cart
    const addToCart = (
        item: SolarPanel | Inverter | Structure | MiscItem,
        type: QuoteItemType,
        brandName?: string
    ) => {
        const existingItem = cart.find(
            (cartItem) => cartItem.itemId === item.id && cartItem.itemType === type
        );

        if (existingItem) {
            setCart(
                cart.map((cartItem) =>
                    cartItem.tempId === existingItem.tempId
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                )
            );
        } else {
            const newItem: CartItem = {
                tempId: `${item.id}-${Date.now()}`,
                itemType: type,
                itemId: item.id,
                itemName: 'model' in item ? item.model : 'name' in item ? item.name : `${(item as Structure).type}`,
                itemDescription: item.description,
                unitPrice: Number(item.price),
                quantity: 1,
                brandName,
            };
            setCart([...cart, newItem]);
        }
        toast.success('Added to quote');
    };

    // Update item quantity
    const updateQuantity = (tempId: string, delta: number) => {
        setCart(
            cart
                .map((item) =>
                    item.tempId === tempId
                        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    // Remove item from cart
    const removeFromCart = (tempId: string) => {
        setCart(cart.filter((item) => item.tempId !== tempId));
    };

    // Submit quote
    const handleSubmit = () => {
        if (!customerInfo.name) {
            toast.error('Please enter customer name');
            return;
        }
        if (cart.length === 0) {
            toast.error('Please add at least one item to the quote');
            return;
        }

        createQuoteMutation.mutate({
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone || undefined,
            customerEmail: customerInfo.email || undefined,
            customerAddress: customerInfo.address || undefined,
            discountPercentage: discount,
            notes: notes || undefined,
            items: cart.map(({ tempId, ...item }) => item),
        });
    };

    const tabs = [
        { id: 'solar-panels' as const, label: 'Solar Panels', icon: Sun, color: 'text-yellow-500' },
        { id: 'inverters' as const, label: 'Inverters', icon: Zap, color: 'text-green-500' },
        { id: 'structures' as const, label: 'Structures', icon: Building, color: 'text-purple-500' },
        { id: 'misc-items' as const, label: 'Misc Items', icon: Package, color: 'text-orange-500' },
    ];

    const panels = solarPanels?.items || (Array.isArray(solarPanels) ? solarPanels : []);
    const invs = inverters?.items || (Array.isArray(inverters) ? inverters : []);
    const structs = structures?.items || (Array.isArray(structures) ? structures : []);
    const miscList = miscItems?.items || (Array.isArray(miscItems) ? miscItems : []);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quote Builder</h1>
                    <p className="text-gray-500 mt-1">Create a new quote by selecting products</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Products Selection */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Tabs */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? tab.color : ''}`} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <Card>
                        <CardContent className="p-4">
                            {/* Solar Panels */}
                            {activeTab === 'solar-panels' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {loadingPanels ? (
                                        <div className="col-span-2 py-12 text-center text-gray-500">Loading...</div>
                                    ) : panels.length === 0 ? (
                                        <div className="col-span-2 py-12 text-center text-gray-500">
                                            No solar panels available
                                        </div>
                                    ) : (
                                        panels.filter((p: SolarPanel) => p.isActive).map((panel: SolarPanel) => (
                                            <div
                                                key={panel.id}
                                                className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Sun className="h-5 w-5 text-yellow-500" />
                                                            <h3 className="font-semibold text-gray-900">{panel.model}</h3>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1">{panel.brand?.name}</p>
                                                        {panel.wattage && (
                                                            <Badge variant="info" size="sm">
                                                                {panel.wattage}W
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-gray-900">
                                                            Rs. {Number(panel.price).toLocaleString()}
                                                        </p>
                                                        <button
                                                            onClick={() =>
                                                                addToCart(panel, QuoteItemType.SOLAR_PANEL, panel.brand?.name)
                                                            }
                                                            className="mt-2 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Plus className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Inverters */}
                            {activeTab === 'inverters' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {loadingInverters ? (
                                        <div className="col-span-2 py-12 text-center text-gray-500">Loading...</div>
                                    ) : invs.length === 0 ? (
                                        <div className="col-span-2 py-12 text-center text-gray-500">
                                            No inverters available
                                        </div>
                                    ) : (
                                        invs.filter((i: Inverter) => i.isActive).map((inverter: Inverter) => (
                                            <div
                                                key={inverter.id}
                                                className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Zap className="h-5 w-5 text-green-500" />
                                                            <h3 className="font-semibold text-gray-900">{inverter.model}</h3>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1">{inverter.brand?.name}</p>
                                                        {inverter.capacity && (
                                                            <Badge variant="success" size="sm">
                                                                {inverter.capacity}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-gray-900">
                                                            Rs. {Number(inverter.price).toLocaleString()}
                                                        </p>
                                                        <button
                                                            onClick={() =>
                                                                addToCart(inverter, QuoteItemType.INVERTER, inverter.brand?.name)
                                                            }
                                                            className="mt-2 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Plus className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Structures */}
                            {activeTab === 'structures' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {loadingStructures ? (
                                        <div className="col-span-2 py-12 text-center text-gray-500">Loading...</div>
                                    ) : structs.length === 0 ? (
                                        <div className="col-span-2 py-12 text-center text-gray-500">
                                            No structures available
                                        </div>
                                    ) : (
                                        structs.filter((s: Structure) => s.isActive).map((structure: Structure) => (
                                            <div
                                                key={structure.id}
                                                className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Building className="h-5 w-5 text-purple-500" />
                                                            <h3 className="font-semibold text-gray-900 capitalize">
                                                                {structure.type.replace(/_/g, ' ')}
                                                            </h3>
                                                        </div>
                                                        {structure.description && (
                                                            <p className="text-sm text-gray-500 mt-1">{structure.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-gray-900">
                                                            Rs. {Number(structure.price).toLocaleString()}
                                                        </p>
                                                        <button
                                                            onClick={() => addToCart(structure, QuoteItemType.STRUCTURE)}
                                                            className="mt-2 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Plus className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Misc Items */}
                            {activeTab === 'misc-items' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {loadingMiscItems ? (
                                        <div className="col-span-2 py-12 text-center text-gray-500">Loading...</div>
                                    ) : miscList.length === 0 ? (
                                        <div className="col-span-2 py-12 text-center text-gray-500">
                                            No misc items available
                                        </div>
                                    ) : (
                                        miscList.filter((m: MiscItem) => m.isActive).map((item: MiscItem) => (
                                            <div
                                                key={item.id}
                                                className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-5 w-5 text-orange-500" />
                                                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                                        </div>
                                                        <Badge variant="default" size="sm">
                                                            {item.type.replace(/_/g, ' ')}
                                                        </Badge>
                                                        {item.unit && (
                                                            <p className="text-sm text-gray-500 mt-1">per {item.unit}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-gray-900">
                                                            Rs. {Number(item.price).toLocaleString()}
                                                        </p>
                                                        <button
                                                            onClick={() => addToCart(item, QuoteItemType.MISC_ITEM)}
                                                            className="mt-2 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Plus className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quote Summary */}
                <div className="space-y-4">
                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-500" />
                                Customer Information
                            </h2>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                label="Customer Name *"
                                placeholder="Enter customer name"
                                value={customerInfo.name}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                icon={<User className="h-4 w-4" />}
                            />
                            <Input
                                label="Phone"
                                placeholder="Enter phone number"
                                value={customerInfo.phone}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                icon={<Phone className="h-4 w-4" />}
                            />
                            <Input
                                label="Email"
                                type="email"
                                placeholder="Enter email"
                                value={customerInfo.email}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                icon={<Mail className="h-4 w-4" />}
                            />
                            <Input
                                label="Address"
                                placeholder="Enter address"
                                value={customerInfo.address}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                icon={<MapPin className="h-4 w-4" />}
                            />
                        </CardContent>
                    </Card>

                    {/* Cart Items */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-500" />
                                Quote Items ({cart.length})
                            </h2>
                        </CardHeader>
                        <CardContent>
                            {cart.length === 0 ? (
                                <div className="py-8 text-center text-gray-400">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No items added yet</p>
                                    <p className="text-sm">Select products from the left panel</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {cart.map((item) => (
                                        <div
                                            key={item.tempId}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{item.itemName}</p>
                                                {item.brandName && (
                                                    <p className="text-xs text-gray-500">{item.brandName}</p>
                                                )}
                                                <p className="text-sm text-gray-600">
                                                    Rs. {item.unitPrice.toLocaleString()} × {item.quantity}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2">
                                                <button
                                                    onClick={() => updateQuantity(item.tempId, -1)}
                                                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.tempId, 1)}
                                                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.tempId)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-blue-500" />
                                Pricing
                            </h2>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>Rs. {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">Discount</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discount}
                                    onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                                    className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center"
                                />
                                <span className="text-gray-600">%</span>
                                <span className="ml-auto text-red-500">- Rs. {discountAmount.toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span className="text-blue-600">Rs. {total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any notes for this quote..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => handleSubmit()}
                                    isLoading={createQuoteMutation.isPending}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Draft
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => handleSubmit()}
                                    isLoading={createQuoteMutation.isPending}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Create Quote
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
