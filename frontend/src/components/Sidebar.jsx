import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import logoImage from '../assets/Untitled design (4).png'
import { 
  X, 
  Users, 
  FileText, 
  MessageCircle, 
  BarChart3, 
  Settings,
  CheckCircle,
  SkipForward,
  Circle,
  Bot,
  LogOut
} from 'lucide-react'

export const Sidebar = ({ isOpen, onClose, onFeedbackClick }) => {
  const { 
    currentTab, 
    setCurrentTab, 
    sessionId, 
    currentStep, 
    completedSteps, 
    skippedSteps,
    getProgress,
    getStepStatus,
    clearSession
  } = useStore()

  const navigate = useNavigate()
  const location = useLocation()

  const navigation = [
    { id: 'chat', label: 'AI Chat', icon: MessageCircle, path: '/' },
    { id: 'onboarding', label: 'Employee Onboarding', icon: Users, path: '/onboarding' },
    // { id: 'policies', label: 'Company Policies', icon: FileText, path: '/policies' },
    // { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    // { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ]

  const handleNavigation = (path) => {
    navigate(path)
    if (onClose) onClose() // Close mobile sidebar if open
  }

  const handleFeatureClick = (path) => {
    navigate(path)
    if (onClose) onClose()
  }

  const getStepIcon = (step) => {
    const status = getStepStatus(step)
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'skipped':
        return <SkipForward className="h-4 w-4 text-yellow-500" />
      case 'current':
        return <Circle className="h-4 w-4 text-blue-500 fill-current" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-50 h-full w-64 transform bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <button 
              onClick={() => handleFeatureClick('/')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
                             <img 
                 src={logoImage} 
                 alt="HR VA Logo" 
                 className="w-12 h-12 object-contain"
               />
              <span className="text-xl font-bold text-brand-400">Virtual Admins </span>
            </button>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors ${
                    isActive ? 'bg-gray-800 text-white' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-800 space-y-2">
            {/* Feedback Button */}
            <button 
              onClick={onFeedbackClick}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r from-green-500/10 to-green-600/10 hover:from-green-500/20 hover:to-green-600/20 border border-green-500/20 hover:border-green-500/40"
            >
              <MessageCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">Feedback</span>
            </button>
            
            {/* Logout Button */}
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border border-red-500/20 hover:border-red-500/40">
              <LogOut className="h-5 w-5 text-red-400" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
