import axios from 'axios';

// Production gets value from GitHub secret via workflow.
// Dev can use localhost.
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? 'http://localhost:8000/api' : undefined);

// Optional: log once while verifying. Remove later.
console.log('API_BASE (runtime):', API_BASE);

// If you want to hard-fail on missing prod env, uncomment:
// if (!API_BASE) throw new Error('VITE_API_BASE_URL is not set for production build');

export const api = axios.create({
  baseURL: API_BASE,           // do NOT hardcode localhost here
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add session ID to headers if available
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
      // Handle unauthorized access
      localStorage.removeItem('hr-onboarding-store')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// API endpoints - Updated to match backend exactly
export const endpoints = {
  // Health Check
  health: () => api.get('/health'),
  
  // Employee Onboarding
  onboardEmployee: (employeeData) => api.post('/onboard', employeeData),
  
  // Policy Management
  getPolicies: (params = {}) => api.get('/policies', { params }),
  
  // Policy CRUD Operations
  createPolicy: (policyData) => api.post('/policies', policyData),
  updatePolicy: (sectionId, policyData) => api.put(`/policies/${sectionId}`, policyData),
  deletePolicy: (sectionId) => api.delete(`/policies/${sectionId}`),
  
  // Policy Validation
  getUsedOrders: () => api.get('/policies/validation/used-orders'),
  getUsedSectionIds: () => api.get('/policies/validation/used-section-ids'),
  
  // Employee Management
  getEmployees: () => api.get('/employees'),
  getEmployeeById: (id) => api.get(`/employees/${id}`),
  createEmployee: (employeeData) => api.post('/onboard', employeeData),
  
  // Chat and AI
  askQuestion: (request) => api.post('/ask', request),
  enhancedAsk: (request) => api.post('/ask', request),
}

// Example endpoints (use everywhere in your pages)
export const getPolicies = () => api.get('/policies');
export const ask = (payload) => api.post('/ask', payload);

export default api