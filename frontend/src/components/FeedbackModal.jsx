import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { X, Star, MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { endpoints } from '../lib/api'

export const FeedbackModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    category: '',
    message: '',
    email: '',
    anonymous: false
  })
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error', null
  const [errors, setErrors] = useState({})

  const categories = [
    'HR',
    'Onboarding',
    'Technical',
    'Bug Report',
    'Feature Request',
    'Other'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleStarClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }))
    // Clear rating error when user selects a rating
    if (errors.rating) {
      setErrors(prev => ({
        ...prev,
        rating: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long'
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }
    
    if (formData.rating === 0) {
      newErrors.rating = 'Please provide a rating'
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // Prepare data for API
      const feedbackData = {
        rating: formData.rating,
        category: formData.category,
        message: formData.message,
        anonymous: formData.anonymous
      }

      // Only include email if not anonymous and email is provided
      if (!formData.anonymous && formData.email && formData.email.trim()) {
        feedbackData.email = formData.email
      }

      // Debug: Log the data being sent
      console.log('Sending feedback data:', feedbackData)

      // Call the feedback API
      const response = await endpoints.submitFeedback(feedbackData)
      
      if (response.data.status === 'success') {
        setSubmitStatus('success')
        
        // Reset form after success
        setTimeout(() => {
          setFormData({
            rating: 0,
            category: '',
            message: '',
            email: '',
            anonymous: false
          })
          setSubmitStatus(null)
          onClose()
        }, 2000)
      } else {
        setSubmitStatus('error')
      }
      
    } catch (error) {
      console.error('Feedback submission error:', error)
      
      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md transform transition-all duration-300 scale-100">
        <Card className="bg-gradient-to-br from-gray-900/95 to-gray-800/90 border border-gray-700/50 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <CardHeader className="relative pb-4">
            <Button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 h-8 w-8 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl text-white">Share Your Feedback</CardTitle>
            </div>
            <p className="text-gray-400 text-sm">
              Help us improve your experience
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {submitStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Thank You!</h3>
                <p className="text-gray-400">Your feedback has been submitted successfully.</p>
              </div>
            ) : submitStatus === 'error' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Oops!</h3>
                <p className="text-gray-400">Something went wrong. Please try again.</p>
                <Button
                  onClick={() => setSubmitStatus(null)}
                  className="mt-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    How would you rate your experience? *
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className="transition-all duration-200 hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoveredStar || formData.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {errors.rating && (
                    <p className="text-red-400 text-xs mt-1">{errors.rating}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all duration-300"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category} className="bg-gray-800">
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-400 text-xs mt-1">{errors.category}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Your Message *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your experience, suggestions, or any issues you encountered..."
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all duration-300 resize-none"
                    rows={4}
                  />
                  {errors.message && (
                    <p className="text-red-400 text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email (Optional)
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all duration-300"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Anonymous */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.anonymous}
                    onChange={(e) => handleInputChange('anonymous', e.target.checked)}
                    className="w-4 h-4 text-brand-500 bg-gray-800/50 border-gray-600/50 rounded focus:ring-brand-500/50 focus:ring-2"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-300">
                    Submit anonymously
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/25 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
