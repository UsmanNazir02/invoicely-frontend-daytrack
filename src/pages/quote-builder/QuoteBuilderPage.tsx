import { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Sun, Zap, Building, Package, Plus, Minus, Trash2,
    User, Phone, Mail, MapPin, FileText, Calculator,
    Send, Save, Search, EyeOff, Pencil, ChevronDown, ChevronUp,
    ChevronLeft, ChevronRight,
    BatteryFull, Wrench, Plug,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '../../components';
import {
    solarPanelService, inverterService, structureService,
    miscItemService, batteryService, serviceItemService, electricalItemService, quoteService,
} from '../../services';
import type {
    SolarPanel, Inverter, Structure, MiscItem, Battery, ServiceItem, ElectricalItem,
    CreateQuoteItemDto, QuoteStatus, Quote,
} from '../../types';
import { QuoteItemType } from '../../types';

interface CartItem extends CreateQuoteItemDto {
    tempId: string;
    /** True when quantity/price is auto-derived from system size (locks manual controls) */
    autoCalculated?: boolean;
    /** Wattage stored for solar panels so recalc can happen when systemSize changes */
    panelWattage?: number;
    /** Base price per unit (before multiplying by systemSize) — for recalculation */
    basePricePerUnit?: number;
}

type ProductTab = 'solar-panels' | 'inverters' | 'structures' | 'misc-items' | 'batteries' | 'service-items' | 'electrical-items';

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none', display: 'flex' }}>
                    {icon}
                </span>
                {children}
            </div>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', height: '38px',
    paddingLeft: '32px', paddingRight: '10px',
    fontSize: '13px', color: '#1e293b',
    background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
};

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
        />
    );
}

