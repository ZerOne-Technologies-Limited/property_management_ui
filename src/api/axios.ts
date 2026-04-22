import axios from "axios";
import type { loginModel, LoginResponse } from "../types/auth";
import type { CreatePropertyPayload, CreateRoomPayload, UpdateRoomPayload, RegisterTenantPayload, UpdateTenantPayload, CreateTransactionPayload, Property, Room, Tenant, Transaction, TransactionFilters } from "../types";

import { useAppStore } from "../lib/store";

// const token = localStorage.getItem('token');

// API instance is kept but not used for data fetching in this mock implementation
// API instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5288/', // Fallback to localhost if env var missing
  timeout: 10000,
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token dynamically
api.interceptors.request.use((config) => {
  // we need to dynamically import the store to avoid circular dependencies if any, 
  // or just import at top if safe. 
  // Let's try importing at top first since store doesn't seem to import axios.
  const token = useAppStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      useAppStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (credentials: loginModel): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials);
  return data;
};

export const fetchProperties = async (): Promise<Property[]> => {
  const { data } = await api.get<any>('/property/properties');

  // Handle "Properties" wrapper from API
  const rawProperties = data?.Properties || (Array.isArray(data) ? data : []);

  // Map PascalCase to camelCase/frontend model
  return rawProperties.map((p: any) => ({
    id: String(p.Id || p.id),
    name: p.Name || p.name,
    type: p.Type || p.type,
    created_at: p.CreatedAt || p.created_at || new Date().toISOString(),
    created_by: p.CreatedBy || p.created_by || 'system',
    dashboard_filter_state: p.FilterState || p.filter_state || p.DashboardFilterState || null,
    room_count: p.RoomCount ?? p.room_count ?? 0,
    tenant_count: p.TenantCount ?? p.tenant_count ?? 0,
  }));
}

export const createProperty = async (propertyDetails: CreatePropertyPayload): Promise<Property> => {
  const { data } = await api.post<any>('/property/property', propertyDetails);

  // Map PascalCase response to camelCase/frontend model
  // Assuming API returns { Id, Name, Type, CreatedAt, CreatedBy }
  return {
    id: String(data.Id || data.id),
    name: data.Name || data.name,
    type: data.Type || data.type || propertyDetails.PropertyType,
    created_at: data.CreatedAt || data.created_at || new Date().toISOString(),
    created_by: data.CreatedBy || data.created_by || 'system'
  };
}

export const fetchRooms = async (propertyId: string): Promise<Room[]> => {
  if (!propertyId) return [];
  const { data } = await api.get<any>(`/rooms/${propertyId}`);

  // Handle "Rooms" wrapper from API
  const rawRooms = data?.Rooms || (Array.isArray(data) ? data : []);

  // Map PascalCase to camelCase/frontend model
  return rawRooms.map((r: any) => ({
    id: String(r.RoomId || r.id),
    property_id: String(r.PropertyId || r.property_id),
    name: r.RoomName || r.name,
    maximum_capacity: r.RoomCapacity || r.maximum_capacity,
    area: r.Area || r.area || null,
    notes: r.Notes || r.notes || '',
    created_at: r.CreatedAt || new Date().toISOString() // Default if missing
  }));
}

export const createRoom = async (propertyId: string, payload: CreateRoomPayload): Promise<Room> => {
  // Endpoint: POST /property/{propertyId}/room
  const { data } = await api.post<any>(`/property/${propertyId}/room`, payload);

  // Return mapped room (best effort mapping, assuming API returns the created room in a similar format)
  // If API returns just the payload or different format, we might need to adjust.
  // Based on other endpoints, it might be wrapped or PascalCase.
  // For now, let's assume it returns the created object or we might just allow void if we invalidate queries.
  // To be safe with the mutation, let's return it mapped if possible, or just the data.

  // If data is the created room directly (PascalCase):
  return {
    id: String(data.RoomId || data.id),
    property_id: String(data.PropertyId || propertyId),
    name: data.RoomName || payload.RoomName,
    maximum_capacity: data.RoomCapacity || payload.RoomCapacity,
    area: data.Area || payload.Area,
    notes: data.Notes || payload.Notes,
    created_at: data.CreatedAt || new Date().toISOString()
  };
}

