import type { Property, Room, Tenant, Transaction } from "../types";

export const mockProperties: Property[] = [
    {
        id: "prop_1",
        name: "Sunset Boarding House",
        type: "BoardingHouse",
        created_at: "2024-01-15T10:00:00Z",
        created_by: "user_1"
    },
    {
        id: "prop_2",
        name: "Ocean View Lodge",
        type: "Lodge",
        created_at: "2024-02-01T14:30:00Z",
        created_by: "user_1"
    },
    {
        id: "prop_3",
        name: "City Center Hostel",
        type: "Hostel",
        created_at: "2024-03-10T09:15:00Z",
        created_by: "user_2"
    }
];

export const mockRooms: Room[] = [
    {
        id: "room_1",
        property_id: "prop_1",
        name: "101",
        maximum_capacity: 2,
        area: 25,
        notes: "Near the entrance",
        created_at: "2024-01-16T10:00:00Z"
    },
    {
        id: "room_2",
        property_id: "prop_1",
        name: "102",
        maximum_capacity: 2,
        area: 25,
        notes: "Quiet corner",
        created_at: "2024-01-16T11:00:00Z"
    },
    {
        id: "room_3",
        property_id: "prop_2",
        name: "Suite A",
        maximum_capacity: 4,
        area: 45,
        notes: "Sea view",
        created_at: "2024-02-02T09:00:00Z"
    },
    {
        id: "room_4",
        property_id: "prop_3",
        name: "Dorm 1",
        maximum_capacity: 8,
        area: 60,
        notes: "Bunk beds",
        created_at: "2024-03-11T10:00:00Z"
    }
];

export const mockTenants: Tenant[] = [
    {
        id: "tenant_1",
        first_name: "John",
        last_name: "Doe",
        whatsapp_number: "+1234567890",
        room_id: "room_1",
        property_id: "prop_1",
        created_at: "2024-01-20T10:00:00Z"
    },
    {
        id: "tenant_2",
        first_name: "Jane",
        last_name: "Smith",
        whatsapp_number: "+0987654321",
        room_id: "room_1",
        property_id: "prop_1",
        created_at: "2024-01-21T11:00:00Z"
    },
    {
        id: "tenant_3",
        first_name: "Alice",
        last_name: "Johnson",
        whatsapp_number: null,
        room_id: "room_3",
        property_id: "prop_2",
        created_at: "2024-02-05T14:00:00Z"
    },
    {
        id: "tenant_4",
        first_name: "Bob",
        last_name: "Brown",
        whatsapp_number: "+1122334455",
        room_id: null,
        property_id: "prop_3",
        created_at: "2024-03-15T09:00:00Z"
    }
];

export const mockTransactions: Transaction[] = [
    {
        id: "tx_1",
        amount: 500,
        tenant_id: "tenant_1",
        room_id: "room_1",
        property_id: "prop_1",
        notes: "Rent for January",
        created_at: "2024-01-25T10:00:00Z"
    },
    {
        id: "tx_2",
        amount: 500,
        tenant_id: "tenant_2",
        room_id: "room_1",
        property_id: "prop_1",
        notes: "Rent for January",
        created_at: "2024-01-26T11:00:00Z"
    },
    {
        id: "tx_3",
        amount: 1200,
        tenant_id: "tenant_3",
        room_id: "room_3",
        property_id: "prop_2",
        notes: "Deposit",
        created_at: "2024-02-05T14:30:00Z"
    }
];
