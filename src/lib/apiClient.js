/* src/lib/apiClient.js - patched */
import { mockApi } from './mockApi';

const useMock =
  import.meta.env.VITE_USE_MOCK === 'true' ||
  import.meta.env.VITE_USE_MOCK === true ||
  localStorage.getItem('USE_MOCK') === 'true';

const clientImpl = {
  async login(email, password) { if (useMock) return mockApi.login(email, password); throw new Error('No backend available: login'); },
  async forgotPassword(email) { if (useMock) return mockApi.forgotPassword(email); throw new Error('No backend available: forgotPassword'); },
  async getCurrentUser() { if (useMock) return mockApi.getCurrentUser(); throw new Error('No backend available: getCurrentUser'); },

  async uploadFile(file) { if (useMock) return mockApi.uploadFile(file); throw new Error('No backend available: uploadFile'); },
  async getUploadParsed(id) { if (useMock) return mockApi.getUploadParsed(id); throw new Error('No backend available: getUploadParsed'); },

  async getTenants() { if (useMock) return mockApi.getTenants(); throw new Error('No backend available: getTenants'); },
  async getTenant(id) { if (useMock) return mockApi.getTenant(id); throw new Error('No backend available: getTenant'); },
  async createTenant(data) { if (useMock) return mockApi.createTenant(data); throw new Error('No backend available: createTenant'); },

  async getProperties() { if (useMock) return mockApi.getProperties(); throw new Error('No backend available: getProperties'); },
  async getProperty(id) { if (useMock) return mockApi.getProperty(id); throw new Error('No backend available: getProperty'); },
  async createProperty(data) { if (useMock) return mockApi.createProperty(data); throw new Error('No backend available: createProperty'); },

  async getPayments() { if (useMock) return mockApi.getPayments(); throw new Error('No backend available: getPayments'); },
  async markPaymentPaid(id,data) { if (useMock) return mockApi.markPaymentPaid(id,data); throw new Error('No backend available: markPaymentPaid'); },
  async recordManualPayment(data) { if (useMock) return mockApi.recordManualPayment(data); throw new Error('No backend available: recordManualPayment'); },

  async getDashboardStats() { if (useMock) return mockApi.getDashboardStats(); throw new Error('No backend available: getDashboardStats'); },
  async getRecentActivity() { if (useMock) return mockApi.getRecentActivity(); throw new Error('No backend available: getRecentActivity'); },

  async getUsers() { if (useMock) return mockApi.getUsers(); throw new Error('No backend available: getUsers'); },
  async getSettings() { if (useMock) return mockApi.getSettings(); throw new Error('No backend available: getSettings'); },
  async updateSettings(data) { if (useMock) return mockApi.updateSettings(data); throw new Error('No backend available: updateSettings'); },

  async exportTenantsCSV() { if (useMock) return mockApi.exportTenantsCSV(); throw new Error('No backend available: exportTenantsCSV'); },
  async exportPaymentsCSV() { if (useMock) return mockApi.exportPaymentsCSV(); throw new Error('No backend available: exportPaymentsCSV'); },
};

export const apiClient = clientImpl;
export default apiClient;
