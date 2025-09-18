import axios from 'axios';

const injected = import.meta.env.VITE_API_BASE_URL;
const fallback = 'http://localhost:8000/api';
const API_BASE = injected || fallback;

console.log('API Base URL (runtime):', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const sessionId = localStorage.getItem('hr-onboarding-store')
    if (sessionId) {
      try {
        const store = JSON.parse(sessionId)
        if (store.state?.sessionId) {
          config.headers['X-Session-ID'] = store.state.sessionId
        }
      } catch (error) {
        console.warn('Failed to parse store for session ID')
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hr-onboarding-store')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const endpoints = {
  health: () => api.get('/health'),
  onboardEmployee: (employeeData) => api.post('/onboard', employeeData),
  getPolicies: (params = {}) => api.get('/policies', { params }),
  createPolicy: (policyData) => api.post('/policies', policyData),
  updatePolicy: (sectionId, policyData) => api.put(`/policies/${sectionId}`, policyData),
  deletePolicy: (sectionId) => api.delete(`/policies/${sectionId}`),
  getUsedOrders: () => api.get('/policies/validation/used-orders'),
  getUsedSectionIds: () => api.get('/policies/validation/used-section-ids'),
  getEmployees: () => api.get('/employees'),
  getEmployeeById: (id) => api.get(`/employees/${id}`),
  createEmployee: (employeeData) => api.post('/onboard', employeeData),
  askQuestion: (request) => api.post('/ask', request),
  enhancedAsk: (request) => api.post('/ask', request),
}

export default api