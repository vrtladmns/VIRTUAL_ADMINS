import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // Session management
      sessionId: null,
      employeeId: null,
      
      // UI state
      isDarkMode: false,
      sidebarOpen: false,
      currentTab: 'home',
      
      // Onboarding state
      currentStep: 1,
      completedSteps: [],
      skippedSteps: [],
      
      // Chat state
      chatHistory: [],
      isLoading: false,
      
      // Actions
      setSessionId: (sessionId) => set({ sessionId }),
      setEmployeeId: (employeeId) => set({ employeeId }),
      clearSession: () => set({ 
        sessionId: null, 
        employeeId: null, 
        currentStep: 1, 
        completedSteps: [], 
        skippedSteps: [],
        chatHistory: [] 
      }),
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCurrentTab: (tab) => set({ currentTab: tab }),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      addCompletedStep: (step) => set((state) => ({ 
        completedSteps: [...new Set([...state.completedSteps, step])] 
      })),
      addSkippedStep: (step) => set((state) => ({ 
        skippedSteps: [...new Set([...state.skippedSteps, step])] 
      })),
      
      addChatMessage: (message) => set((state) => ({ 
        chatHistory: [...state.chatHistory, message] 
      })),
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Computed values
      getProgress: () => {
        const state = get()
        const totalSteps = 17
        const completed = state.completedSteps.length
        return Math.round((completed / totalSteps) * 100)
      },
      
      getStepStatus: (step) => {
        const state = get()
        if (state.completedSteps.includes(step)) return 'completed'
        if (state.skippedSteps.includes(step)) return 'skipped'
        if (state.currentStep === step) return 'current'
        return 'pending'
      }
    }),
    {
      name: 'hr-onboarding-store',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        sidebarOpen: state.sidebarOpen,
        currentTab: state.currentTab,
      }),
    }
  )
)
