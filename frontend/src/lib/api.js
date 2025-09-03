import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

export default api
