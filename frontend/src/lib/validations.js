import { z } from 'zod'

// Employee onboarding form validation
export const employeeSchema = z.object({
  employee_code: z.string().min(1, 'Employee code is required').max(50, 'Employee code must be less than 50 characters'),
  employee_name: z.string().min(2, 'Employee name must be at least 2 characters').max(100, 'Employee name must be less than 100 characters'),
  gender: z.string().min(1, 'Gender is required').max(20, 'Gender must be less than 20 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  date_of_joining: z.string().min(1, 'Date of joining is required'),
  designation: z.string().min(2, 'Designation must be at least 2 characters').max(100, 'Designation must be less than 100 characters'),
  ctc_at_joining: z.number().positive('CTC must be a positive number'),
  aadhaar_number: z.string().min(8, 'Aadhaar number must be at least 8 characters').max(20, 'Aadhaar number must be less than 20 characters'),
  uan: z.string().max(20, 'UAN must be less than 20 characters').optional(),
  personal_email_id: z.string().email('Invalid personal email address'),
  official_email_id: z.string().email('Invalid official email address'),
  contact_number: z.string().min(5, 'Contact number must be at least 5 characters').max(30, 'Contact number must be less than 30 characters'),
  emergency_contact_name: z.string().min(2, 'Emergency contact name must be at least 2 characters').max(100, 'Emergency contact name must be less than 100 characters'),
  emergency_contact_number: z.string().min(5, 'Emergency contact number must be at least 5 characters').max(30, 'Emergency contact number must be less than 30 characters'),
})

// Policy question validation
export const policyQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  mode: z.enum(['auto', 'guided', 'global']).default('auto'),
  section_id: z.string().optional(),
})

// Onboarding session validation
export const onboardingSessionSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
})

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['user', 'assistant']).default('user'),
  timestamp: z.date().default(() => new Date()),
})

// Search validation
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['policies', 'employees', 'all']).default('all'),
})
