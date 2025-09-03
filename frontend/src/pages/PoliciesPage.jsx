import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Bot, MessageCircle, User, Building, BarChart3, Settings, LogOut, Search, FileText, Plus, Edit, Trash2, X, Save } from 'lucide-react'
import { endpoints } from '../lib/api'

export const PoliciesPage = () => {
  const [policies, setPolicies] = useState([])
  const [filteredPolicies, setFilteredPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  
  // CRUD state
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [newPolicy, setNewPolicy] = useState({
    section_id: '',
    title: '',
    content: '',
    order: 1
  })
  const [successMessage, setSuccessMessage] = useState('')
  
  // Validation state
  const [usedOrders, setUsedOrders] = useState([])
  const [usedSectionIds, setUsedSectionIds] = useState([])
  const [validationErrors, setValidationErrors] = useState({})
  const [isLoadingValidation, setIsLoadingValidation] = useState(false)
  
  const navigate = useNavigate()

  useEffect(() => {
    loadPolicies()
    loadValidationData()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPolicies(policies)
    } else {
      const filtered = policies.filter(policy =>
        policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredPolicies(filtered)
    }
  }, [searchQuery, policies])

  const loadPolicies = async () => {
    try {
      setLoading(true)
      const response = await endpoints.getPolicies()
      console.log('Policies loaded:', response.data)
      setPolicies(response.data)
      setFilteredPolicies(response.data)
    } catch (error) {
      console.error('Error loading policies:', error)
      setError('Failed to load policies. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadValidationData = async () => {
    try {
      setIsLoadingValidation(true)
      const [ordersResponse, sectionIdsResponse] = await Promise.all([
        endpoints.getUsedOrders(),
        endpoints.getUsedSectionIds()
      ])
      
      setUsedOrders(ordersResponse.data.used_orders || [])
      setUsedSectionIds(sectionIdsResponse.data.used_section_ids || [])
    } catch (error) {
      console.error('Error loading validation data:', error)
      // Don't show error to user for validation data loading
    } finally {
      setIsLoadingValidation(false)
    }
  }



  const handleFeatureClick = (path) => {
    navigate(path)
  }

  // Auto-scroll to policy details when opened
  const handleViewPolicy = (policy) => {
    setSelectedPolicy(policy)
    // Auto-scroll to the policy details after a short delay to ensure DOM update
    setTimeout(() => {
      const policyDetailElement = document.getElementById('policy-detail')
      if (policyDetailElement) {
        policyDetailElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        })
      }
    }, 100)
  }

  // Auto-scroll to edit form when editing
  const handleEditPolicyClick = (policy) => {
    startEditing(policy)
    // Switch to manage tab and scroll to edit form
    setTimeout(() => {
      // Switch to manage tab
      const manageTab = document.querySelector('[data-state="active"][value="manage"]')
      if (!manageTab) {
        // If not on manage tab, find and click it
        const manageTabButton = document.querySelector('[value="manage"]')
        if (manageTabButton) {
          manageTabButton.click()
        }
      }
      
      // Scroll to edit form
      setTimeout(() => {
        const editFormElement = document.getElementById('edit-form')
        if (editFormElement) {
          editFormElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          })
        }
      }, 200)
    }, 100)
  }

  // CRUD Functions
  const handleCreatePolicy = async () => {
    try {
      // Clear previous validation errors
      setValidationErrors({})
      
      if (!newPolicy.section_id || !newPolicy.title || !newPolicy.content) {
        setError('Please fill in all required fields')
        return
      }

      const response = await endpoints.createPolicy(newPolicy)
      console.log('Policy created:', response.data)
      
      // Reset form and reload policies
      setNewPolicy({ section_id: '', title: '', content: '', order: 1 })
      setIsCreating(false)
      await loadPolicies()
      await loadValidationData() // Reload validation data
      setError('')
      setSuccessMessage('Policy created successfully!')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Error creating policy:', error)
      
      if (error.response?.status === 409) {
        // Handle duplicate key errors
        const errorDetail = error.response.data.detail
        if (errorDetail?.error === 'duplicate') {
          setValidationErrors({
            [errorDetail.field]: errorDetail.message
          })
          setError('')
        } else {
          setError(errorDetail?.message || 'Duplicate entry detected')
        }
      } else if (error.response?.status === 422) {
        // Handle validation errors
        const errorDetail = error.response.data.detail
        if (Array.isArray(errorDetail)) {
          const fieldErrors = {}
          errorDetail.forEach(err => {
            if (err.loc && err.loc.length > 1) {
              fieldErrors[err.loc[1]] = err.msg
            }
          })
          setValidationErrors(fieldErrors)
          setError('')
        } else {
          setError('Validation error occurred')
        }
      } else {
        setError(error.response?.data?.detail || 'Failed to create policy. Please try again.')
      }
      setSuccessMessage('')
    }
  }

  const handleEditPolicy = async () => {
    try {
      // Clear previous validation errors
      setValidationErrors({})
      
      if (!editingPolicy.title || !editingPolicy.content) {
        setError('Please fill in all required fields')
        return
      }

      const updates = {
        title: editingPolicy.title,
        content: editingPolicy.content,
        order: editingPolicy.order
      }

      const response = await endpoints.updatePolicy(editingPolicy.section_id, updates)
      console.log('Policy updated:', response.data)
      
      // Reset form and reload policies
      setEditingPolicy(null)
      setIsEditing(false)
      await loadPolicies()
      await loadValidationData() // Reload validation data
      setError('')
      setSuccessMessage('Policy updated successfully!')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Error updating policy:', error)
      
      if (error.response?.status === 409) {
        // Handle duplicate key errors
        const errorDetail = error.response.data.detail
        if (errorDetail?.error === 'duplicate') {
          setValidationErrors({
            [errorDetail.field]: errorDetail.message
          })
          setError('')
        } else {
          setError(errorDetail?.message || 'Duplicate entry detected')
        }
      } else if (error.response?.status === 404) {
        setError('Policy not found. It may have been deleted.')
      } else if (error.response?.status === 422) {
        // Handle validation errors
        const errorDetail = error.response.data.detail
        if (Array.isArray(errorDetail)) {
          const fieldErrors = {}
          errorDetail.forEach(err => {
            if (err.loc && err.loc.length > 1) {
              fieldErrors[err.loc[1]] = err.loc[1] === 'order' ? 'order' : err.loc[1]
            }
          })
          setValidationErrors(fieldErrors)
          setError('')
        } else {
          setError('Validation error occurred')
        }
      } else {
        setError(error.response?.data?.detail || 'Failed to update policy. Please try again.')
      }
      setSuccessMessage('')
    }
  }

  const handleDeletePolicy = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this policy section? This action cannot be undone.')) {
      return
    }

    try {
      const response = await endpoints.deletePolicy(sectionId)
      console.log('Policy deleted:', response.data)
      
      await loadPolicies()
      await loadValidationData() // Reload validation data
      setError('')
      setSuccessMessage('Policy deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Error deleting policy:', error)
      
      if (error.response?.status === 404) {
        setError('Policy not found. It may have already been deleted.')
      } else {
        setError(error.response?.data?.detail || 'Failed to delete policy. Please try again.')
      }
      setSuccessMessage('')
    }
  }

  const startEditing = (policy) => {
    setEditingPolicy({ ...policy })
    setIsEditing(true)
    setIsCreating(false)
    setError('')
    setSuccessMessage('')
    setValidationErrors({})
  }

  const startCreating = () => {
    // Find the next available step number
    const nextAvailableOrder = usedOrders.length > 0 ? Math.max(...usedOrders) + 1 : 1
    
    setIsCreating(true)
    setIsEditing(false)
    setEditingPolicy(null)
    setNewPolicy({ section_id: '', title: '', content: '', order: nextAvailableOrder })
    setError('')
    setSuccessMessage('')
    setValidationErrors({})
  }

  const cancelForm = () => {
    setIsCreating(false)
    setIsEditing(false)
    setEditingPolicy(null)
    setNewPolicy({ section_id: '', title: '', content: '', order: 1 })
    setError('')
    setSuccessMessage('')
    setValidationErrors({})
  }

  return (
    <div className="flex-1 bg-black main-content">
        {/* Header */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-white">HR Policies</h1>
            <p className="text-gray-400 mt-2">
              Browse and search through company HR policies. Ask questions to get instant AI-powered answers.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="p-6 space-y-8 sm:space-y-10 lg:space-y-12">
            <Tabs defaultValue="browse" className="space-y-8 sm:space-y-10 lg:space-y-12">
              <TabsList className="bg-gray-900 border-gray-700">
                <TabsTrigger value="browse" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">Browse Policies</TabsTrigger>
                <TabsTrigger value="manage" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">Manage Policies</TabsTrigger>

              </TabsList>

              <TabsContent value="browse" className="space-y-8 sm:space-y-10 lg:space-y-12">

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search policies by title or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                  />
                </div>

                {/* Policies Grid */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-400">Loading policies...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPolicies.map((policy) => (
                      <Card 
                        key={policy.section_id} 
                        className="bg-gray-900 border-gray-800 hover:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg text-white">{policy.title}</CardTitle>
                              <CardDescription className="text-gray-400">
                                Step {policy.order} of {Math.max(...policies.map(p => p.order), 17)}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="border-gray-600 text-gray-300">#{policy.order}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-300 line-clamp-3 mb-4">
                            {policy.content.substring(0, 150)}...
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleViewPolicy(policy)}
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              onClick={() => handleEditPolicyClick(policy)}
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeletePolicy(policy.section_id)}
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-red-600 text-red-400 hover:bg-red-900/20 hover:border-red-500 hover:bg-red-900/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Selected Policy Detail */}
                {selectedPolicy && (
                  <div className="relative">
                    {/* Scroll indicator */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center animate-bounce">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                    
                    <Card id="policy-detail" className="bg-gray-900 border-gray-800 shadow-lg border-2 border-blue-500">
                      <CardHeader className="border-b border-gray-800 bg-blue-900/10">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-white">
                              <FileText className="h-5 w-5 text-blue-400" />
                              {selectedPolicy.title}
                            </CardTitle>
                                                        <CardDescription className="text-gray-300">
                            Step {selectedPolicy.order} of {Math.max(...policies.map(p => p.order), 17)} in the onboarding process
                          </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPolicy(null)}
                            className="text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-600 hover:border-gray-500"
                          >
                            Close
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">{selectedPolicy.content}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manage" className="space-y-8 sm:space-y-10 lg:space-y-12">
                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Success Display */}
                {successMessage && (
                  <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                    <p className="text-green-400 text-sm">{successMessage}</p>
                  </div>
                )}

                {/* Create/Edit Form */}
                {(isCreating || isEditing) && (
                  <div className="relative">
                    {/* Edit form indicator */}
                    {isEditing && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                          <Edit className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <Card id="edit-form" className="bg-gray-900 border-gray-800 shadow-lg border-2 border-green-500">
                      <CardHeader className="border-b border-gray-800 bg-green-900/10">
                        <CardTitle className="flex items-center gap-2 text-white">
                          {isCreating ? <Plus className="h-5 w-5" /> : <Edit className="h-5 w-5 text-green-400" />}
                          {isCreating ? 'Create New Policy' : 'Edit Policy'}
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          {isCreating ? 'Add a new policy section to the onboarding process' : 'Update the selected policy section'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="section_id" className="text-gray-300">Section ID *</Label>
                          <Input
                            id="section_id"
                            placeholder="e.g., company_overview"
                            value={isCreating ? newPolicy.section_id : editingPolicy?.section_id || ''}
                            onChange={(e) => {
                              if (isCreating) {
                                setNewPolicy({ ...newPolicy, section_id: e.target.value })
                              } else {
                                setEditingPolicy({ ...editingPolicy, section_id: e.target.value })
                              }
                            }}
                            disabled={isEditing}
                            className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 ${
                              validationErrors.section_id ? 'border-red-500' : ''
                            }`}
                          />
                          {validationErrors.section_id && (
                            <p className="text-red-400 text-sm mt-1">{validationErrors.section_id}</p>
                          )}
                          <p className="text-gray-400 text-xs">
                            Only alphanumeric characters and underscores allowed. Max 100 characters.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="order" className="text-gray-300">Step Order *</Label>
                          <div className="flex gap-2">
                            <select
                              id="order"
                              value={isCreating ? newPolicy.order : editingPolicy?.order || 1}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1
                                if (isCreating) {
                                  setNewPolicy({ ...newPolicy, order: value })
                                } else {
                                  setEditingPolicy({ ...editingPolicy, order: value })
                                }
                              }}
                              className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                            >
                              {Array.from({ length: Math.max(17, Math.max(...usedOrders, 0) + 5) }, (_, i) => i + 1).map(order => {
                                const isUsed = usedOrders.includes(order)
                                const isCurrentOrder = !isCreating && editingPolicy?.order === order
                                const isDisabled = isUsed && !isCurrentOrder
                                
                                return (
                                  <option 
                                    key={order} 
                                    value={order}
                                    disabled={isDisabled}
                                    className={isDisabled ? 'text-gray-500 bg-gray-700' : 'text-white bg-gray-800'}
                                  >
                                    {order} {isUsed && !isCurrentOrder ? '(Used)' : ''}
                                  </option>
                                )
                              })}
                            </select>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Custom"
                              value={isCreating ? newPolicy.order : editingPolicy?.order || 1}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1
                                if (isCreating) {
                                  setNewPolicy({ ...newPolicy, order: value })
                                } else {
                                  setEditingPolicy({ ...editingPolicy, order: value })
                                }
                              }}
                              className="w-24 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                            />
                          </div>
                          {validationErrors.order && (
                            <p className="text-red-400 text-sm mt-1">{validationErrors.order}</p>
                          )}
                          <p className="text-gray-400 text-xs">
                            Choose from dropdown or enter custom step number. Minimum: 1
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-gray-300">Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Company Overview and Mission"
                          value={isCreating ? newPolicy.title : editingPolicy?.title || ''}
                          onChange={(e) => {
                            if (isCreating) {
                              setNewPolicy({ ...newPolicy, title: e.target.value })
                            } else {
                              setEditingPolicy({ ...editingPolicy, title: e.target.value })
                            }
                          }}
                          className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 ${
                            validationErrors.title ? 'border-red-500' : ''
                          }`}
                        />
                        {validationErrors.title && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.title}</p>
                        )}
                        <p className="text-gray-400 text-xs">
                          Max 150 characters.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="content" className="text-gray-300">Content *</Label>
                        <Textarea
                          id="content"
                          placeholder="Enter the full policy content..."
                          value={isCreating ? newPolicy.content : editingPolicy?.content || ''}
                          onChange={(e) => {
                            if (isCreating) {
                              setNewPolicy({ ...newPolicy, content: e.target.value })
                            } else {
                              setEditingPolicy({ ...editingPolicy, content: e.target.value })
                            }
                          }}
                          rows={6}
                          className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 ${
                            validationErrors.content ? 'border-red-500' : ''
                          }`}
                        />
                        {validationErrors.content && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.content}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Max 20,000 characters.
                        </p>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={isCreating ? handleCreatePolicy : handleEditPolicy}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isCreating ? 'Create Policy' : 'Update Policy'}
                        </Button>
                        <Button
                          onClick={cancelForm}
                          variant="outline"
                          className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                )}

                {/* Action Buttons */}
                {!isCreating && !isEditing && (
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={startCreating}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Policy
                    </Button>
                  </div>
                )}


              </TabsContent>


            </Tabs>
          </div>
        </div>
      </div>
    )
}
