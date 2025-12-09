// API Client for RentTrack
// Reads from environment to determine whether to use mock or real API

import { mockApi } from './mockApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// For now, we only support mock mode
// In production, you would implement real API calls here
export const apiClient = USE_MOCK ? mockApi : mockApi;

export { USE_MOCK, API_BASE_URL };
