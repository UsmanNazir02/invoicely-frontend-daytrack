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

export interface UpdateBrandDto extends Partial<CreateBrandDto> { }

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

export interface UpdateSolarPanelDto extends Partial<CreateSolarPanelDto> { }

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

export interface UpdateInverterDto extends Partial<CreateInverterDto> { }

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

export interface UpdateStructureDto extends Partial<CreateStructureDto> { }

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

export interface UpdateMiscItemDto extends Partial<CreateMiscItemDto> { }

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
    validUntil?: string;
    items: CreateQuoteItemDto[];
}

export interface UpdateQuoteDto extends Partial<CreateQuoteDto> {
    status?: QuoteStatus;
}

export interface QuoteFilterDto extends FilterDto {
    status?: QuoteStatus;
}