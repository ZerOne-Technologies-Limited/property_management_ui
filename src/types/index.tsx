export type PropertyType = 'BoardingHouse' | 'Lodge' | 'Hotel' | 'Hostel';
export type UserRole = 'SuperAdmin' | 'Manager';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  created_at: string;
  created_by: string;
  dashboard_filter_state?: string | null;
}

export interface CreatePropertyPayload {
  Name: string;
  PropertyType: PropertyType;
}

export interface CreateRoomPayload {
  RoomName: string;
  RoomCapacity: number;
  Area: number;
  Notes: string;
}

export interface UpdateRoomPayload {
  RoomName?: string;
  RoomCapacity?: number;
  Area?: number;
  Notes?: string;
}


export interface Room {
  id: string;
  property_id: string;
  name: string;
  maximum_capacity: number;
  area: number | null;
  notes: string;
  created_at: string;
}

export interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  whatsapp_number: string | null;
  room_id: string | null;
  property_id: string;
  created_at: string;
}

export interface RegisterTenantPayload {
  RoomId: number;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  Password?: string;
}

export interface UpdateTenantPayload {
  RoomId?: number;
  WhatsappNumber?: string;
}


export interface CreateTransactionPayload {
  Amount: number;
  RoomId: number;
  PropertyId: number;
  TenantId: number;
  Notes?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  tenant_id: string;
  room_id: string;
  property_id: string;
  notes: string;
  created_at: string;
}

export interface TransactionFilters {
  MinAmount?: number;
  MaxAmount?: number;
  FromDate?: string;
  ToDate?: string;
  RoomId?: number;
  PropertyId?: number;
  TenantId?: number;
}

export interface UserProperty {
  id: string;
  user_id: string;
  property_id: string;
  role: UserRole;
  created_at: string;
}

export interface RoomWithDetails extends Room {
  tenants: Tenant[];
  total_amount?: number;
  outstanding_balance?: number;
  occupancy_percentage?: number;
}

export interface GlobalFilters {
  dateRange: {
    from: string;
    to: string;
  };
  tenantId?: string;
  roomIds: string[];
  paymentStatus?: 'Paid' | 'Partial' | 'Unpaid';
  propertyType?: PropertyType;
}
