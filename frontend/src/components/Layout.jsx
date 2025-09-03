import React from 'react'
import { useStore } from '../store/useStore'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { Moon, Sun, Menu } from 'lucide-react'
import { Button } from './ui/button'

export const Layout = ({ children }) => {
  const { isDarkMode, toggleDarkMode, sidebarOpen, setSidebarOpen } = useStore()

  return (
    <div className="min-h-screen bg-black text-white flex page-container viewport-consistent">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="flex-1 bg-black flex flex-col main-content lg:ml-64">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden p-4 border-b border-gray-800 bg-gray-900">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