export const updateRoom = async (propertyId: string, roomId: string, payload: UpdateRoomPayload): Promise<Room> => {
  // Endpoint: PATCH /rooms/{propertyId}/{roomId}
  const { data } = await api.patch<any>(`/rooms/${propertyId}/${roomId}`, payload);

  console.log('Update room API response:', data);
  console.log('Update room payload sent:', payload);

  // Map response - API returns {Id, RoomName, RoomCapacity, Area, Notes}
  return {
    id: String(data.Id || data.RoomId || data.id || roomId),
    property_id: String(data.PropertyId || data.property_id || propertyId),
    name: data.RoomName || data.name,
    maximum_capacity: data.RoomCapacity || data.maximum_capacity,
    area: data.Area || data.area,
    notes: data.Notes || data.notes || '',
    created_at: data.CreatedAt || data.created_at || new Date().toISOString()
  };
}


export const registerTenant = async (propertyId: string, payload: RegisterTenantPayload): Promise<Tenant> => {
  // Endpoint: POST /tenant/{propertyId}/register
  const { data } = await api.post<any>(`/tenant/${propertyId}/register`, payload);

  // Map response
  return {
    id: String(data.TenantId || data.id),
    first_name: data.FirstName || payload.FirstName,
    last_name: data.LastName || payload.LastName,
    whatsapp_number: data.WhatsappNumber || payload.PhoneNumber,
    room_id: String(data.RoomId || payload.RoomId),
    property_id: propertyId,
    created_at: data.CreatedAt || new Date().toISOString()
  };
}

export const updateTenant = async (tenantId: string, payload: UpdateTenantPayload): Promise<Tenant> => {
  // Endpoint: PATCH /tenant/{tenantId}
  const { data } = await api.patch<any>(`/tenant/${tenantId}`, payload);

  // Map response - API should return updated tenant
  return {
    id: String(data.TenantId || data.id || tenantId),
    first_name: data.FirstName || data.first_name,
    last_name: data.LastName || data.last_name,
    whatsapp_number: data.WhatsappNumber || data.whatsapp_number,
    room_id: String(data.RoomId || data.room_id),
    property_id: String(data.PropertyId || data.property_id),
    created_at: data.CreatedAt || data.created_at || new Date().toISOString()
  };
}


export const fetchTenants = async (propertyId?: string, roomId?: string): Promise<Tenant[]> => {
  // Construct URL based on available params
  // Endpoint: /tenant?PropertyId=X&RoomId=Y
  let url = '/tenant';
  const params = new URLSearchParams();
  if (propertyId) params.append('PropertyId', propertyId);
  if (roomId) params.append('RoomId', roomId);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const { data } = await api.get<any>(url);

  // Handle "Tenants" wrapper from API
  const rawTenants = data?.Tenants || (Array.isArray(data) ? data : []);

  return rawTenants.map((t: any) => ({
    id: String(t.TenantId || t.id),
    first_name: t.FirstName || t.first_name,
    last_name: t.LastName || t.last_name,
    whatsapp_number: t.WhatsappNumber || t.whatsapp_number || null,
    room_id: (t.RoomId != null && t.RoomId !== 0) ? String(t.RoomId) : (t.room_id != null && t.room_id !== '0' && t.room_id !== 0) ? String(t.room_id) : null,
    property_id: propertyId || '',
    created_at: t.CreatedAt || new Date().toISOString()
  }));
}

export const createTransaction = async (payload: CreateTransactionPayload): Promise<Transaction> => {
  // Endpoint: POST /transaction
  const { data } = await api.post<any>('/transactions', payload);

  // The response is wrapped in "Transaction" object based on user request example
  const rawTransaction = data?.Transaction || data;

  return {
    id: String(rawTransaction.Id || rawTransaction.id),
    amount: rawTransaction.Amount || payload.Amount,
    tenant_id: String(rawTransaction.TenantId || payload.TenantId),
    room_id: String(rawTransaction.RoomId || payload.RoomId),
    property_id: String(rawTransaction.PropertyId || payload.PropertyId),
    notes: rawTransaction.Notes || rawTransaction.notes || payload.Notes || '',
    created_at: rawTransaction.CreatedAt || new Date().toISOString()
  };
}

export const fetchTenantById = async (tenantId: number): Promise<Tenant | null> => {
  const { data } = await api.get<any>(`/tenant?TenantId=${tenantId}`);
  const raw = data?.Tenants?.[0];
  if (!raw) return null;
  return {
    id: String(raw.TenantId || raw.id),
    first_name: raw.FirstName || raw.first_name,
    last_name: raw.LastName || raw.last_name,
    whatsapp_number: raw.WhatsappNumber || raw.whatsapp_number || null,
    room_id: (raw.RoomId != null && raw.RoomId !== 0) ? String(raw.RoomId) : (raw.room_id != null && raw.room_id !== '0' && raw.room_id !== 0) ? String(raw.room_id) : null,
    property_id: '',
    created_at: raw.CreatedAt || new Date().toISOString()
  };
}

