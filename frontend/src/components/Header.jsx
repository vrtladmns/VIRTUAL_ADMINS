import React from 'react'
import { useStore } from '../store/useStore'
import { Badge } from './ui/badge'

export const Header = ({ children }) => {
  const { sessionId, currentStep, getProgress } = useStore()
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">HR Onboarding Bot</h1>
          
          {sessionId && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Step {currentStep} of 17
              </Badge>
              <Badge variant="outline">
                {getProgress()}% Complete
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {children}
        </div>
      </div>
    </header>
  )
}
