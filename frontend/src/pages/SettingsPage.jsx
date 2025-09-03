import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { Bot, MessageCircle, User, Building, BarChart3, LogOut, Settings, Palette, Sun, Moon, Database, RefreshCw, Bell, Shield, Info } from 'lucide-react'
import { Badge } from '../components/ui/badge'

export const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    autoSave: false,
    language: 'en',
    timezone: 'UTC'
  })
  const [isSaving, setIsSaving] = useState(false)
  const navigate = useNavigate()

  const handleClearSession = () => {
    if (confirm('Are you sure you want to end your current onboarding session? This action cannot be undone.')) {
      // Session clearing functionality can be implemented here
      console.log('Session cleared')
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Settings saved:', settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRefreshData = () => {
    window.location.reload()
  }

  return (
    <div className="flex-1 bg-black main-content">
        {/* Header */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-2">
              Configure your preferences and account settings
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="p-6 space-y-8 sm:space-y-10 lg:space-y-12">
            {/* Profile Settings */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">Profile Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                    />
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">Notification Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Email Notifications</p>
                      <p className="text-xs text-gray-400">Receive updates via email</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Push Notifications</p>
                      <p className="text-xs text-gray-400">Receive push notifications</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">SMS Notifications</p>
                      <p className="text-xs text-gray-400">Receive SMS updates</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">Security Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-sm font-medium text-gray-300">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium text-gray-300">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-300">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Update Password
                </Button>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">About</CardTitle>
                <CardDescription className="text-gray-400">
                  Information about this application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Version</span>
                    <span className="text-sm text-gray-400">1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Build Date</span>
                    <span className="text-sm text-gray-400">December 2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Developer</span>
                    <span className="text-sm text-gray-400">HR VA Team</span>
                  </div>
                </div>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500">
                  Check for Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
}
