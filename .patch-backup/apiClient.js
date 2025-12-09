import { mockApi } from './mockApi';
const useMock = (import.meta.env.VITE_USE_MOCK === 'true') || (import.meta.env.VITE_USE_MOCK === true) || (localStorage.getItem('USE_MOCK') === 'true');

const client = {
  async login(email,password){ if(useMock) return mockApi.login(email,password); throw new Error('No backend'); },
  async forgotPassword(email){ if(useMock) return mockApi.forgotPassword(email); throw new Error('No backend'); },
  async getCurrentUser(){ if(useMock) return mockApi.getCurrentUser(); throw new Error('No backend'); },
  async uploadFile(file){ if(useMock) return mockApi.uploadFile(file); throw new Error('No backend'); },
  async getUploadParsed(id){ if(useMock) return mockApi.getUploadParsed(id); throw new Error('No backend'); },
  async getTenants(){ if(useMock) return mockApi.getTenants(); throw new Error('No backend'); },
  async getTenant(id){ if(useMock) return mockApi.getTenant(id); throw new Error('No backend'); },
  async createTenant(data){ if(useMock) return mockApi.createTenant(data); throw new Error('No backend'); },
  async getProperties(){ if(useMock) return mockApi.getProperties(); throw new Error('No backend'); },
  async getProperty(id){ if(useMock) return mockApi.getProperty(id); throw new Error('No backend'); },
  async createProperty(data){ if(useMock) return mockApi.createProperty(data); throw new Error('No backend'); },
  async getPayments(){ if(useMock) return mockApi.getPayments(); throw new Error('No backend'); },
  async markPaymentPaid(id,data){ if(useMock) return mockApi.markPaymentPaid(id,data); throw new Error('No backend'); },
  async recordManualPayment(data){ if(useMock) return mockApi.recordManualPayment(data); throw new Error('No backend'); },
  async getDashboardStats(){ if(useMock) return mockApi.getDashboardStats(); throw new Error('No backend'); },
  async getRecentActivity(){ if(useMock) return mockApi.getRecentActivity(); throw new Error('No backend'); },
  async getUsers(){ if(useMock) return mockApi.getUsers(); throw new Error('No backend'); },
  async getSettings(){ if(useMock) return mockApi.getSettings(); throw new Error('No backend'); },
  async updateSettings(data){ if(useMock) return mockApi.updateSettings(data); throw new Error('No backend'); },
  async exportTenantsCSV(){ if(useMock) return mockApi.exportTenantsCSV(); throw new Error('No backend'); },
  async exportPaymentsCSV(){ if(useMock) return mockApi.exportPaymentsCSV(); throw new Error('No backend'); }
};

export default client;