export const updateProperty = async (id: string, name: string, type: import('./types').PropertyType): Promise<void> => {
  await api.patch(`/property/${id}`, { PropertyId: Number(id), PropertyName: name, PropertyType: type });
};

export const deleteProperty = async (id: string): Promise<void> => {
  await api.delete(`/property/${id}`);
};

export const savePropertyFilter = async (propertyId: string, filterState: string | null): Promise<void> => {
  await api.patch(`/property/${propertyId}/filter`, { FilterState: filterState });
};

export const unassignTenantFromRoom = async (tenantId: string): Promise<void> => {
  await api.patch(`/tenant/${tenantId}/unassign`);
};

export const registerWithProperty = async (payload: {
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  Password: string;
  PropertyName: string;
  PropertyType: import('../types').PropertyType;
}): Promise<import('../types/auth').LoginResponse> => {
  const { data } = await api.post<import('../types/auth').LoginResponse>('/manager/setup', payload);
  return data;
};

export const fetchPropertyUsers = async (propertyId: string): Promise<{
  users: import('../types').PropertyUser[];
  callerRole: import('../types').PropertyUserRole;
}> => {
  const { data } = await api.get<any>(`/property/${propertyId}/users`);
  return {
    users: (data?.Users ?? []).map((u: any) => ({
      id: String(u.UserId ?? u.id),
      name: u.Name ?? u.name,
      phone: u.Phone ?? u.phone ?? null,
      role: (u.Role ?? u.role) as import('../types').PropertyUserRole,
    })),
    callerRole: (data?.CallerRole ?? data?.callerRole) as import('../types').PropertyUserRole,
  };
};

export const addPropertyUser = async (
  propertyId: string,
  phone: string,
  role: import('../types').PropertyUserRole,
): Promise<import('../types').PropertyUser> => {
  const { data } = await api.post<any>(`/property/${propertyId}/users`, {
    PropertyId: Number(propertyId),
    PhoneNumber: phone,
    Role: role,
  });
  return {
    id: String(data.UserId ?? data.id),
    name: data.Name ?? data.name,
    phone: data.Phone ?? data.phone ?? null,
    role: (data.Role ?? data.role) as import('../types').PropertyUserRole,
  };
};

export const updatePropertyUserRole = async (
  propertyId: string,
  userId: string,
  role: import('../types').PropertyUserRole,
): Promise<import('../types').PropertyUser> => {
  const { data } = await api.patch<any>(`/property/${propertyId}/users/${userId}/role`, {
    PropertyId: Number(propertyId),
    UserId: Number(userId),
    Role: role,
  });
  return {
    id: String(data.UserId ?? data.id),
    name: data.Name ?? data.name,
    phone: data.Phone ?? data.phone ?? null,
    role: (data.Role ?? data.role) as import('../types').PropertyUserRole,
  };
};

export const removePropertyUser = async (propertyId: string, userId: string): Promise<void> => {
  await api.delete(`/property/${propertyId}/users/${userId}`);
};

export const fetchTransactions = async (filters: TransactionFilters): Promise<Transaction[]> => {
  const params = new URLSearchParams();

  if (filters.MinAmount !== undefined) params.append('MinAmount', String(filters.MinAmount));
  if (filters.MaxAmount !== undefined) params.append('MaxAmount', String(filters.MaxAmount));
  if (filters.FromDate) params.append('FromDate', filters.FromDate + 'T00:00:00Z');
  if (filters.ToDate) params.append('ToDate', filters.ToDate + 'T23:59:59.999Z');
  if (filters.PropertyId !== undefined) params.append('PropertyId', String(filters.PropertyId));
  if (filters.RoomId !== undefined) params.append('RoomId', String(filters.RoomId));
  if (filters.TenantId !== undefined) params.append('TenantId', String(filters.TenantId));

  const { data } = await api.get<any>(`/transactions?${params.toString()}`);

  const rawTransactions = data?.Transactions || (Array.isArray(data) ? data : []);

  return rawTransactions.map((t: any) => ({
    id: String(t.Id || t.id),
    amount: t.Amount || t.amount,
    tenant_id: String(t.TenantId || t.tenant_id),
    room_id: String(t.RoomId || t.room_id),
    property_id: String(t.PropertyId || t.property_id),
    notes: t.Notes || t.notes || '',
    created_at: t.CreatedAt || new Date().toISOString()
  }));
}

