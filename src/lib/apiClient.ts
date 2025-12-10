// src/lib/apiClient.ts
import { mockApi } from './mockApi';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080/api';

type Json = any;

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch (e) {
    return null;
  }
}

async function request(
  path: string,
  opts: RequestInit = {},
  expectJson = true
): Promise<any> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> || {}),
  };

  // If body is plain object and no Content-Type set, assume JSON
  if (
    opts.body &&
    !(opts.body instanceof FormData) &&
    !(opts.body instanceof Blob) &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] = 'application/json';
    // if body is object, stringify
    if (typeof opts.body !== 'string') {
      opts.body = JSON.stringify(opts.body);
    }
  }

  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const finalOpts: RequestInit = {
    ...opts,
    headers,
  };

  const res = await fetch(url, finalOpts);

  if (!res.ok) {
    // try to parse error body
    let errBody: any = null;
    try {
      errBody = await res.json();
    } catch {
      errBody = await res.text();
    }
    const err: any = new Error(
      `HTTP ${res.status} ${res.statusText} - ${JSON.stringify(errBody)}`
    );
    err.status = res.status;
    err.body = errBody;
    throw err;
  }

  if (!expectJson) return res;
  // attempt JSON parse
  const txt = await res.text();
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    // return raw text if not JSON
    return txt;
  }
}

/* ------------------------
   API implementation
   ------------------------ */

const clientImpl = {
  // Auth
  async login(email: string, password: string) {
    if (USE_MOCK) return mockApi.login(email, password);
    return request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async forgotPassword(email: string) {
    if (USE_MOCK) return mockApi.forgotPassword(email);
    return request('/auth/forgot', {
      method: 'POST',
      body: { email },
    });
  },

  async getCurrentUser() {
    if (USE_MOCK) return mockApi.getCurrentUser();
    return request('/auth/me');
  },

  // Uploads (multipart)
  async uploadFile(file: File) {
    if (USE_MOCK) return mockApi.uploadFile(file);
    const fd = new FormData();
    fd.append('file', file);
    // expect JSON response
    return request('/uploads', {
      method: 'POST',
      body: fd,
    });
  },

  async getUploadParsed(id: string) {
    if (USE_MOCK) return mockApi.getUploadParsed(id);
    return request(`/uploads/${encodeURIComponent(id)}/parsed`);
  },

  // Tenants
  async getTenants() {
    if (USE_MOCK) return mockApi.getTenants();
    return request('/tenants');
  },
  async getTenant(id: string) {
    if (USE_MOCK) return mockApi.getTenant(id);
    return request(`/tenants/${encodeURIComponent(id)}`);
  },
  async createTenant(data: any) {
    if (USE_MOCK) return mockApi.createTenant(data);
    return request('/tenants', {
      method: 'POST',
      body: data,
    });
  },

  // Properties
  async getProperties() {
    if (USE_MOCK) return mockApi.getProperties();
    return request('/properties');
  },
  async getProperty(id: string) {
    if (USE_MOCK) return mockApi.getProperty(id);
    return request(`/properties/${encodeURIComponent(id)}`);
  },
  async createProperty(data: any) {
    if (USE_MOCK) return mockApi.createProperty(data);
    return request('/properties', { method: 'POST', body: data });
  },

  // Payments
  async getPayments() {
    if (USE_MOCK) return mockApi.getPayments();
    return request('/payments');
  },
  async markPaymentPaid(id: string, data: any) {
    if (USE_MOCK) return mockApi.markPaymentPaid(id, data);
    return request(`/payments/${encodeURIComponent(id)}/mark-paid`, {
      method: 'POST',
      body: data,
    });
  },
  async recordManualPayment(data: any) {
    if (USE_MOCK) return mockApi.recordManualPayment(data);
    return request('/payments/manual', { method: 'POST', body: data });
  },

  // Dashboard
  async getDashboardStats() {
    if (USE_MOCK) return mockApi.getDashboardStats();
    return request('/dashboard/stats');
  },
  async getRecentActivity() {
    if (USE_MOCK) return mockApi.getRecentActivity();
    return request('/dashboard/activity');
  },

  // Users & Settings
  async getUsers() {
    if (USE_MOCK) return mockApi.getUsers();
    return request('/admin/users');
  },
  async getSettings() {
    if (USE_MOCK) return mockApi.getSettings();
    return request('/admin/settings');
  },
  async updateSettings(data: any) {
    if (USE_MOCK) return mockApi.updateSettings(data);
    return request('/admin/settings', { method: 'PUT', body: data });
  },

  // Exports (return Blob)
  async exportTenantsCSV() {
    if (USE_MOCK) return mockApi.exportTenantsCSV();
    const res = await request('/admin/export/tenants', { method: 'GET' }, false);
    return res.blob ? res.blob() : Promise.resolve(null);
  },
  async exportPaymentsCSV() {
    if (USE_MOCK) return mockApi.exportPaymentsCSV();
    const res = await request('/admin/export/payments', { method: 'GET' }, false);
    return res.blob ? res.blob() : Promise.resolve(null);
  },
};

export const apiClient = clientImpl;
export default apiClient;
