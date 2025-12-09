// src/lib/mockApi.ts
// Robust mockApi (fixed syntax)

import {
  demoUser,
  mockUsers,
  mockProperties,
  mockTenants,
  mockPayments,
  mockActivities,
  exampleParsedOCR,
  uploadStore as importedUploadStore,
} from './mockData';

const uploadStore = importedUploadStore || new Map();
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const gen = () => Math.random().toString(36).substring(2, 9);
const maketoken = (role = 'ADMIN') => `${role.toLowerCase()}-token-${gen()}`;
const roleForEmail = (e: string | undefined) => {
  e = (e || '').toLowerCase();
  if (e === 'landlord@renttrack.local') return 'LANDLORD';
  if (e === 'tenant@renttrack.local') return 'TENANT';
  return 'ADMIN';
};

export const mockApi = {
  async login(email: string, password: string) {
    await delay(700);
    if (password === 'demo123') {
      const role = roleForEmail(email);
      const token = maketoken(role);
      const user = {
        id: role.toLowerCase() + '-' + gen(),
        name: role === 'ADMIN' ? 'Demo Admin' : role === 'LANDLORD' ? 'Demo Landlord' : 'Demo Tenant',
        email,
        role,
      };
      return { token, user };
    }
    throw new Error('Invalid credentials');
  },

  async forgotPassword(email: string) {
    await delay(400);
    return { ok: true };
  },

  async getCurrentUser() {
    await delay(250);
    const token = localStorage.getItem('renttrack_token') || localStorage.getItem('token') || '';
    if (!token) throw new Error('Not authenticated');
    if (token.startsWith('landlord-token')) return { id: 'landlord-' + gen(), name: 'Demo Landlord', email: 'landlord@renttrack.local', role: 'LANDLORD' };
    if (token.startsWith('tenant-token')) return { id: 'tenant-' + gen(), name: 'Demo Tenant', email: 'tenant@renttrack.local', role: 'TENANT' };
    return { id: 'admin-' + gen(), name: demoUser.name, email: demoUser.email, role: 'ADMIN' };
  },

  async uploadFile(file: File) {
    await delay(800);
    const uploadId = 'mock-upload-' + gen();
    const u = { id: uploadId, filename: file.name, fileType: file.type, fileSize: file.size, uploadedAt: new Date().toISOString(), status: 'processing', previewUrl: URL.createObjectURL(file) };
    uploadStore.set(uploadId, u);
    setTimeout(() => {
      const s = uploadStore.get(uploadId);
      if (s) {
        s.status = 'completed';
        s.parsedJson = { ...exampleParsedOCR, _uploadId: uploadId };
        uploadStore.set(uploadId, s);
      }
    }, 3000 + Math.random() * 3000);
    return { uploadId };
  },

  async getUploadParsed(uploadId: string) {
    await delay(350);
    const u = uploadStore.get(uploadId);
    if (!u) throw new Error('Upload not found');
    return u;
  },

  async getTenants() {
    await delay(450);
    return mockTenants.map((x) => ({ ...x }));
  },
  async getTenant(id: string) {
    await delay(300);
    return mockTenants.find((t) => t.id === id) || null;
  },
  async createTenant(data: any) {
    await delay(700);
    const t = {
      id: 'tenant-' + gen(),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      govtId: data.govtId || '',
      address: data.address || '',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + gen(),
      propertyId: data.propertyId || '',
      propertyName: data.propertyName || '',
      rentAmount: Number(data.rentAmount || 0),
      deposit: Number(data.deposit || 0),
      leaseStart: data.leaseStart || '',
      leaseEnd: data.leaseEnd || '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    mockTenants.push(t);
    return t;
  },

  async getProperties() {
    await delay(400);
    return mockProperties.map((x) => ({ ...x }));
  },
  async getProperty(id: string) {
    await delay(300);
    return mockProperties.find((p) => p.id === id) || null;
  },
  async createProperty(data: any) {
    await delay(600);
    const p = { id: 'prop-' + gen(), title: data.title || 'Untitled', address: data.address || '', bhk: Number(data.bhk || 1), price: Number(data.price || 0), images: data.images || [], tags: data.tags || [], available: true, createdAt: new Date().toISOString() };
    mockProperties.push(p);
    return p;
  },

  async getPayments() {
    await delay(450);
    return mockPayments.map((x) => ({ ...x }));
  },
  async getTenantLedger(tenantId: string) {
    await delay(400);
    return mockPayments.filter((p) => p.tenantId === tenantId);
  },
  async markPaymentPaid(paymentId: string, data: any) {
    await delay(500);
    const pay = mockPayments.find((p) => p.id === paymentId);
    if (!pay) throw new Error('Payment not found');
    pay.status = 'paid';
    pay.paidDate = data.paidDate;
    pay.method = data.method;
    return pay;
  },
  async recordManualPayment(data: any) {
    await delay(600);
    const tenant = mockTenants.find((t) => t.id === data.tenantId);
    if (!tenant) throw new Error('Tenant not found');
    const np = {
      id: 'pay-' + gen(),
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
    mockPayments.push(np);
    return np;
  },

  async getDashboardStats() {
    await delay(300);
    const overdue = mockPayments.filter((p) => p.status === 'overdue').length;
    const nextDue = mockPayments.filter((p) => p.status === 'due').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
    const totalRevenue = mockPayments.filter((p) => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
    return { totalTenants: mockTenants.length, overdue, nextDueDate: nextDue?.dueDate || 'N/A', totalRevenue };
  },

  async getRecentActivity() {
    await delay(250);
    return mockActivities.map((x) => ({ ...x }));
  },

  async getUsers() {
    await delay(350);
    return mockUsers.map((x) => ({ ...x }));
  },

  async getSettings() {
    await delay(200);
    const s = localStorage.getItem('renttrack_settings');
    return s ? JSON.parse(s) : { ocrAccuracy: 0.8 };
  },
  async updateSettings(data: any) {
    await delay(250);
    localStorage.setItem('renttrack_settings', JSON.stringify(data));
    return { ok: true };
  },
  async reprocessFailedOCR() {
    await delay(1200);
    return { processed: Math.floor(2 + Math.random() * 3) };
  },

  async exportTenantsCSV() {
    await delay(300);
    const header = ['Name', 'Email', 'Phone', 'Property', 'Rent', 'Status'];
    const rows = mockTenants.map((t) => [t.name, t.email, t.phone, t.propertyName || '', String(t.rentAmount || ''), t.status || ''].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    const csv = header.join(',') + '\n' + rows.join('\n');
    return new Blob([csv], { type: 'text/csv' });
  },

  async exportPaymentsCSV() {
    await delay(300);
    const header = ['Tenant', 'Month', 'Amount', 'Due Date', 'Status', 'Paid Date'];
    const rows = mockPayments.map((p) => [p.tenantName, p.month, String(p.amount), p.dueDate, p.status, p.paidDate || ''].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    const csv = header.join(',') + '\n' + rows.join('\n');
    return new Blob([csv], { type: 'text/csv' });
  },
};

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