function InlinePriceInput({ value, onChange }: { value: number; onChange: (val: number) => void }) {
    const [localVal, setLocalVal] = useState<string>(value.toString());
    useEffect(() => { if (Number(localVal) !== value && localVal !== '') setLocalVal(value.toString()); }, [value]);
    const handleBlur = () => {
        const num = Number(localVal);
        if (isNaN(num) || localVal === '') { setLocalVal('0'); onChange(0); }
        else { setLocalVal(num.toString()); onChange(num); }
    };
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '0 8px 0 6px', height: '28px', width: '100%', boxSizing: 'border-box' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', flexShrink: 0, userSelect: 'none' }}>Rs.</span>
            <input type="number" min="0" value={localVal}
                onChange={e => setLocalVal(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                style={{ flex: 1, minWidth: 0, height: '100%', padding: '0', fontSize: '12px', border: 'none', outline: 'none', background: 'transparent', color: '#0f172a', fontWeight: '700' }}
            />
        </div>
    );
}

/** Compute initial quantity and unitPrice based on item type and system size.
 *  Solar panel: unitPrice = rate × wattage, qty = ceil(systemKW × 1000 / wattage)
 *  Structure / Service / Electrical: unitPrice = rate × systemKW × 1000
 *  Inverter / Misc / Battery: unitPrice = rate, qty = 1 (no auto-calc)
 */
function computeItemValues(
    type: QuoteItemType,
    basePrice: number,
    systemSizeKW: number,
    wattage?: number,
): { quantity: number; unitPrice: number } {
    switch (type) {
        case QuoteItemType.SOLAR_PANEL: {
            const qty = wattage && wattage > 0
                ? Math.ceil((systemSizeKW * 1000) / wattage)
                : 1;
            const unitPrice = wattage && wattage > 0 ? basePrice * wattage : basePrice;
            return { quantity: qty, unitPrice };
        }
        case QuoteItemType.STRUCTURE:
        case QuoteItemType.SERVICE:
        case QuoteItemType.ELECTRICAL:
            return { quantity: 1, unitPrice: basePrice * systemSizeKW * 1000 };
        case QuoteItemType.INVERTER:
        case QuoteItemType.MISC_ITEM:
        case QuoteItemType.BATTERY:
        default:
            return { quantity: 1, unitPrice: basePrice };
    }
}

export function QuoteBuilderPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<ProductTab>('solar-panels');
    const tabsRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateTabsScroll = () => {
        const el = tabsRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    const scrollTabs = (dir: 'left' | 'right') => {
        tabsRef.current?.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' });
    };
    useEffect(() => { updateTabsScroll(); }, []);
    const [cart, setCart] = useState<CartItem[]>([]);
    const tempIdSeq = useRef(0);
    const hydratedId = useRef<string | null>(null);
    const [productSearch, setProductSearch] = useState('');
    const [showInactive, setShowInactive] = useState(true);
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '', address: '' });
    const [systemSize, setSystemSize] = useState<number | ''>('');
    const [customerInfoExpanded, setCustomerInfoExpanded] = useState(false);
    const [discount, setDiscount] = useState<number | ''>(0);
    const [profitOverride, setProfitOverride] = useState<number | null>(null);
    const [notes, setNotes] = useState('');

    const cartItemCount = cart.reduce((s, i) => s + i.quantity, 0);
    const draftId = searchParams.get('draft');

    const { data: solarPanels, isLoading: loadingPanels } = useQuery({ queryKey: ['solar-panels'], queryFn: () => solarPanelService.getAll() });
    const { data: inverters, isLoading: loadingInverters } = useQuery({ queryKey: ['inverters'], queryFn: () => inverterService.getAll() });
    const { data: structures, isLoading: loadingStructures } = useQuery({ queryKey: ['structures'], queryFn: () => structureService.getAll() });
    const { data: miscItems, isLoading: loadingMiscItems } = useQuery({ queryKey: ['misc-items'], queryFn: () => miscItemService.getAll() });
    const { data: batteries, isLoading: loadingBatteries } = useQuery({ queryKey: ['batteries'], queryFn: () => batteryService.getAll() });
    const { data: serviceItems, isLoading: loadingServiceItems } = useQuery({ queryKey: ['service-items'], queryFn: () => serviceItemService.getAll() });
    const { data: electricalItems, isLoading: loadingElectricalItems } = useQuery({ queryKey: ['electrical-items'], queryFn: () => electricalItemService.getAll() });
    const { data: draftQuote, isLoading: loadingDraft } = useQuery<Quote>({
        queryKey: ['quotes', draftId], queryFn: () => quoteService.getById(draftId!),
        enabled: !!draftId, refetchOnMount: 'always',
    });

    const editingQuoteId = draftQuote?.id ?? null;

    // Hydrate draft quote
    useEffect(() => {
        if (!draftId || !draftQuote || hydratedId.current === draftId) return;
        hydratedId.current = draftId;
        queueMicrotask(() => {
            setCustomerInfo({ name: draftQuote.customerName ?? '', phone: draftQuote.customerPhone ?? '', email: draftQuote.customerEmail ?? '', address: draftQuote.customerAddress ?? '' });
            setSystemSize(draftQuote.systemSize ?? '');
            setDiscount(Number(draftQuote.discountPercentage ?? 0));
            setNotes(draftQuote.notes ?? '');
            setCart((draftQuote.items ?? []).map(item => ({
                tempId: `${item.id}-${tempIdSeq.current++}`,
                itemType: item.itemType, itemId: item.itemId, itemName: item.itemName,
                itemDescription: item.itemDescription, unitPrice: Number(item.unitPrice),
                quantity: Number(item.quantity), brandName: item.brandName,
                // Mark auto-calculated items from draft (fixed-price types = not locked)
                autoCalculated: item.itemType !== QuoteItemType.INVERTER && item.itemType !== QuoteItemType.BATTERY,
            })));
        });
    }, [draftId, draftQuote]);

    // No systemSize-based auto-recalc; values are calculated once on add and remain freely editable.

    const saveQuoteMutation = useMutation({
        mutationFn: async (payload: Parameters<typeof quoteService.create>[0]) => {
            if (editingQuoteId) return quoteService.update(editingQuoteId, payload);
            return quoteService.create(payload);
        },
        onSuccess: (quote, variables) => {
            const status = (variables as { status?: QuoteStatus } | undefined)?.status;
            toast.success(status === 'draft' ? 'Draft saved!' : 'Quote created!');
            queryClient.invalidateQueries({ queryKey: ['quotes'] });
            queryClient.invalidateQueries({ queryKey: ['quotes', quote.id] });
            navigate(`/quotes/${quote.id}`);
        },
        onError: (error: any) => {
            const errMsg = error.response?.data?.message;
            const text = Array.isArray(errMsg) ? errMsg[0] : errMsg;
            toast.error(text || (editingQuoteId ? 'Failed to update quote' : 'Failed to create quote'));
        },
    });

    const { subtotal, discountAmount, baseTotal, defaultProfit, effectiveProfit, profitPct, total } = useMemo(() => {
        const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
        const activeDiscount = Number(discount) || 0;
        const discountAmount = (subtotal * activeDiscount) / 100;
        const baseTotal = subtotal - discountAmount;
        const defaultProfit = Math.round(baseTotal * 0.10);
        const effectiveProfit = profitOverride !== null ? profitOverride : defaultProfit;
        const profitPct = baseTotal > 0 ? (effectiveProfit / baseTotal) * 100 : 10;
        const total = baseTotal + (effectiveProfit - defaultProfit);
        return { subtotal, discountAmount, baseTotal, defaultProfit, effectiveProfit, profitPct, total };
    }, [cart, discount, profitOverride]);

    const addToCart = (item: SolarPanel | Inverter | Structure | MiscItem | Battery | ServiceItem | ElectricalItem, type: QuoteItemType, brandName?: string) => {
        const kw = Number(systemSize);

        // Require system size for items that scale with system size
        const fixedPriceTypes: QuoteItemType[] = [QuoteItemType.INVERTER, QuoteItemType.MISC_ITEM, QuoteItemType.BATTERY];
        if (!fixedPriceTypes.includes(type) && (!kw || kw <= 0)) {
            toast.error('Please enter System Size (kW) first');
            return;
        }

        // Solar panel must have wattage
        if (type === QuoteItemType.SOLAR_PANEL) {
            const panel = item as SolarPanel;
            if (!panel.wattage || panel.wattage <= 0) {
                toast.error('This solar panel has no wattage set — cannot calculate quantity');
                return;
            }
        }

        const basePrice = Number(item.price);
        const wattage = type === QuoteItemType.SOLAR_PANEL ? (item as SolarPanel).wattage : undefined;
        const { quantity, unitPrice } = computeItemValues(type, basePrice, kw, wattage);

        const name = 'model' in item ? item.model : 'name' in item ? item.name : (item as Structure).type;

        // Fixed-price items (inverter, battery): bump quantity if already in cart
        const existing = cart.find(c => c.itemId === item.id && c.itemType === type);
        if (existing && (type === QuoteItemType.INVERTER || type === QuoteItemType.BATTERY)) {
            setCart(cart.map(c => c.tempId === existing.tempId ? { ...c, quantity: c.quantity + 1 } : c));
            toast.success('Added to quote');
            return;
        }

        setCart([...cart, {
            tempId: `${item.id}-${type}-${tempIdSeq.current++}`,
            itemType: type, itemId: item.id,
            itemName: name,
            itemDescription: item.description, unitPrice, quantity, brandName,
        }]);
        toast.success('Added to quote');
    };

    const updateQuantity = (tempId: string, delta: number) =>
        setCart(cart.map(i => i.tempId === tempId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
    const updatePrice = (tempId: string, newPrice: number) =>
        setCart(cart.map(i => i.tempId === tempId ? { ...i, unitPrice: Math.max(0, newPrice) } : i));
    const removeFromCart = (tempId: string) => setCart(cart.filter(i => i.tempId !== tempId));

    const handleSubmit = (status: QuoteStatus) => {
        if (!customerInfo.name) { toast.error('Please enter customer name'); return; }
        if (!cart.length) { toast.error('Please add at least one item'); return; }
        saveQuoteMutation.mutate({
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone || undefined,
            customerEmail: customerInfo.email || undefined,
            customerAddress: customerInfo.address || undefined,
            systemSize: systemSize === '' ? undefined : Number(systemSize),
            discountPercentage: Number(discount) || 0, notes: notes || undefined, status,
            items: cart.map(({ tempId, autoCalculated, panelWattage, basePricePerUnit, ...item }) => {
                void tempId; void autoCalculated; void panelWattage; void basePricePerUnit;
                return item;
            }),
        });
    };

    const tabs = [
        { id: 'solar-panels' as const, label: 'Solar Panels', icon: Sun, color: '#ca8a04' },
        { id: 'inverters' as const, label: 'Inverters', icon: Zap, color: '#16a34a' },
        { id: 'structures' as const, label: 'Structures', icon: Building, color: '#7c3aed' },
        { id: 'misc-items' as const, label: 'Misc Items', icon: Package, color: '#ea580c' },
        { id: 'batteries' as const, label: 'Batteries', icon: BatteryFull, color: '#16a34a' },
        { id: 'service-items' as const, label: 'Services', icon: Wrench, color: '#2563eb' },
        { id: 'electrical-items' as const, label: 'Electrical', icon: Plug, color: '#a21caf' },
    ];

    const panels = useMemo(() => solarPanels?.items || (Array.isArray(solarPanels) ? solarPanels : []), [solarPanels]);
    const invs = useMemo(() => inverters?.items || (Array.isArray(inverters) ? inverters : []), [inverters]);
    const structs = useMemo(() => structures?.items || (Array.isArray(structures) ? structures : []), [structures]);
    const miscList = useMemo(() => miscItems?.items || (Array.isArray(miscItems) ? miscItems : []), [miscItems]);
    const batteryList = useMemo(() => batteries?.items || (Array.isArray(batteries) ? batteries : []), [batteries]);
    const serviceList = useMemo(() => serviceItems?.items || (Array.isArray(serviceItems) ? serviceItems : []), [serviceItems]);
    const electricalList = useMemo(() => electricalItems?.items || (Array.isArray(electricalItems) ? electricalItems : []), [electricalItems]);

    const ns = productSearch.trim().toLowerCase();
    const visiblePanels = useMemo(() => { const b = showInactive ? panels : panels.filter((p: SolarPanel) => p.isActive); return ns ? b.filter((p: SolarPanel) => `${p.model} ${p.brand?.name ?? ''}`.toLowerCase().includes(ns)) : b; }, [panels, showInactive, ns]);
    const visibleInvs = useMemo(() => { const b = showInactive ? invs : invs.filter((i: Inverter) => i.isActive); return ns ? b.filter((i: Inverter) => `${i.model} ${i.brand?.name ?? ''}`.toLowerCase().includes(ns)) : b; }, [invs, showInactive, ns]);
    const visibleStructs = useMemo(() => { const b = showInactive ? structs : structs.filter((s: Structure) => s.isActive); return ns ? b.filter((s: Structure) => `${s.type} ${s.description ?? ''}`.toLowerCase().includes(ns)) : b; }, [structs, showInactive, ns]);
    const visibleMisc = useMemo(() => { const b = showInactive ? miscList : miscList.filter((m: MiscItem) => m.isActive); return ns ? b.filter((m: MiscItem) => `${m.name} ${m.type}`.toLowerCase().includes(ns)) : b; }, [miscList, showInactive, ns]);
    const visibleBatteries = useMemo(() => { const b = showInactive ? batteryList : batteryList.filter((b: Battery) => b.isActive); return ns ? b.filter((b: Battery) => `${b.name} ${b.capacity ?? ''}`.toLowerCase().includes(ns)) : b; }, [batteryList, showInactive, ns]);
    const visibleServices = useMemo(() => { const b = showInactive ? serviceList : serviceList.filter((s: ServiceItem) => s.isActive); return ns ? b.filter((s: ServiceItem) => `${s.name} ${s.description ?? ''}`.toLowerCase().includes(ns)) : b; }, [serviceList, showInactive, ns]);
    const visibleElectrical = useMemo(() => { const b = showInactive ? electricalList : electricalList.filter((e: ElectricalItem) => e.isActive); return ns ? b.filter((e: ElectricalItem) => `${e.name} ${e.description ?? ''}`.toLowerCase().includes(ns)) : b; }, [electricalList, showInactive, ns]);

    const kw = Number(systemSize);

    const ProductCard = ({ icon, title, sub, badge, badgeVariant, price, onAdd, active, hint }: {
        icon: React.ReactNode; title: string; sub?: string; badge?: string;
        badgeVariant?: 'info' | 'success' | 'default'; price: number; onAdd: () => void; active: boolean;
        hint?: string;
    }) => (
        <div style={{
            padding: '14px', borderRadius: '12px', border: '1.5px solid #f1f5f9',
            background: '#fff', opacity: active ? 1 : 0.55, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'border-color 0.15s, box-shadow 0.15s', display: 'flex', flexDirection: 'column', gap: '8px',
        }}
            onMouseEnter={e => { if (active) { (e.currentTarget as HTMLDivElement).style.borderColor = '#bfdbfe'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(37,99,235,0.08)'; } }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#f1f5f9'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        {icon}
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
                    </div>
                    {sub && <p style={{ margin: '0 0 3px', fontSize: '12px', color: '#64748b' }}>{sub}</p>}
                    {badge && <Badge variant={badgeVariant || 'default'} size="sm">{badge}</Badge>}
                    {!active && <Badge variant="default" size="sm">Inactive</Badge>}
                    {hint && (
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#2563eb', fontWeight: '600', background: '#eff6ff', borderRadius: '5px', padding: '2px 6px', display: 'inline-block' }}>
                            {hint}
                        </p>
                    )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap' }}>
                        Rs. {Number(price).toLocaleString()}
                    </p>
                    <button onClick={onAdd} disabled={!active} style={{
                        width: '32px', height: '32px', borderRadius: '9px',
                        background: active ? '#eff6ff' : '#f1f5f9', border: 'none',
                        cursor: active ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: active ? '#2563eb' : '#94a3b8', transition: 'background 0.15s', marginLeft: 'auto',
                    }}
                        onMouseEnter={e => { if (active) e.currentTarget.style.background = '#dbeafe'; }}
                        onMouseLeave={e => { if (active) e.currentTarget.style.background = '#eff6ff'; }}
                    >
                        <Plus style={{ width: '15px', height: '15px' }} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <style>{`
                @keyframes qb-flash {
                    0%   { background-color: #fef08a; transform: scale(1.08); box-shadow: 0 0 8px rgba(234,179,8,0.5); }
                    100% { background-color: #eff6ff; transform: scale(1); box-shadow: none; }
                }
                .qb-panel::-webkit-scrollbar { width: 4px; }
                .qb-panel::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
                .qb-panel::-webkit-scrollbar-track { background: transparent; }
                .qb-tabs::-webkit-scrollbar { display: none; }
                .qb-tabs { scrollbar-width: none; }
            `}</style>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
            }}>
                {/* ── Fixed header ── */}
                <div style={{ flexShrink: 0, paddingBottom: '14px' }}>
                    <h1 style={{ margin: '0 0 3px', fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>
                        {editingQuoteId ? 'Edit Draft Quote' : 'Quote Builder'}
                    </h1>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        {editingQuoteId ? 'Update your draft and finalise when ready' : 'Enter system size first, then add products'}
                    </p>
                </div>

                {/* Draft notice */}
                {(loadingDraft || !!editingQuoteId) && (
                    <div style={{
                        flexShrink: 0, marginBottom: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
                        padding: '10px 14px', borderRadius: '10px',
                        background: '#eff6ff', border: '1px solid #bfdbfe',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Pencil style={{ width: '14px', height: '14px', color: '#2563eb' }} />
                            <div>
                                <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: '#1e40af' }}>
                                    {loadingDraft ? 'Loading draft…' : 'Editing draft'}
                                </p>
                                {editingQuoteId && (
                                    <p style={{ margin: 0, fontSize: '12px', color: '#3b82f6' }}>Changes will update this draft until you create the quote.</p>
                                )}
                            </div>
                        </div>
                        {editingQuoteId && (
                            <Link to={`/quotes/${editingQuoteId}`} style={{ textDecoration: 'none' }}>
                                <button style={{ height: '30px', padding: '0 12px', fontSize: '12px', fontWeight: '600', color: '#2563eb', background: '#fff', border: '1px solid #bfdbfe', borderRadius: '7px', cursor: 'pointer' }}>
                                    View Draft
                                </button>
                            </Link>
                        )}
                    </div>
                )}

                {/* TWO-COLUMN LAYOUT */}
                <div style={{
                    flex: 1,
                    minHeight: 0,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 360px',
                    gap: '16px',
                    alignItems: 'stretch',
                }}>

                    {/* ════ LEFT PANEL ════ */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        minHeight: 0,
                        minWidth: 0,
                    }}>
                        {/* Tab bar */}
                        <div style={{ flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
                            {/* Left arrow */}
                            <button
                                onClick={() => scrollTabs('left')}
                                style={{
                                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '26px', height: '26px', borderRadius: '7px', border: 'none',
                                    background: canScrollLeft ? '#fff' : 'transparent',
                                    boxShadow: canScrollLeft ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                                    cursor: canScrollLeft ? 'pointer' : 'default',
                                    opacity: canScrollLeft ? 1 : 0.3,
                                    transition: 'all 0.15s', zIndex: 1,
                                }}
                            >
                                <ChevronLeft style={{ width: '14px', height: '14px', color: '#475569' }} />
                            </button>

                            {/* Scrollable strip */}
                            <div
                                ref={tabsRef}
                                className="qb-tabs"
                                onScroll={updateTabsScroll}
                                style={{ flex: 1, display: 'flex', gap: '3px', overflowX: 'auto' }}
                            >
                                {tabs.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '7px 14px', borderRadius: '9px', border: 'none',
                                        fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap',
                                        cursor: 'pointer', flexShrink: 0,
                                        background: activeTab === tab.id ? '#fff' : 'transparent',
                                        color: activeTab === tab.id ? '#0f172a' : '#64748b',
                                        boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                                        transition: 'all 0.15s',
                                    }}>
                                        <tab.icon style={{ width: '14px', height: '14px', color: activeTab === tab.id ? tab.color : '#94a3b8' }} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Right arrow */}
                            <button
                                onClick={() => scrollTabs('right')}
                                style={{
                                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '26px', height: '26px', borderRadius: '7px', border: 'none',
                                    background: canScrollRight ? '#fff' : 'transparent',
                                    boxShadow: canScrollRight ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                                    cursor: canScrollRight ? 'pointer' : 'default',
                                    opacity: canScrollRight ? 1 : 0.3,
                                    transition: 'all 0.15s', zIndex: 1,
                                }}
                            >
                                <ChevronRight style={{ width: '14px', height: '14px', color: '#475569' }} />
                            </button>
                        </div>

                        {/* Search + toggle */}
                        <div style={{ flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#9ca3af', pointerEvents: 'none' }} />
                                <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search products…"
                                    style={{ width: '100%', height: '36px', paddingLeft: '32px', paddingRight: '10px', fontSize: '13px', border: '1.5px solid #e2e8f0', borderRadius: '9px', background: '#f8fafc', outline: 'none', boxSizing: 'border-box', color: '#1e293b' }}
                                    onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                                />
                            </div>
                            <button onClick={() => setShowInactive(v => !v)} style={{
                                display: 'flex', alignItems: 'center', gap: '5px', height: '36px', padding: '0 12px',
                                borderRadius: '9px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer',
                                fontSize: '13px', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap', flexShrink: 0,
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                            >
                                <EyeOff style={{ width: '13px', height: '13px', color: '#94a3b8' }} />
                                {showInactive ? 'Hide inactive' : 'Show inactive'}
                            </button>
                        </div>

                        {/* Product grid */}
                        <div className="qb-panel" style={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            background: '#fff', border: '1px solid #f1f5f9',
                            borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            padding: '14px',
                        }}>
                            {(() => {
                                const loading = activeTab === 'solar-panels' ? loadingPanels
                                    : activeTab === 'inverters' ? loadingInverters
                                        : activeTab === 'structures' ? loadingStructures
                                            : activeTab === 'misc-items' ? loadingMiscItems
                                                : activeTab === 'batteries' ? loadingBatteries
                                                    : activeTab === 'service-items' ? loadingServiceItems
                                                        : loadingElectricalItems;
                                if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8', fontSize: '14px' }}>Loading…</div>;

                                const items: React.ReactNode[] = [];
                                if (activeTab === 'solar-panels') {
                                    if (!visiblePanels.length) return <EmptyState text="No solar panels found" />;
                                    visiblePanels.forEach((p: SolarPanel) => {
                                        const panelQty = kw > 0 && p.wattage && p.wattage > 0
                                            ? Math.ceil((kw * 1000) / p.wattage)
                                            : null;
                                        const hint = panelQty !== null
                                            ? `${panelQty} panels needed for ${kw} kW`
                                            : kw > 0 && (!p.wattage || p.wattage <= 0)
                                                ? 'No wattage — cannot auto-calculate'
                                                : undefined;
                                        items.push(<ProductCard key={p.id} active={p.isActive} icon={<Sun style={{ width: '14px', height: '14px', color: '#ca8a04' }} />} title={p.model} sub={p.brand?.name} badge={p.wattage ? `${p.wattage}W` : undefined} badgeVariant="info" price={Number(p.price)} onAdd={() => addToCart(p, QuoteItemType.SOLAR_PANEL, p.brand?.name)} hint={hint} />);
                                    });
                                } else if (activeTab === 'inverters') {
                                    if (!visibleInvs.length) return <EmptyState text="No inverters found" />;
                                    visibleInvs.forEach((i: Inverter) => items.push(<ProductCard key={i.id} active={i.isActive} icon={<Zap style={{ width: '14px', height: '14px', color: '#16a34a' }} />} title={i.model} sub={i.brand?.name} badge={i.capacity || undefined} badgeVariant="success" price={Number(i.price)} onAdd={() => addToCart(i, QuoteItemType.INVERTER, i.brand?.name)} />));
                                } else if (activeTab === 'structures') {
                                    if (!visibleStructs.length) return <EmptyState text="No structures found" />;
                                    visibleStructs.forEach((s: Structure) => {
                                        // Always show base price; hint shows computed total (base × kW × 1000)
                                        const computedTotal = kw > 0 ? s.price * kw * 1000 : null;
                                        const hint = computedTotal !== null
                                            ? `Total: Rs. ${computedTotal.toLocaleString()} (${s.price} × ${kw}kW × 1000W)`
                                            : undefined;
                                        items.push(<ProductCard key={s.id} active={s.isActive} icon={<Building style={{ width: '14px', height: '14px', color: '#7c3aed' }} />} title={s.type.replace(/_/g, ' ')} sub={s.description || undefined} price={Number(s.price)} onAdd={() => addToCart(s, QuoteItemType.STRUCTURE)} hint={hint} />);
                                    });
                                } else if (activeTab === 'misc-items') {
                                    if (!visibleMisc.length) return <EmptyState text="No misc items found" />;
                                    visibleMisc.forEach((m: MiscItem) => {
                                        items.push(<ProductCard key={m.id} active={m.isActive} icon={<Package style={{ width: '14px', height: '14px', color: '#ea580c' }} />} title={m.name} sub={m.unit ? `per ${m.unit}` : undefined} badge={m.type.replace(/_/g, ' ')} price={Number(m.price)} onAdd={() => addToCart(m, QuoteItemType.MISC_ITEM)} />);
                                    });
                                } else if (activeTab === 'batteries') {
                                    if (!visibleBatteries.length) return <EmptyState text="No batteries found" />;
                                    visibleBatteries.forEach((b: Battery) => {
                                        items.push(<ProductCard key={b.id} active={b.isActive} icon={<BatteryFull style={{ width: '14px', height: '14px', color: '#16a34a' }} />} title={b.name} badge={b.capacity || undefined} badgeVariant="success" price={Number(b.price)} onAdd={() => addToCart(b, QuoteItemType.BATTERY)} />);
                                    });
                                } else if (activeTab === 'service-items') {
                                    if (!visibleServices.length) return <EmptyState text="No services found" />;
                                    visibleServices.forEach((s: ServiceItem) => {
                                        const computedTotal = kw > 0 ? s.price * kw * 1000 : null;
                                        const hint = computedTotal !== null
                                            ? `Total: Rs. ${computedTotal.toLocaleString()} (${s.price} × ${kw}kW × 1000W)`
                                            : undefined;
                                        items.push(<ProductCard key={s.id} active={s.isActive} icon={<Wrench style={{ width: '14px', height: '14px', color: '#2563eb' }} />} title={s.name} sub={s.unit ? `per ${s.unit}` : undefined} price={Number(s.price)} onAdd={() => addToCart(s, QuoteItemType.SERVICE)} hint={hint} />);
                                    });
                                } else {
                                    if (!visibleElectrical.length) return <EmptyState text="No electrical items found" />;
                                    visibleElectrical.forEach((e: ElectricalItem) => {
                                        const computedTotal = kw > 0 ? e.price * kw * 1000 : null;
                                        const hint = computedTotal !== null
                                            ? `Total: Rs. ${computedTotal.toLocaleString()} (${e.price} × ${kw}kW × 1000W)`
                                            : undefined;
                                        items.push(<ProductCard key={e.id} active={e.isActive} icon={<Plug style={{ width: '14px', height: '14px', color: '#a21caf' }} />} title={e.name} sub={e.unit ? `per ${e.unit}` : undefined} price={Number(e.price)} onAdd={() => addToCart(e, QuoteItemType.ELECTRICAL)} hint={hint} />);
                                    });
                                }
                                return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>{items}</div>;
                            })()}
                        </div>
                    </div>

                    {/* ════ RIGHT PANEL ════ */}
                    <div className="qb-panel" style={{
                        overflowY: 'auto',
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        paddingRight: '2px',
                        paddingBottom: '12px',
                    }}>

                        {/* ── System Size — top-level prominent field ── */}
                        <div style={{
                            background: systemSize ? 'linear-gradient(135deg, #eff6ff, #f0fdf4)' : '#fff8ed',
                            border: `1.5px solid ${systemSize ? '#bfdbfe' : '#fcd34d'}`,
                            borderRadius: '14px',
                            padding: '14px 15px',
                            flexShrink: 0,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '18px' }}>⚡</span>
                                <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>System Size</span>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626', background: '#fff1f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '1px 7px', marginLeft: 'auto' }}>
                                    Required first
                                </span>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    placeholder="e.g. 5"
                                    value={systemSize}
                                    onChange={e => setSystemSize(e.target.value === '' ? '' : Number(e.target.value))}
                                    style={{
                                        width: '100%', height: '44px',
                                        paddingLeft: '14px', paddingRight: '52px',
                                        fontSize: '18px', fontWeight: '800', color: '#0f172a',
                                        background: '#fff', border: `2px solid ${systemSize ? '#2563eb' : '#fbbf24'}`,
                                        borderRadius: '10px', outline: 'none', boxSizing: 'border-box',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = systemSize ? '#2563eb' : '#fbbf24'; e.target.style.boxShadow = 'none'; }}
                                />
                                <span style={{
                                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                    fontSize: '14px', fontWeight: '700', color: '#64748b', pointerEvents: 'none',
                                }}>kW</span>
                            </div>
                            {systemSize && (
                                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                                    ✓ {Number(systemSize)} kW — item quantities & prices auto-calculated
                                </p>
                            )}
                            {!systemSize && (
                                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#92400e', fontWeight: '500' }}>
                                    Set system size to auto-calculate panel qty, structure & misc prices
                                </p>
                            )}
                        </div>

                        {/* ── Customer Information ── */}
                        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flexShrink: 0, overflow: 'hidden' }}>
                            <div
                                onClick={() => setCustomerInfoExpanded(v => !v)}
                                style={{
                                    padding: '13px 15px', display: 'flex', alignItems: 'center', gap: '8px',
                                    cursor: 'pointer', userSelect: 'none',
                                    background: customerInfoExpanded ? '#f8fafc' : '#fff',
                                    borderBottom: customerInfoExpanded ? '1px solid #f1f5f9' : 'none',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                                onMouseLeave={e => { if (!customerInfoExpanded) e.currentTarget.style.background = '#fff'; }}
                            >
                                <span style={{ color: '#2563eb', display: 'flex' }}><User style={{ width: '15px', height: '15px' }} /></span>
                                <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a', flex: 1 }}>Customer Information</span>
                                {!customerInfoExpanded && customerInfo.name ? (
                                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '4px' }}>
                                        {customerInfo.name}{customerInfo.phone ? ` · ${customerInfo.phone}` : ''}
                                    </span>
                                ) : !customerInfoExpanded ? (
                                    <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700', background: '#fff1f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '2px 7px', marginRight: '4px', flexShrink: 0 }}>
                                        Required
                                    </span>
                                ) : null}
                                {customerInfoExpanded
                                    ? <ChevronUp style={{ width: '15px', height: '15px', color: '#94a3b8', flexShrink: 0 }} />
                                    : <ChevronDown style={{ width: '15px', height: '15px', color: '#94a3b8', flexShrink: 0 }} />
                                }
                            </div>
                            {customerInfoExpanded && (
                                <div style={{ padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
                                    <Field label="Customer Name *" icon={<User style={{ width: '13px', height: '13px' }} />}>
                                        <TextInput placeholder="Enter customer name" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
                                    </Field>
                                    <Field label="Phone" icon={<Phone style={{ width: '13px', height: '13px' }} />}>
                                        <TextInput placeholder="Enter phone number" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
                                    </Field>
                                    <Field label="Email" icon={<Mail style={{ width: '13px', height: '13px' }} />}>
                                        <TextInput type="email" placeholder="Enter email" value={customerInfo.email} onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })} />
                                    </Field>
                                    <Field label="Address" icon={<MapPin style={{ width: '13px', height: '13px' }} />}>
                                        <TextInput placeholder="Enter address" value={customerInfo.address} onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })} />
                                    </Field>
                                </div>
                            )}
                        </div>

                        {/* ── Quote Items ── */}
                        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flexShrink: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '13px 15px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#2563eb', display: 'flex' }}><FileText style={{ width: '15px', height: '15px' }} /></span>
                                <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a', flex: 1 }}>Quote Items</span>
                                <span key={cartItemCount} style={{
                                    padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '800',
                                    background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                                    animation: cartItemCount > 0 ? 'qb-flash 0.6s ease-out' : 'none',
                                    flexShrink: 0,
                                }}>
                                    {cart.length} added
                                </span>
                            </div>
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '24px 16px', color: '#94a3b8' }}>
                                    <FileText style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.35 }} />
                                    <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '600' }}>No items added yet</p>
                                    <p style={{ margin: 0, fontSize: '12px' }}>Set system size, then select products</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', padding: '12px 14px' }}>
                                    {cart.map(item => (
                                        <div key={item.tempId} style={{
                                            padding: '10px 12px', borderRadius: '10px',
                                            background: '#fafafa', border: '1px solid #f1f5f9',
                                            display: 'flex', flexDirection: 'column', gap: '8px',
                                        }}>
                                            {/* Row 1 – name + delete */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.itemName}
                                                </p>
                                                <button
                                                    onClick={() => removeFromCart(item.tempId)}
                                                    style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff1f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}
                                                >
                                                    <Trash2 style={{ width: '10px', height: '10px' }} />
                                                </button>
                                            </div>
                                            {/* Row 2 – unit price | qty stepper | line total */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {/* Unit price */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: '0 0 3px', fontSize: '10px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Unit Price</p>
                                                    <InlinePriceInput value={item.unitPrice} onChange={newPrice => updatePrice(item.tempId, newPrice)} />
                                                </div>
                                                {/* Qty stepper */}
                                                <div style={{ flexShrink: 0 }}>
                                                    <p style={{ margin: '0 0 3px', fontSize: '10px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'center' }}>Qty</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <button onClick={() => updateQuantity(item.tempId, -1)} style={{ width: '22px', height: '22px', borderRadius: '5px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                                                            <Minus style={{ width: '10px', height: '10px' }} />
                                                        </button>
                                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', minWidth: '22px', textAlign: 'center' }}>{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.tempId, +1)} style={{ width: '22px', height: '22px', borderRadius: '5px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                                                            <Plus style={{ width: '10px', height: '10px' }} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Line total */}
                                                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                                    <p style={{ margin: '0 0 3px', fontSize: '10px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Total</p>
                                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#2563eb', whiteSpace: 'nowrap' }}>
                                                        Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Pricing ── */}
                        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flexShrink: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '13px 15px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#2563eb', display: 'flex' }}><Calculator style={{ width: '15px', height: '15px' }} /></span>
                                <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>Pricing</span>
                            </div>
                            <div style={{ padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>Subtotal</span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>Discount</span>
                                    <input type="number" min="0" max="100" value={discount}
                                        onChange={e => setDiscount(e.target.value === '' ? '' : Math.min(100, Math.max(0, Number(e.target.value))))}
                                        style={{ width: '50px', height: '30px', textAlign: 'center', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '13px', fontWeight: '600', outline: 'none', background: '#f8fafc' }}
                                        onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                                    />
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>%</span>
                                    <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: '600', color: '#dc2626' }}>– Rs. {discountAmount.toLocaleString()}</span>
                                </div>
                                <div style={{ paddingTop: '10px', borderTop: '2px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>Base Total</span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Rs. {baseTotal.toLocaleString()}</span>
                                </div>
                                {/* Profit row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 10px' }}>
                                    <span style={{ fontSize: '13px', color: '#15803d', fontWeight: '600', flexShrink: 0 }}>Profit</span>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1.5px solid #86efac', borderRadius: '6px', padding: '0 8px 0 6px', height: '28px', width: '110px', boxSizing: 'border-box', flexShrink: 0 }}>
                                        <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', flexShrink: 0, userSelect: 'none' }}>Rs.</span>
                                        <input
                                            type="number" min="0"
                                            value={effectiveProfit}
                                            onChange={e => {
                                                const val = Number(e.target.value);
                                                setProfitOverride(isNaN(val) ? defaultProfit : val);
                                            }}
                                            onFocus={e => { e.target.style.outline = 'none'; }}
                                            style={{ flex: 1, minWidth: 0, height: '100%', padding: '0', fontSize: '12px', border: 'none', outline: 'none', background: 'transparent', color: '#15803d', fontWeight: '700' }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', background: '#dcfce7', borderRadius: '4px', padding: '2px 6px', flexShrink: 0 }}>
                                        {profitPct.toFixed(1)}%
                                    </span>
                                    {profitOverride !== null && (
                                        <button
                                            onClick={() => setProfitOverride(null)}
                                            title="Reset to 10%"
                                            style={{ marginLeft: 'auto', fontSize: '11px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', flexShrink: 0 }}
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <div style={{ paddingTop: '10px', borderTop: '2px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Total</span>
                                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#2563eb' }}>Rs. {total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Notes ── */}
                        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flexShrink: 0, padding: '13px 15px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Notes</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)}
                                placeholder="Add any notes for this quote…" rows={3}
                                style={{ width: '100%', padding: '8px 11px', fontSize: '13px', border: '1.5px solid #e2e8f0', borderRadius: '9px', background: '#f8fafc', color: '#1e293b', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5 }}
                                onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = '#fff'; }}
                                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                            />
                        </div>

                        {/* ── Action Buttons ── */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flexShrink: 0 }}>
                            <button onClick={() => handleSubmit('draft')} disabled={saveQuoteMutation.isPending} style={{
                                height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                fontSize: '13px', fontWeight: '700', borderRadius: '10px', cursor: 'pointer',
                                border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', transition: 'background 0.15s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                            >
                                <Save style={{ width: '14px', height: '14px' }} />
                                Save Draft
                            </button>
                            <button onClick={() => handleSubmit('created')} disabled={saveQuoteMutation.isPending} style={{
                                height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                fontSize: '13px', fontWeight: '700', borderRadius: '10px', cursor: 'pointer',
                                border: 'none', background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                                color: '#fff', boxShadow: '0 2px 8px rgba(37,99,235,0.28)', transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.38)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.28)'; }}
                            >
                                <Send style={{ width: '14px', height: '14px' }} />
                                Create Quote
                            </button>
                        </div>

                    </div>{/* end RIGHT PANEL */}

                </div>{/* end two-column grid */}

            </div>{/* end outer wrapper */}
        </>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px', color: '#94a3b8', fontSize: '14px' }}>
            {text}
        </div>
    );
}