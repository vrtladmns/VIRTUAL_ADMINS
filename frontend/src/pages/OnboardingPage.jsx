import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Bot, MessageCircle, User, Building, BarChart3, Settings, LogOut, Calendar, Mail, Phone, AlertCircle } from 'lucide-react'
import { employeeSchema } from '../lib/validations'
import { endpoints } from '../lib/api'
import { useStore } from '../store/useStore'

export const OnboardingPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()

  const { setCurrentTab } = useStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(employeeSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      console.log('📝 Raw form data:', data)
      console.log('📝 CTC field type:', typeof data.ctc_at_joining, 'Value:', data.ctc_at_joining)
      
      // Convert string inputs to proper types before validation
      const employeeData = {
        ...data,
        // Convert numeric fields from strings to numbers
        ctc_at_joining: parseFloat(data.ctc_at_joining) || 0,
        // Convert dates to proper format
        date_of_birth: data.date_of_birth,
        date_of_joining: data.date_of_joining
      }
      
      console.log('✅ Processed employee data:', employeeData)
      console.log('✅ CTC field after conversion:', typeof employeeData.ctc_at_joining, 'Value:', employeeData.ctc_at_joining)
      
      const response = await endpoints.onboardEmployee(employeeData)
      console.log('Employee onboarded successfully:', response.data)
      
      setSubmitSuccess(true)
      
      // Clear form
      reset()
      
      // Show success message
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
      
    } catch (error) {
      console.error('❌ Failed to onboard employee:', error)
      setSubmitError(error.response?.data?.detail || 'Failed to onboard employee. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setValue(name, value, { shouldValidate: true })
  }

  const handleCTCChange = (e) => {
    const { value } = e.target
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '')
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.')
    if (parts.length > 2) {
      const formattedValue = parts[0] + '.' + parts.slice(1).join('')
      setValue('ctc_at_joining', formattedValue, { shouldValidate: true })
    } else {
      setValue('ctc_at_joining', cleanValue, { shouldValidate: true })
    }
  }

  const handleFeatureClick = (path) => {
    navigate(path)
  }

  return (
    <div className="flex-1 bg-black main-content">
      {/* Header */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white">Employee Onboarding</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="p-6 space-y-8 sm:space-y-10 lg:space-y-12">
          {/* Success/Error Messages */}
          {submitSuccess && (
            <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-center gap-3">
              <User className="h-5 w-5 text-green-400" />
              <div>
                <h3 className="font-medium text-green-300">Employee Onboarded Successfully!</h3>
                <p className="text-sm text-green-400">Your onboarding session will begin shortly.</p>
              </div>
            </div>
          )}

          {submitError && (
            <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Submission Failed</h3>
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <Card className="shadow-xl border-0 bg-gray-900 border-gray-800">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <User className="h-8 w-8" />
                Employee Information
              </CardTitle>
              <CardDescription className="text-blue-100">
                Please fill out all required fields to begin your onboarding journey
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="p-8 space-y-8 sm:space-y-10 lg:space-y-12">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    <User className="h-5 w-5 text-brand-400" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="employee_code" className="text-sm font-medium text-gray-300">
                        Employee Code *
                      </Label>
                      <Input
                        id="employee_code"
                        {...register('employee_code')}
                        onChange={handleInputChange}
                        placeholder="EMP001"
                        className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.employee_code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors.employee_code && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.employee_code.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="employee_name" className="text-sm font-medium text-gray-300">
                        Full Name *
                      </Label>
                      <Input
                        id="employee_name"
                        {...register('employee_name')}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.employee_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors.employee_name && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.employee_name.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium text-gray-300">
                        Gender *
                      </Label>
                      <select 
                        id="gender" 
                        {...register('gender')}
                        className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-gray-800 text-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-600 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.gender ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.gender.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="designation" className="text-sm font-medium text-gray-300">
                        Designation *
                      </Label>
                      <Input
                        id="designation"
                        {...register('designation')}
                        onChange={handleInputChange}
                        placeholder="Software Engineer"
                        className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.designation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors.designation && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.designation.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand-400" />
                    Important Dates
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-300">
                        Date of Birth *
                      </Label>
                      <input
                        id="date_of_birth"
                        type="date"
                        {...register('date_of_birth')}
                        className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-gray-800 text-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-600 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.date_of_birth ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors.date_of_birth && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.date_of_birth.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date_of_joining" className="text-sm font-medium text-gray-300">
                        Date of Joining *
                      </Label>
                      <input
                        id="date_of_joining"
                        type="date"
                        {...register('date_of_joining')}
                        className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm bg-gray-800 text-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-600 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.date_of_joining ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors.date_of_joining && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.date_of_joining.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-brand-400" />
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="personal_email_id" className="text-sm font-medium text-gray-300">
                        Personal Email *
                      </Label>
                      <Input
                        id="personal_email_id"
                        type="email"
                        {...register('personal_email_id')}
                        onChange={handleInputChange}
                        placeholder="john.doe@email.com"
                        className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.personal_email_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors.personal_email_id && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.personal_email_id.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="official_email_id" className="text-sm font-medium text-gray-300">
                        Official Email *
                      </Label>
                      <Input
                        id="official_email_id"
                        type="email"
                        {...register('official_email_id')}
                        onChange={handleInputChange}
                        placeholder="john.doe@company.com"
                        className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.official_email_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors.official_email_id && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.official_email_id.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact_number" className="text-sm font-medium text-gray-300">
                        Contact Number *
                      </Label>
                      <Input
                        id="contact_number"
                        {...register('contact_number')}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.contact_number ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors.contact_number && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.contact_number.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ctc_at_joining" className="text-sm font-medium text-gray-300">
                        CTC at Joining (₹) *
                      </Label>
                      <div className="relative">
                        <Input
                          id="ctc_at_joining"
                          type="text" // Changed to text to allow decimal points
                          {...register('ctc_at_joining', {
                            setValueAs: (value) => {
                              // Convert empty string to undefined, otherwise parse as number
                              if (value === '') return undefined
                              const num = parseFloat(value)
                              return isNaN(num) ? undefined : num
                            },
                            validate: (value) => {
                              if (value === undefined || value === '') {
                                return 'CTC is required'
                              }
                              if (isNaN(value) || value <= 0) {
                                return 'CTC must be a positive number'
                              }
                              if (value < 1000) {
                                return 'CTC must be at least ₹1,000'
                              }
                              return true
                            }
                          })}
                          onChange={handleCTCChange}
                          placeholder="500000"
                          className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 pr-20 transition-colors ${
                            errors.ctc_at_joining 
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                              : 'focus:border-brand-500 focus:ring-brand-500'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-400 text-sm">₹</span>
                        </div>
                      </div>
                      {errors.ctc_at_joining && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.ctc_at_joining.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        Enter the total cost to company in Indian Rupees (e.g., 500000)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Government IDs */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    <Building className="h-5 w-5 text-brand-400" />
                    Government IDs
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="aadhaar_number" className="text-sm font-medium text-gray-300">
                        Aadhaar Number *
                      </Label>
                      <Input
                        id="aadhaar_number"
                        {...register('aadhaar_number')}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012"
                        className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.aadhaar_number ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors.aadhaar_number && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.aadhaar_number.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="uan" className="text-sm font-medium text-gray-300">
                        UAN (Optional)
                      </Label>
                      <Input
                        id="uan"
                        {...register('uan')}
                        onChange={handleInputChange}
                        placeholder="123456789012"
                        className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.uan ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors.uan && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.uan.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-brand-400" />
                    Emergency Contact
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_name" className="text-sm font-medium text-gray-300">
                        Emergency Contact Name *
                      </Label>
                      <Input
                        id="emergency_contact_name"
                        {...register('emergency_contact_name')}
                        onChange={handleInputChange}
                        placeholder="Jane Doe"
                        className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.emergency_contact_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors.emergency_contact_name && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.emergency_contact_name.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_number" className="text-sm font-medium text-gray-300">
                        Emergency Contact Number *
                      </Label>
                      <Input
                        id="emergency_contact_number"
                        {...register('emergency_contact_number')}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43211"
                        className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 ${
                          errors.emergency_contact_number ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors.emergency_contact_number && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.emergency_contact_number.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-8 pt-0">
                <div className="w-full space-y-6">
                  {/* Debug Info */}
                  <div className="text-sm text-gray-400 text-center">
                    Form Valid: {isValid ? '✅ Yes' : '❌ No'} | 
                    Has Errors: {Object.keys(errors).length > 0 ? '❌ Yes' : '✅ No'}
                  </div>
                  
                  {/* Form Data Preview */}
                  <div className="text-xs text-gray-500 text-center p-2 bg-gray-800 rounded">
                    <strong>Form Data Preview:</strong> {Object.keys(errors).length > 0 ? 
                      `${Object.keys(errors).length} validation errors` : 
                      'All fields valid'
                    }
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !isValid}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      'Start Onboarding Journey'
                    )}
                  </Button>
                  
                  {/* Test Button */}
                  <Button 
                    type="button"
                    onClick={() => {
                      console.log('Current form errors:', errors)
                      console.log('Form validation state:', { isValid, errors })
                    }}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Debug: Show Form State
                  </Button>
                  
                  {/* Test API Connection Button */}
                  <Button 
                    type="button"
                    onClick={async () => {
                      console.log('🧪 Testing API connection...')
                      try {
                        const response = await endpoints.health()
                        console.log('✅ Health check successful:', response.data)
                        alert('✅ Backend is connected! Health check: ' + JSON.stringify(response.data))
                      } catch (error) {
                        console.error('❌ Health check failed:', error)
                        alert('❌ Backend connection failed: ' + error.message)
                      }
                    }}
                    variant="outline"
                    className="w-full bg-yellow-900/20 border-yellow-600 text-yellow-400 hover:bg-yellow-900/30"
                  >
                    🧪 Test Backend Connection
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
