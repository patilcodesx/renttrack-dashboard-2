// src/lib/mockApi.ts
// Mock API implementation for RentTrack (improved)

import {
  demoUser,
  mockUsers,
  mockProperties,
  mockTenants,
  mockPayments,
  mockActivities,
  exampleParsedOCR,
  uploadStore as importedUploadStore,
  type User,
  type Tenant,
  type Payment,
  type Property,
  type Upload,
  type ParsedOCRData,
} from './mockData';

// If imported uploadStore isn't present, create our own Map
const uploadStore: Map<string, Upload> = importedUploadStore || new Map();

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to create token for role
const makeToken = (role = 'ADMIN') => `${role.toLowerCase()}-token-${generateId()}`;

// Map demo emails to roles
const roleForEmail = (email: string) => {
  const e = (email || '').toLowerCase();
  if (e === 'landlord@renttrack.local') return 'LANDLORD';
  if (e === 'tenant@renttrack.local') return 'TENANT';
  return 'ADMIN';
};

// Helper to clone arrays to avoid accidental mutation
const clone = <T,>(arr: T[]) => arr.map(x => ({ ...x }));

export const mockApi = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    await delay(700);

    // Accept demo credentials or any email with demo123 for convenience
    if (password === 'demo123') {
      const role = roleForEmail(email);
      const token = makeToken(role);
      // Build user object based on role
      const user: User = {
        id: `${role.toLowerCase()}-${generateId()}`,
        name: role === 'ADMIN' ? demoUser.name : role === 'LANDLORD' ? 'Demo Landlord' : 'Demo Tenant',
        email,
        role,
      } as User;

      return { token, user };
    }

    throw new Error('Invalid credentials');
  },

  async forgotPassword(email: string): Promise<{ ok: boolean }> {
    await delay(400);
    // always succeed in mock
    return { ok: true };
  },

  async getCurrentUser(): Promise<User> {
    await delay(250);
    const token = localStorage.getItem('renttrack_token') || localStorage.getItem('token') || '';
    if (!token) throw new Error('Not authenticated');

    // simple role detection from token prefix
    if (token.startsWith('landlord-token')) {
      return { id: `landlord-${generateId()}`, name: 'Demo Landlord', email: 'landlord@renttrack.local', role: 'LANDLORD' } as User;
    }
    if (token.startsWith('tenant-token')) {
      return { id: `tenant-${generateId()}`, name: 'Demo Tenant', email: 'tenant@renttrack.local', role: 'TENANT' } as User;
    }
    // default admin
    return { id: `admin-${generateId()}`, name: demoUser.name, email: demoUser.email, role: 'ADMIN' } as User;
  },

  // Uploads & OCR
  async uploadFile(file: File): Promise<{ uploadId: string }> {
    await delay(800);

    const uploadId = 'mock-upload-' + generateId();
    const upload: Upload = {
      id: uploadId,
      filename: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
      previewUrl: URL.createObjectURL(file),
    };

    uploadStore.set(uploadId, upload);

    // Simulate OCR processing after 3-6 seconds
    setTimeout(() => {
      const stored = uploadStore.get(uploadId);
      if (stored) {
        stored.status = 'completed';
        stored.parsedJson = { ...exampleParsedOCR } as ParsedOCRData;
        // small variation: add id references to parsed data
        stored.parsedJson._uploadId = uploadId;
        uploadStore.set(uploadId, stored);
      }
    }, 3000 + Math.random() * 3000);

    return { uploadId };
  },

  async getUploadParsed(uploadId: string): Promise<Upload | null> {
    await delay(350);
    const upload = uploadStore.get(uploadId);
    if (!upload) {
      throw new Error('Upload not found');
    }
    return upload;
  },

  // Tenants
  async getTenants(): Promise<Tenant[]> {
    await delay(450);
    return clone(mockTenants);
  },

  async getTenant(id: string): Promise<Tenant | null> {
    await delay(300);
    return mockTenants.find(t => t.id === id) || null;
  },

  async createTenant(data: Partial<Tenant>): Promise<Tenant> {
    await delay(700);

    const newTenant: Tenant = {
      id: 'tenant-' + generateId(),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      govtId: (data as any).govtId || data.govtId || '',
      address: data.address || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${generateId()}`,
      propertyId: data.propertyId || '',
      propertyName: data.propertyName || '',
      rentAmount: Number(data.rentAmount || 0),
      deposit: Number(data.deposit || 0),
      leaseStart: data.leaseStart || '',
      leaseEnd: data.leaseEnd || '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    mockTenants.push(newTenant);
    return newTenant;
  },

  // Properties
  async getProperties(): Promise<Property[]> {
    await delay(400);
    return clone(mockProperties);
  },

  async getProperty(id: string): Promise<Property | null> {
    await delay(300);
    return mockProperties.find(p => p.id === id) || null;
  },

  async createProperty(data: Partial<Property>): Promise<Property> {
    await delay(600);
    const newProperty: Property = {
      id: 'prop-' + generateId(),
      title: data.title || 'Untitled Property',
      address: data.address || '',
      bhk: Number((data as any).bhk || 1),
      price: Number((data as any).price || 0),
      images: (data as any).images || [],
      tags: (data as any).tags || [],
      available: typeof (data as any).available === 'boolean' ? (data as any).available : true,
      createdAt: new Date().toISOString(),
    } as Property;

    mockProperties.push(newProperty);
    return newProperty;
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    await delay(450);
    return clone(mockPayments);
  },

  async getTenantLedger(tenantId: string): Promise<Payment[]> {
    await delay(400);
    return mockPayments.filter(p => p.tenantId === tenantId);
  },

  async markPaymentPaid(paymentId: string, data: { method: string; paidDate: string }): Promise<Payment> {
    await delay(500);

    const payment = mockPayments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = 'paid';
    payment.paidDate = data.paidDate;
    payment.method = data.method;
    return payment;
  },

  async recordManualPayment(data: {
    tenantId: string;
    amount: number;
    date: string;
    method: string;
    receiptUrl?: string;
  }): Promise<Payment> {
    await delay(600);

    const tenant = mockTenants.find(t => t.id === data.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const newPayment: Payment = {
      id: 'pay-' + generateId(),
      tenantId: data.tenantId,
      tenantName: tenant.name,
      propertyId: tenant.propertyId,
      month: new Date(data.date).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      dueDate: data.date,
      amount: data.amount,
      status: 'paid',
      paidDate: data.date,
      method: data.method,
      receiptUrl: data.receiptUrl,
    };

    mockPayments.push(newPayment);
    return newPayment;
  },

  // Dashboard
  async getDashboardStats(): Promise<{
    totalTenants: number;
    overdue: number;
    nextDueDate: string;
    totalRevenue: number;
  }> {
    await delay(300);

    const overdue = mockPayments.filter(p => p.status === 'overdue').length;
    const nextDue = mockPayments
      .filter(p => p.status === 'due')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

    const totalRevenue = mockPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalTenants: mockTenants.length,
      overdue,
      nextDueDate: nextDue?.dueDate || 'N/A',
      totalRevenue,
    };
  },

  async getRecentActivity(): Promise<typeof mockActivities> {
    await delay(250);
    return clone(mockActivities);
  },

  // Users (for settings)
  async getUsers(): Promise<User[]> {
    await delay(350);
    return clone(mockUsers);
  },

  // Settings
  async getSettings(): Promise<{ ocrAccuracy: number }> {
    await delay(200);
    const settings = localStorage.getItem('renttrack_settings');
    return settings ? JSON.parse(settings) : { ocrAccuracy: 0.8 };
  },

  async updateSettings(data: { ocrAccuracy: number }): Promise<{ ok: boolean }> {
    await delay(250);
    localStorage.setItem('renttrack_settings', JSON.stringify(data));
    return { ok: true };
  },

  async reprocessFailedOCR(): Promise<{ processed: number }> {
    await delay(1200);
    // simulate processing 2-4 items
    return { processed: Math.floor(2 + Math.random() * 3) };
  },

  // CSV Export (mock)
  async exportTenantsCSV(): Promise<Blob> {
    await delay(300);
    const csv = 'Name,Email,Phone,Property,Rent,Status\n' +
      mockTenants.map(t =>
        `"${t.name}","${t.email}","${t.phone}","${t.propertyName}",${t.rentAmount},"${t.status}"`
      ).join('\n');
    return new Blob([csv], { type: 'text/csv' });
  },

  async exportPaymentsCSV(): Promise<Blob> {
    await delay(300);
    const csv = 'Tenant,Month,Amount,Due Date,Status,Paid Date\n' +
      mockPayments.map(p =>
        `"${p.tenantName}","${p.month}",${p.amount},"${p.dueDate}","${p.status}","${p.paidDate || ''}"`
      ).join('\n');
    return new Blob([csv], { type: 'text/csv' });
  },
};

// Helper example to trigger download client-side (not part of API object)
export function downloadBlob(blob: Blob, filename = 'export.csv') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
