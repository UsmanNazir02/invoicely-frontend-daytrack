// API Response types matching backend
export interface ApiResponse<T = unknown> {
    statusCode: number;
    message: string;
    data?: T;
}

// Pagination
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// User types
export const UserRole = {
    ADMIN: 'admin',
    SALES: 'sales',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
    id: string;
    fullName?: string;
    email?: string;
    role: UserRole;
    profilePicture?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

// Brand types
export const BrandType = {
    INVERTER: 'inverter',
    SOLAR_PANEL: 'solar_panel',
} as const;

export type BrandType = (typeof BrandType)[keyof typeof BrandType];

export interface Brand {
    id: string;
    name: string;
    type: BrandType;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBrandDto {
    name: string;
    type: BrandType;
    isActive?: boolean;
}

export type UpdateBrandDto = Partial<CreateBrandDto>;

// Solar Panel types
export interface SolarPanel {
    id: string;
    model: string;
    price: number;
    wattage?: number;
    description?: string;
    isActive: boolean;
    brand: Brand;
    brandId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSolarPanelDto {
    model: string;
    price: number;
    wattage?: number;
    description?: string;
    brandId: string;
    isActive?: boolean;
}

export type UpdateSolarPanelDto = Partial<CreateSolarPanelDto>;

// Inverter types
export interface Inverter {
    id: string;
    model: string;
    price: number;
    description?: string;
    capacity?: string;
    isActive: boolean;
    brand: Brand;
    brandId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInverterDto {
    model: string;
    price: number;
    description?: string;
    capacity?: string;
    brandId: string;
    isActive?: boolean;
}

export type UpdateInverterDto = Partial<CreateInverterDto>;

// Structure types
export const StructureType = {
    GROUND_MOUNT: 'ground_mount',
    ELEVATED: 'elevated',
    ROOFTOP: 'rooftop',
} as const;

export type StructureType = (typeof StructureType)[keyof typeof StructureType];

export interface Structure {
    id: string;
    type: StructureType;
    price: number;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateStructureDto {
    type: StructureType;
    price: number;
    description?: string;
    isActive?: boolean;
}

export type UpdateStructureDto = Partial<CreateStructureDto>;

// Misc Item types
export const MiscItemType = {
    WIRE: 'wire',
    DB: 'db',
    CIVIL_WORK: 'civil_work',
    TRANSPORTATION: 'transportation',
    NET_METERING: 'net_metering',
    EARTHING: 'earthing',
    LIGHTENING_ARRESTOR: 'lightening_arrestor',
    SMART_METER: 'smart_meter',
} as const;

export type MiscItemType = (typeof MiscItemType)[keyof typeof MiscItemType];

export interface MiscItem {
    id: string;
    name: string;
    type: MiscItemType;
    price: number;
    unit?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMiscItemDto {
    name: string;
    type: MiscItemType;
    price: number;
    unit?: string;
    description?: string;
    isActive?: boolean;
}

export type UpdateMiscItemDto = Partial<CreateMiscItemDto>;

// Battery types
export interface Battery {
    id: string;
    name: string;
    capacity?: string;
    price: number;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBatteryDto {
    name: string;
    capacity?: string;
    price: number;
    description?: string;
    isActive?: boolean;
}

export type UpdateBatteryDto = Partial<CreateBatteryDto>;

// Service Item types
export interface ServiceItem {
    id: string;
    name: string;
    price: number;
    unit?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateServiceItemDto {
    name: string;
    price: number;
    unit?: string;
    description?: string;
    isActive?: boolean;
}

export type UpdateServiceItemDto = Partial<CreateServiceItemDto>;

// Electrical Item types
export interface ElectricalItem {
    id: string;
    name: string;
    price: number;
    unit?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateElectricalItemDto {
    name: string;
    price: number;
    unit?: string;
    description?: string;
    isActive?: boolean;
}

export type UpdateElectricalItemDto = Partial<CreateElectricalItemDto>;

// Filter types
export interface FilterDto {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface BrandFilterDto extends FilterDto {
    type?: BrandType;
}

// Quote types
export const QuoteStatus = {
    DRAFT: 'draft',
    CREATED: 'created',
    SENT: 'sent',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
} as const;

export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export const QuoteItemType = {
    SOLAR_PANEL: 'solar_panel',
    INVERTER: 'inverter',
    STRUCTURE: 'structure',
    MISC_ITEM: 'misc_item',
    BATTERY: 'battery',
    SERVICE: 'service',
    ELECTRICAL: 'electrical',
} as const;

export type QuoteItemType = (typeof QuoteItemType)[keyof typeof QuoteItemType];

export interface QuoteItem {
    id: string;
    quoteId: string;
    itemType: QuoteItemType;
    itemId: string;
    itemName: string;
    itemDescription?: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    brandName?: string;
}

export interface Quote {
    id: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    totalAmount: number;
    discountPercentage: number;
    discountAmount: number;
    finalAmount: number;
    status: QuoteStatus;
    notes?: string;
    systemSize?: number;
    validUntil?: string;
    createdById: string;
    createdBy?: User;
    items: QuoteItem[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateQuoteItemDto {
    itemType: QuoteItemType;
    itemId: string;
    itemName: string;
    itemDescription?: string;
    unitPrice: number;
    quantity: number;
    brandName?: string;
}

export interface CreateQuoteDto {
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    discountPercentage?: number;
    notes?: string;
    systemSize?: number;
    validUntil?: string;
    status?: QuoteStatus;
    items: CreateQuoteItemDto[];
}

export interface UpdateQuoteDto extends Partial<CreateQuoteDto> {
    status?: QuoteStatus;
}

export interface QuoteFilterDto extends FilterDto {
    status?: QuoteStatus;
    salesUserId?: string;
    roleFilter?: 'SALES' | 'ADMIN' | 'BOTH';
}
