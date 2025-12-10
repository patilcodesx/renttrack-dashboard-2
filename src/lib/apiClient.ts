import { mockApi } from './mockApi';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080/api';

function getAuthHeader() {
  const token = localStorage.getItem('rt_token') || localStorage.getItem('renttrack_token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
  if (!res.ok) {
    const err = new Error(body?.error || body?.message || res.statusText || 'Request failed');
    // @ts-ignore
    err.status = res.status;
    // @ts-ignore
    err.body = body;
    throw err;
  }
  return body;
}

const clientImpl = {
  // Auth
  async login(email: string, password: string) {
    if (USE_MOCK) return mockApi.login(email, password);
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    // store token locally for subsequent calls
    if (data?.token) {
      localStorage.setItem('rt_token', data.token);
      localStorage.setItem('renttrack_token', data.token);
    }
    return data;
  },

  async logout() {
    if (USE_MOCK) return mockApi.logout();
    localStorage.removeItem('rt_token');
    localStorage.removeItem('renttrack_token');
    return { ok: true };
  },

  // Users / profile
  async getCurrentUser() {
    if (USE_MOCK) return mockApi.getCurrentUser();
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Uploads
  async uploadFile(file: File) {
    if (USE_MOCK) return mockApi.uploadFile(file);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      body: form,
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getUploadParsed(id: string) {
    if (USE_MOCK) return mockApi.getUploadParsed(id);
    const res = await fetch(`${API_BASE_URL}/uploads/${id}/parsed`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Tenants
  async getTenants() {
    if (USE_MOCK) return mockApi.getTenants();
    const res = await fetch(`${API_BASE_URL}/tenants`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  },

  async getTenant(id: string) {
    if (USE_MOCK) return mockApi.getTenant(id);
    const res = await fetch(`${API_BASE_URL}/tenants/${id}`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  },

  async createTenant(data: any) {
    if (USE_MOCK) return mockApi.createTenant(data);
    const res = await fetch(`${API_BASE_URL}/tenants`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Dashboard
  async getDashboardStats() {
    if (USE_MOCK) return mockApi.getDashboardStats();
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, { headers: getAuthHeader() });
    return handleResponse(res);
  },
  
  async getRecentActivity() {
    if (USE_MOCK) return mockApi.getRecentActivity();
    const res = await fetch(`${API_BASE_URL}/dashboard/activity`, { headers: getAuthHeader() });
    return handleResponse(res);
  },
};

export const apiClient = clientImpl;
export default apiClient;