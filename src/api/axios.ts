import axios from "axios";
import type { loginModel, LoginResponse } from "../types/auth";
import type { CreatePropertyPayload, Property, Room, Tenant, Transaction } from "../types";
import { mockProperties, mockRooms, mockTenants, mockTransactions } from "../data/mock";

const token = localStorage.getItem('token');

// API instance is kept but not used for data fetching in this mock implementation
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
});

export const loginUser = async (credentials: loginModel): Promise<LoginResponse> => {
  // Mock login - always success
  console.log("Mock login with:", credentials);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        Token: "mock_token_123",
        ExpiresAt: new Date(Date.now() + 3600 * 1000)
      } as LoginResponse);
    }, 500);
  });
};

export const fetchProperties = async (): Promise<Property[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProperties);
    }, 500);
  });
}

export const createProperty = async (propertyDetails: CreatePropertyPayload): Promise<Property> => {
  return new Promise((resolve) => {
    const newProperty: Property = {
      id: `prop_${Date.now()}`,
      ...propertyDetails,
      created_at: new Date().toISOString(),
      created_by: "current_user"
    };
    // In a real app we would push to the array, but here we just return it
    // mockProperties.push(newProperty); 
    resolve(newProperty);
  });
}

export const fetchRooms = async (propertyId: string): Promise<Room[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!propertyId) {
        resolve(mockRooms);
        return;
      }
      resolve(mockRooms.filter(r => r.property_id === propertyId));
    }, 500);
  });
}

export const fetchTenants = async (propertyId?: string): Promise<Tenant[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (propertyId) {
        resolve(mockTenants.filter(t => t.property_id === propertyId));
      } else {
        resolve(mockTenants);
      }
    }, 500);
  });
}

export const fetchTransactions = async (propertyId?: string): Promise<Transaction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (propertyId) {
        resolve(mockTransactions.filter(t => t.property_id === propertyId));
      } else {
        resolve(mockTransactions);
      }
    }, 500);
  });
}

