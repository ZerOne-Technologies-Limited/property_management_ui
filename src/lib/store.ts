import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole, Tenant, RoomWithDetails } from '../types';
import type { LoginResponse } from '../types/auth';

interface AuthState {
    user: {
        id: string;
        role: UserRole;
        name: string;
    } | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (data: LoginResponse, role: UserRole) => void; // simplistic for now
    logout: () => void;
}

interface UIState {
    selectedPropertyId: string | null;
    isSidebarOpen: boolean;
    activeDrawer: {
        type: 'ROOM' | 'TENANT' | 'PAYMENT' | 'NONE';
        dataOrId: any;
    };
    setSelectedPropertyId: (id: string) => void;
    toggleSidebar: () => void;
    openDrawer: (type: 'ROOM' | 'TENANT' | 'PAYMENT', dataOrId: any) => void;
    closeDrawer: () => void;
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
            login: (data, role) => set({
                token: data.Token,
                isAuthenticated: true,
                user: { id: 'mock-user-id', role, name: 'Manager' } // decoding would happen here
            }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),

            // UI
            selectedPropertyId: null,
            isSidebarOpen: true,
            activeDrawer: { type: 'NONE', dataOrId: null },
            setSelectedPropertyId: (id) => set({ selectedPropertyId: id }),
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            openDrawer: (type, dataOrId) => set({ activeDrawer: { type, dataOrId } }),
            closeDrawer: () => set({ activeDrawer: { type: 'NONE', dataOrId: null } }),

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
                selectedPropertyId: state.selectedPropertyId
            }),
        }
    )
);
