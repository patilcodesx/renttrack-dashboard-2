// src/lib/apiClient.ts
import { mockApi } from './mockApi';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// Client implementation for mock mode - extend later for real HTTP calls
const clientImpl = {
  async login(email: string, password: string) {
    if (USE_MOCK) return mockApi.login(email, password);
    throw new Error('No backend available: login');
  },
  async forgotPassword(email: string) {
    if (USE_MOCK) return mockApi.forgotPassword(email);
    throw new Error('No backend available: forgotPassword');
  },
  async getCurrentUser() {
    if (USE_MOCK) return mockApi.getCurrentUser();
    throw new Error('No backend available: getCurrentUser');
  },

  async uploadFile(file: File) {
    if (USE_MOCK) return mockApi.uploadFile(file);
    throw new Error('No backend available: uploadFile');
  },
  async getUploadParsed(id: string) {
    if (USE_MOCK) return mockApi.getUploadParsed(id);
    throw new Error('No backend available: getUploadParsed');
  },

  async getTenants() {
    if (USE_MOCK) return mockApi.getTenants();
    throw new Error('No backend available: getTenants');
  },
  async getTenant(id: string) {
    if (USE_MOCK) return mockApi.getTenant(id);
    throw new Error('No backend available: getTenant');
  },
  async createTenant(data: any) {
    if (USE_MOCK) return mockApi.createTenant(data);
    throw new Error('No backend available: createTenant');
  },

  async getProperties() {
    if (USE_MOCK) return mockApi.getProperties();
    throw new Error('No backend available: getProperties');
  },
  async getProperty(id: string) {
    if (USE_MOCK) return mockApi.getProperty(id);
    throw new Error('No backend available: getProperty');
  },
  async createProperty(data: any) {
    if (USE_MOCK) return mockApi.createProperty(data);
    throw new Error('No backend available: createProperty');
  },

  async getPayments() {
    if (USE_MOCK) return mockApi.getPayments();
    throw new Error('No backend available: getPayments');
  },
  async markPaymentPaid(id: string, data: any) {
    if (USE_MOCK) return mockApi.markPaymentPaid(id, data);
    throw new Error('No backend available: markPaymentPaid');
  },
  async recordManualPayment(data: any) {
    if (USE_MOCK) return mockApi.recordManualPayment(data);
    throw new Error('No backend available: recordManualPayment');
  },

  async getDashboardStats() {
    if (USE_MOCK) return mockApi.getDashboardStats();
    throw new Error('No backend available: getDashboardStats');
  },
  async getRecentActivity() {
    if (USE_MOCK) return mockApi.getRecentActivity();
    throw new Error('No backend available: getRecentActivity');
  },

  async getUsers() {
    if (USE_MOCK) return mockApi.getUsers();
    throw new Error('No backend available: getUsers');
  },
  async getSettings() {
    if (USE_MOCK) return mockApi.getSettings();
    throw new Error('No backend available: getSettings');
  },
  async updateSettings(data: any) {
    if (USE_MOCK) return mockApi.updateSettings(data);
    throw new Error('No backend available: updateSettings');
  },

  async exportTenantsCSV() {
    if (USE_MOCK) return mockApi.exportTenantsCSV();
    throw new Error('No backend available: exportTenantsCSV');
  },
  async exportPaymentsCSV() {
    if (USE_MOCK) return mockApi.exportPaymentsCSV();
    throw new Error('No backend available: exportPaymentsCSV');
  },
};

export const apiClient = clientImpl;
export default apiClient;
