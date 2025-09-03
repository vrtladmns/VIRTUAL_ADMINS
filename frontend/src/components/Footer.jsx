import React from 'react'
import { Heart } from 'lucide-react'

export const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-black py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">
            © {currentYear} Virtual Admins. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
            Made with 
            <Heart className="h-3 w-3 text-purple-500 fill-current" /> 
            by Virtual Admins
          </p>
        </div>
      </div>
    </footer>
  )
}
