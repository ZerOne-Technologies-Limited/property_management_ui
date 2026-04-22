import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole, Tenant, RoomWithDetails } from '../types';
import type { LoginResponse } from '../types/auth';

interface AuthState {
    user: {
        id: string;
        role: UserRole;
        name: string;
        phone: string | null;
    } | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (data: LoginResponse, role: UserRole) => void;
    logout: () => void;
}

interface UIState {
    selectedPropertyId: string | null;
    isSidebarOpen: boolean;
    activeDrawer: {
        type: 'ROOM' | 'TENANT' | 'PAYMENT' | 'PAYMENT_HISTORY' | 'NONE';
        dataOrId: any;
    };
    dateFilter: { from: string | null; to: string | null };
    hasSeenTour: boolean;
    setSelectedPropertyId: (id: string) => void;
    toggleSidebar: () => void;
    openDrawer: (type: 'ROOM' | 'TENANT' | 'PAYMENT' | 'PAYMENT_HISTORY', dataOrId: any) => void;
    closeDrawer: () => void;
    setDateFilter: (from: string | null, to: string | null) => void;
    setHasSeenTour: (v: boolean) => void;
}

interface DataState {
    // Simple caching
    rooms: Record<string, RoomWithDetails[]>; // Keyed by propertyId
    tenants: Record<string, Tenant[]>; // Keyed by roomId or propertyId
    setRooms: (propertyId: string, rooms: RoomWithDetails[]) => void;
    setTenants: (propertyId: string, tenants: Tenant[]) => void;
}

interface AppState extends AuthState, UIState, DataState { }

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Auth
            user: null,
            token: null,
            isAuthenticated: false,
            login: (data, _role) => {
                // Decode JWT payload to extract real user claims
                let id = '';
                let name = 'User';
                let phone: string | null = null;
                let role: UserRole = 'Manager';
                try {
                    const payload = JSON.parse(atob(data.Token.split('.')[1]));
                    id = String(payload['UserId'] ?? payload['userId'] ?? '');
                    name = payload['name'] ?? payload['unique_name'] ?? 'User';
                    phone = payload['phone_number'] ?? payload['PhoneNumber'] ?? null;
                    const roles = payload['role'] ?? payload['roles'] ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                    if (Array.isArray(roles)) role = roles[0] as UserRole;
                    else if (roles) role = roles as UserRole;
                } catch { /* keep defaults */ }
                set({ token: data.Token, isAuthenticated: true, user: { id, role, name, phone } });
            },
            logout: () => set({ user: null, token: null, isAuthenticated: false }),

            // UI
            selectedPropertyId: null,
            isSidebarOpen: true,
            activeDrawer: { type: 'NONE', dataOrId: null },
            dateFilter: { from: null, to: null },
            hasSeenTour: false,
            setSelectedPropertyId: (id) => set({ selectedPropertyId: id }),
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            openDrawer: (type, dataOrId) => set({ activeDrawer: { type, dataOrId } }),
            closeDrawer: () => set({ activeDrawer: { type: 'NONE', dataOrId: null } }),
            setDateFilter: (from, to) => set({ dateFilter: { from, to } }),
            setHasSeenTour: (v) => set({ hasSeenTour: v }),

            // Data
            rooms: {},
            tenants: {},
            setRooms: (propertyId, rooms) => set((state) => ({
                rooms: { ...state.rooms, [propertyId]: rooms }
            })),
            setTenants: (propertyId, tenants) => set((state) => ({
                tenants: { ...state.tenants, [propertyId]: tenants }
            })),
        }),
        {
            name: 'bhd-storage',
            partialize: (state) => ({
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                selectedPropertyId: state.selectedPropertyId,
                hasSeenTour: state.hasSeenTour,
            }),
        }
    )
);
