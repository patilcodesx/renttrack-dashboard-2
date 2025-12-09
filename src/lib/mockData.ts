// Mock data for RentTrack application

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  avatar?: string;
  lastLogin?: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bhk: number;
  sqft: number;
  amenities: string[];
  available: boolean;
  images: string[];
  description: string;
  type: 'apartment' | 'house' | 'villa' | 'studio';
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  govtId: string;
  address: string;
  avatar?: string;
  propertyId: string;
  propertyName: string;
  rentAmount: number;
  deposit: number;
  leaseStart: string;
  leaseEnd: string;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  month: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'due' | 'overdue';
  paidDate?: string;
  method?: string;
  receiptUrl?: string;
}

export interface Activity {
  id: string;
  type: 'tenant_added' | 'payment_received' | 'document_uploaded' | 'lease_renewed' | 'property_added';
  message: string;
  timestamp: string;
  userId?: string;
}

export interface ParsedOCRData {
  name: { value: string; confidence: number };
  phone: { value: string; confidence: number };
  email: { value: string; confidence: number };
  govtId: { value: string; confidence: number };
  address: { value: string; confidence: number };
  rent_amount: { value: string; confidence: number };
  lease_start: { value: string; confidence: number };
  lease_end: { value: string; confidence: number };
}

export interface Upload {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'failed';
  parsedJson?: ParsedOCRData;
  previewUrl?: string;
}

// Demo user
export const demoUser: User = {
  id: 'admin',
  name: 'Demo Admin',
  email: 'demo@renttrack.local',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  lastLogin: new Date().toISOString(),
};

// Mock users for settings
export const mockUsers: User[] = [
  demoUser,
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    email: 'sarah@renttrack.local',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    lastLogin: '2024-12-08T14:30:00Z',
  },
  {
    id: 'user-3',
    name: 'Mike Chen',
    email: 'mike@renttrack.local',
    role: 'viewer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    lastLogin: '2024-12-07T09:15:00Z',
  },
];

// Mock properties
export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'Sunset View Apartment',
    address: '123 Ocean Drive',
    city: 'Miami',
    price: 2500,
    bhk: 2,
    sqft: 1200,
    amenities: ['pool', 'gym', 'parking', 'security'],
    available: true,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'],
    description: 'Beautiful 2BHK apartment with ocean views',
    type: 'apartment',
  },
  {
    id: 'prop-2',
    title: 'Downtown Loft',
    address: '456 Main Street',
    city: 'New York',
    price: 3200,
    bhk: 1,
    sqft: 850,
    amenities: ['gym', 'doorman', 'laundry'],
    available: true,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'],
    description: 'Modern loft in the heart of downtown',
    type: 'studio',
  },
  {
    id: 'prop-3',
    title: 'Garden Villa',
    address: '789 Park Lane',
    city: 'Los Angeles',
    price: 4500,
    bhk: 4,
    sqft: 2800,
    amenities: ['pool', 'garden', 'parking', 'security', 'gym'],
    available: false,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'],
    description: 'Spacious villa with private garden',
    type: 'villa',
  },
  {
    id: 'prop-4',
    title: 'Cozy Studio',
    address: '321 Elm Street',
    city: 'Chicago',
    price: 1800,
    bhk: 1,
    sqft: 550,
    amenities: ['laundry', 'parking'],
    available: true,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'],
    description: 'Perfect starter apartment',
    type: 'studio',
  },
  {
    id: 'prop-5',
    title: 'Family Home',
    address: '555 Oak Avenue',
    city: 'Seattle',
    price: 3800,
    bhk: 3,
    sqft: 2200,
    amenities: ['garden', 'parking', 'basement'],
    available: true,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'],
    description: 'Beautiful family home with backyard',
    type: 'house',
  },
];

// Mock tenants
export const mockTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    govtId: 'DL-123456789',
    address: '123 Ocean Drive, Apt 4B, Miami, FL 33139',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    propertyId: 'prop-1',
    propertyName: 'Sunset View Apartment',
    rentAmount: 2500,
    deposit: 5000,
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    status: 'active',
    createdAt: '2023-12-15T10:00:00Z',
  },
  {
    id: 'tenant-2',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 987-6543',
    govtId: 'SSN-XXX-XX-1234',
    address: '456 Main Street, Unit 12A, New York, NY 10001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    propertyId: 'prop-2',
    propertyName: 'Downtown Loft',
    rentAmount: 3200,
    deposit: 6400,
    leaseStart: '2024-03-01',
    leaseEnd: '2025-02-28',
    status: 'active',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 'tenant-3',
    name: 'Robert Wilson',
    email: 'robert.wilson@email.com',
    phone: '+1 (555) 456-7890',
    govtId: 'PASSPORT-A12345678',
    address: '789 Park Lane, Los Angeles, CA 90001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
    propertyId: 'prop-3',
    propertyName: 'Garden Villa',
    rentAmount: 4500,
    deposit: 9000,
    leaseStart: '2024-06-01',
    leaseEnd: '2025-05-31',
    status: 'active',
    createdAt: '2024-05-10T09:15:00Z',
  },
  {
    id: 'tenant-4',
    name: 'Lisa Martinez',
    email: 'lisa.martinez@email.com',
    phone: '+1 (555) 321-0987',
    govtId: 'DL-987654321',
    address: '321 Elm Street, Apt 3C, Chicago, IL 60601',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    propertyId: 'prop-4',
    propertyName: 'Cozy Studio',
    rentAmount: 1800,
    deposit: 3600,
    leaseStart: '2024-08-01',
    leaseEnd: '2025-07-31',
    status: 'pending',
    createdAt: '2024-07-25T16:45:00Z',
  },
];

// Mock payments
export const mockPayments: Payment[] = [
  {
    id: 'pay-1',
    tenantId: 'tenant-1',
    tenantName: 'John Smith',
    propertyId: 'prop-1',
    month: 'December 2024',
    dueDate: '2024-12-01',
    amount: 2500,
    status: 'paid',
    paidDate: '2024-11-28',
    method: 'bank_transfer',
  },
  {
    id: 'pay-2',
    tenantId: 'tenant-1',
    tenantName: 'John Smith',
    propertyId: 'prop-1',
    month: 'January 2025',
    dueDate: '2025-01-01',
    amount: 2500,
    status: 'due',
  },
  {
    id: 'pay-3',
    tenantId: 'tenant-2',
    tenantName: 'Emily Davis',
    propertyId: 'prop-2',
    month: 'December 2024',
    dueDate: '2024-12-01',
    amount: 3200,
    status: 'overdue',
  },
  {
    id: 'pay-4',
    tenantId: 'tenant-2',
    tenantName: 'Emily Davis',
    propertyId: 'prop-2',
    month: 'November 2024',
    dueDate: '2024-11-01',
    amount: 3200,
    status: 'paid',
    paidDate: '2024-10-30',
    method: 'credit_card',
  },
  {
    id: 'pay-5',
    tenantId: 'tenant-3',
    tenantName: 'Robert Wilson',
    propertyId: 'prop-3',
    month: 'December 2024',
    dueDate: '2024-12-01',
    amount: 4500,
    status: 'paid',
    paidDate: '2024-12-01',
    method: 'check',
  },
  {
    id: 'pay-6',
    tenantId: 'tenant-4',
    tenantName: 'Lisa Martinez',
    propertyId: 'prop-4',
    month: 'December 2024',
    dueDate: '2024-12-01',
    amount: 1800,
    status: 'due',
  },
];

// Mock activities
export const mockActivities: Activity[] = [
  {
    id: 'act-1',
    type: 'payment_received',
    message: 'Payment of $2,500 received from John Smith',
    timestamp: '2024-12-08T14:30:00Z',
  },
  {
    id: 'act-2',
    type: 'tenant_added',
    message: 'New tenant Lisa Martinez added to Cozy Studio',
    timestamp: '2024-12-07T10:15:00Z',
  },
  {
    id: 'act-3',
    type: 'document_uploaded',
    message: 'Lease agreement uploaded for Emily Davis',
    timestamp: '2024-12-06T16:45:00Z',
  },
  {
    id: 'act-4',
    type: 'property_added',
    message: 'New property "Lakeside Condo" added to listings',
    timestamp: '2024-12-05T09:00:00Z',
  },
  {
    id: 'act-5',
    type: 'lease_renewed',
    message: 'Lease renewed for Robert Wilson until May 2025',
    timestamp: '2024-12-04T11:30:00Z',
  },
];

// Example parsed OCR data
export const exampleParsedOCR: ParsedOCRData = {
  name: { value: 'Alexander Thompson', confidence: 0.95 },
  phone: { value: '+1 (555) 789-0123', confidence: 0.88 },
  email: { value: 'alex.thompson@email.com', confidence: 0.92 },
  govtId: { value: 'DL-456789123', confidence: 0.75 },
  address: { value: '742 Evergreen Terrace, Springfield, IL 62701', confidence: 0.82 },
  rent_amount: { value: '2200', confidence: 0.90 },
  lease_start: { value: '2025-01-01', confidence: 0.85 },
  lease_end: { value: '2025-12-31', confidence: 0.85 },
};

// In-memory storage for uploads
export const uploadStore: Map<string, Upload> = new Map();
