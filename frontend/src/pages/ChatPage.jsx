import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Bot, 
  MessageCircle, 
  User, 
  Building, 
  BarChart3, 
  Settings, 
  LogOut,
  Send,
  FileText,
  Mic,
  Plus,
  Trash2,
  Lightbulb,
  Brain,
  Hand,
  DollarSign,
  Clock,
  Heart,
  Calendar,
  Car,
  Utensils,
  Shield,
  CreditCard,
  Wifi,
  Receipt,
  DollarSignIcon,
  Hourglass,
  Users,
  TrendingUp
} from 'lucide-react'
import { endpoints } from '../lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
              content: `Welcome to HR VA! I'm your AI assistant for HR questions, policies, and onboarding support.`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [selectedMode, setSelectedMode] = useState('global')
  const [selectedSection, setSelectedSection] = useState('')
  const [availableSections, setAvailableSections] = useState([])
  const [selectedScope, setSelectedScope] = useState('employee')
  const initialMessageProcessed = useRef(false)

  const navigate = useNavigate()
  const location = useLocation()

  // Removed scroll functionality since messages are now displayed directly on the page

  // Initialize chat page when component mounts
  useEffect(() => {
    const initializeChat = async () => {
      setIsInitializing(true)
      try {
        console.log('🚀 Initializing chat page...')
        
        // Load available policy sections for guided mode
        try {
          const policiesResponse = await endpoints.getPolicies()
          setAvailableSections(policiesResponse.data)
          console.log('📚 Loaded policy sections:', policiesResponse.data.length)
        } catch (policyError) {
          console.warn('⚠️ Failed to load policy sections:', policyError.message)
        }
        
        // Set a simple session ID for chat (no need for employee creation)
        const chatSessionId = 'chat_' + Date.now()
        setSessionId(chatSessionId)
        console.log('💬 Chat session initialized:', chatSessionId)
        
      } catch (error) {
        console.error('❌ Failed to initialize chat:', error)
        
        // Create a fallback session ID for basic chat
        const fallbackSessionId = 'chat_' + Date.now()
        console.log('⚠️ Using fallback session ID:', fallbackSessionId)
        setSessionId(fallbackSessionId)
        
        // Show warning message
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          content: '⚠️ Note: Using fallback chat mode. Some features may be limited.',
          timestamp: new Date()
        }])
      } finally {
        setIsInitializing(false)
      }
    }
    
    initializeChat()
  }, [])

  // Handle initial message from homepage
  useEffect(() => {
    console.log('🔍 useEffect triggered - location.state:', location.state, 'isInitializing:', isInitializing, 'initialMessageProcessed:', initialMessageProcessed.current)
    
    if (location.state?.initialMessage && !isInitializing && !initialMessageProcessed.current) {
      const initialMessage = location.state.initialMessage
      console.log('📝 Received initial message from homepage:', initialMessage)
      
      // Mark as processed to prevent duplicate execution
      initialMessageProcessed.current = true
      
      // Clear the location state to prevent re-adding on re-render
      navigate(location.pathname, { replace: true })
      
      // Auto-send the message after a short delay (this will add the message to chat)
      setTimeout(() => {
        handleSendMessage(initialMessage)
      }, 500)
    }

    // Cleanup function to reset the ref when component unmounts
    return () => {
      initialMessageProcessed.current = false
    }
  }, [location.state, isInitializing])

  // Onboarding scope quick suggestions
  const onboardingPrompts = [
    { text: 'Tell me about company policies', icon: Building, color: 'text-brand-400', borderColor: 'border-brand-500/60', hoverBg: 'hover:bg-brand-500/20', hoverBorder: 'hover:border-brand-400' },
    { text: 'How many leaves do we get in a year?', icon: FileText, color: 'text-blue-400', borderColor: 'border-blue-500/60', hoverBg: 'hover:bg-blue-500/20', hoverBorder: 'hover:border-blue-400' },
    { text: 'What is the leave policy?', icon: Calendar, color: 'text-orange-400', borderColor: 'border-orange-500/60', hoverBg: 'hover:bg-orange-500/20', hoverBorder: 'hover:border-orange-400' },
    { text: 'What are the working hours?', icon: Clock, color: 'text-purple-400', borderColor: 'border-purple-500/60', hoverBg: 'hover:bg-purple-500/20', hoverBorder: 'hover:border-purple-400' },
    { text: 'What is the dress code?', icon: User, color: 'text-pink-400', borderColor: 'border-pink-500/60', hoverBg: 'hover:bg-pink-500/20', hoverBorder: 'hover:border-pink-400' },
    { text: 'What is the notice period for resignation?', icon: FileText, color: 'text-red-400', borderColor: 'border-red-500/60', hoverBg: 'hover:bg-red-500/20', hoverBorder: 'hover:border-red-400' },
    { text: 'Is transportation provided?', icon: Car, color: 'text-cyan-400', borderColor: 'border-cyan-500/60', hoverBg: 'hover:bg-cyan-500/20', hoverBorder: 'hover:border-cyan-400' },
    { text: 'Do we get meal breaks?', icon: Utensils, color: 'text-yellow-400', borderColor: 'border-yellow-500/60', hoverBg: 'hover:bg-yellow-500/20', hoverBorder: 'hover:border-yellow-400' }
  ]

  // Employee Helpdesk scope quick suggestions
  const employeeHelpdeskPrompts = [
    { text: 'What should I do if I forget to clock in?', icon: Clock, color: 'text-green-400', borderColor: 'border-green-500/60', hoverBg: 'hover:bg-green-500/20', hoverBorder: 'hover:border-green-400' },
    { text: 'Can I get leave for a funeral without pay cut?', icon: DollarSignIcon, color: 'text-amber-400', borderColor: 'border-amber-500/60', hoverBg: 'hover:bg-amber-500/20', hoverBorder: 'hover:border-amber-400' },
    { text: 'How do I report if I’m going to be absent?', icon: Hourglass, color: 'text-blue-400', borderColor: 'border-blue-500/60', hoverBg: 'hover:bg-blue-500/20', hoverBorder: 'hover:border-blue-400' },
    { text: 'Can exceptions be made if I was late due to transport problems?', icon: Car, color: 'text-purple-400', borderColor: 'border-purple-500/60', hoverBg: 'hover:bg-purple-500/20', hoverBorder: 'hover:border-purple-400' },
    { text: 'What are the benefits of following the attendance rules?', icon: Heart, color: 'text-pink-400', borderColor: 'border-pink-500/60', hoverBg: 'hover:bg-pink-500/20', hoverBorder: 'hover:border-pink-400' },
    { text: 'What happens if I don’t inform anyone and miss 3 days?', icon: Building, color: 'text-indigo-400', borderColor: 'border-indigo-500/60', hoverBg: 'hover:bg-indigo-500/20', hoverBorder: 'hover:border-indigo-400' },
  
  ]

  // Get current quick suggestions based on selected scope
  const currentPrompts = selectedScope === 'onboarding' ? onboardingPrompts : employeeHelpdeskPrompts

  const handlePromptClick = (promptText, promptMode) => {
    console.log('🔍 Quick suggestion clicked:', promptText, 'Mode:', promptMode)
    setInputMessage(promptText)
    if (promptMode) {
      setSelectedMode(promptMode)
    }
    // Automatically send the message after a short delay to ensure state updates
    setTimeout(() => {
      console.log('📤 Auto-sending quick suggestion:', promptText)
      handleSendMessage(promptText)
    }, 100)
  }

  const handleFeatureClick = (path) => {
    navigate(path)
  }

  const handleSendMessage = async (messageToSend = null) => {
    console.log('🔍 handleSendMessage called with:', messageToSend, 'type:', typeof messageToSend)
    console.log('🔍 Current inputMessage state:', inputMessage)
    console.log('🔍 Current selectedScope:', selectedScope)
    console.log('🔍 Current selectedMode:', selectedMode)
    
    // Ensure we have a valid message string
    let message = messageToSend || inputMessage.trim()
    
    // If messageToSend is an event object, extract the input value instead
    if (messageToSend && typeof messageToSend === 'object' && messageToSend.target) {
      console.warn('⚠️ Event object passed instead of message, using input value')
      message = inputMessage.trim()
    }
    
    console.log('📝 Final message to send:', message)
    console.log('📝 Message length:', message.length)
    console.log('📝 Is typing:', isTyping)
    
    if (!message || isTyping) {
      console.log('❌ Message validation failed - message:', !!message, 'isTyping:', isTyping)
      return
    }

    // Only check for immediate duplicates (last message) to prevent accidental double-sends
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.sender === 'user' && lastMessage.content === message && 
        (Date.now() - lastMessage.timestamp.getTime()) < 5000) { // Only block if sent within 5 seconds
      console.log('⚠️ Recent duplicate message detected, skipping:', message)
      return
    }

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: message,
      timestamp: new Date()
    }

    // Add the user message to chat immediately
    console.log('📝 Adding user message to chat:', userMessage)
    setMessages(prev => {
      const newMessages = [...prev, userMessage]
      console.log('📝 Updated messages array length:', newMessages.length)
      return newMessages
    })
    if (!messageToSend) {
      setInputMessage('')
    }
    setIsTyping(true)

    try {
      // Final validation - ensure message is a string
      if (typeof message !== 'string') {
        console.error('❌ Invalid message type:', typeof message, message)
        throw new Error('Invalid message format')
      }
      
      console.log('📤 Sending message:', message)
      console.log('🎯 Selected scope:', selectedScope)
      console.log('📚 Selected mode:', selectedMode)
      console.log('🎯 Selected section:', selectedSection)
      
      // Health check removed for better performance
      
      // Use the new /api/ask endpoint
      const requestPayload = {
        scope: selectedScope,
        message: message
      }
      
      // Add mode and section_id only for onboarding scope
      if (selectedScope === 'onboarding') {
        requestPayload.mode = selectedMode
        if (selectedMode === 'guided' && selectedSection) {
          requestPayload.section_id = selectedSection
        }
      }
      
      console.log('🔍 Making API call to /api/ask with:', requestPayload)
      
      // Make the API call to the /api/ask endpoint
      const response = await endpoints.askQuestion(requestPayload)
      const responseData = response.data
      console.log('✅ /api/ask response:', responseData)
      
      let botMessageContent = ''
      
      if (selectedScope === 'onboarding') {
        botMessageContent = `📚 **${selectedMode === 'guided' ? 'Guided' : 'Global'} Mode Answer**\n\n**Question:** ${message}\n\n**Answer:** ${responseData.answer}\n\n**Mode Used:** ${responseData.mode_used || selectedMode}`
      } else {
        botMessageContent = `💼 **Employee Helpdesk Answer**\n\n**Question:** ${message}\n\n**Answer:** ${responseData.answer}`
      }
      
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        content: botMessageContent,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
      
    } catch (error) {
      console.error('❌ Error sending message:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: error.config
      })
      
      let errorContent = 'Sorry, I encountered an error. Please try again or contact support.'
      
      // Provide more specific error messages
      if (error.response?.status === 404) {
        errorContent = 'The chat service is not available. Please check if the backend is running.'
      } else if (error.response?.status === 422) {
        errorContent = `Validation error (422). Please check your question format.\n\nDetails: ${error.response?.data?.detail || 'Unknown validation error'}`
      } else if (error.response?.status === 500) {
        errorContent = 'Server error occurred. Please try again in a moment.'
      } else if (error.code === 'NETWORK_ERROR') {
        errorContent = 'Network error. Please check your connection and try again.'
      } else if (error.message.includes('Failed to fetch')) {
        errorContent = 'Backend connection failed. Please ensure the backend server is running on http://localhost:8000'
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        content: errorContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleNewChat = () => {
          setMessages([
        {
          id: Date.now(),
          sender: 'bot',
          content: `Welcome to HR VA! I'm your AI HR assistant, here to help you with day-to-day HR questions and support. I can answer questions about company procedures, benefits, policies, and provide helpful guidance on company culture, workplace practices, and general HR topics. You can also switch to Onboarding mode for policy-specific questions.`,
          timestamp: new Date()
        }
      ])
    setInputMessage('')
  }

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        {
          id: Date.now(),
          sender: 'bot',
          content: `Welcome to HR VA! I'm your AI HR assistant, here to help you with day-to-day HR questions and support. I can answer questions about company procedures, benefits, policies, and provide helpful guidance on company culture, workplace practices, and general HR topics. You can also switch to Onboarding mode for policy-specific questions.`,
          timestamp: new Date()
        }
      ])
      setInputMessage('')
    }
  }

  return (
    <div className="flex-1 bg-black flex flex-col main-content">
      {/* Header */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="p-4 border-b border-gray-800 bg-black">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">AI HR Assistant</h1>
              <p className="text-base text-gray-300 leading-relaxed max-w-3xl mx-auto">Your smart HR companion for day-to-day support, company procedures, and general company information. Switch to Onboarding mode for policy-specific guidance.</p>
            </div>
            <div className="flex gap-2 mt-4 justify-center flex-wrap">
              <Button onClick={handleNewChat} variant="outline" className="bg-gradient-to-br from-gray-800/80 to-gray-700/60 border-2 border-gray-500/60 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-400 px-3 py-1.5 text-xs transition-all duration-200">
                <Plus className="h-3 w-3 mr-1" /> New chat
              </Button>
              <Button onClick={handleClearChat} variant="outline" className="bg-gradient-to-br from-gray-800/80 to-gray-700/60 border-2 border-gray-500/60 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-400 px-3 py-1.5 text-xs transition-all duration-200">
                <Trash2 className="h-3 w-3 mr-1" /> Clear chat
              </Button>
              
              {/* Production: Test buttons commented out for clean UI
              <Button 
                onClick={async () => {
                  try {
                    console.log('🔍 Testing backend connection...')
                    
                    // Test 1: Health check
                    const healthResponse = await endpoints.health()
                    console.log('✅ Health check passed:', healthResponse.data)
                    
                    // Test 2: Try to get policies
                    const policiesResponse = await endpoints.getPolicies()
                    console.log('✅ Policies endpoint working:', policiesResponse.data.length, 'policies found')
                    
                    let message = `✅ Backend is connected!\n\n`
                    message += `• Health: ${healthResponse.data.status}\n`
                    message += `• Policies: ${policiesResponse.data.length} available\n`
                    message += `• Chat ready to use!`
                    
                    alert(message)
                    
                  } catch (error) {
                    console.error('❌ Backend test failed:', error)
                    
                    let errorMessage = `❌ Backend connection failed!\n\n`
                    
                    if (error.response) {
                      errorMessage += `Status: ${error.response.status}\n`
                      errorMessage += `Error: ${error.response.data?.detail || error.message}\n\n`
                      
                      if (error.response.status === 404) {
                        errorMessage += `The endpoint was not found. Check if the backend is running.`
                      } else if (error.response.status === 422) {
                        errorMessage += `Validation error. Check the request format.`
                      } else if (error.response.status === 500) {
                        errorMessage += `Server error. Check backend logs.`
                      } else {
                        errorMessage += `Unexpected error. Please try again.`
                      }
                    } else if (error.request) {
                      errorMessage += `No response received. Check if backend is running.`
                    } else {
                      errorMessage += `Request setup failed: ${error.message}`
                    }
                    
                    alert(errorMessage)
                  }
                }}
                variant="outline" 
                className="bg-gradient-to-br from-green-800/80 to-green-700/60 border-2 border-green-500/60 text-green-300 hover:bg-green-700/50 hover:text-white hover:border-green-400 px-3 py-1.5 text-xs transition-all duration-200"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span> Test Backend
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    console.log('🗄️ Testing MongoDB connection...')
                    const response = await endpoints.health()
                    console.log('✅ MongoDB test passed:', response.data)
                    alert('✅ MongoDB is connected and working!')
                  } catch (error) {
                    console.error('❌ MongoDB test failed:', error)
                    alert('❌ MongoDB connection failed: ' + error.message)
                  }
                }}
                variant="outline" 
                className="bg-gradient-to-br from-purple-800/80 to-purple-700/60 border-2 border-purple-500/60 text-purple-300 hover:bg-purple-700/50 hover:text-white hover:border-purple-400 px-3 py-1.5 text-xs transition-all duration-200"
              >
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span> Test MongoDB
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    console.log('📚 Testing Policy API...')
                    const response = await endpoints.getPolicies()
                    console.log('✅ Policy API test passed:', response.data.length, 'policies found')
                    alert(`✅ Policy API is working! Found ${response.data.length} policies.`)
                  } catch (error) {
                    console.error('❌ Policy API test failed:', error)
                    alert('❌ Policy API failed: ' + error.message)
                  }
                }}
                variant="outline" 
                className="bg-gradient-to-br from-green-800/80 to-green-700/60 border-2 border-green-500/60 text-green-300 hover:bg-green-700/50 hover:text-white hover:border-green-400 px-3 py-1.5 text-xs transition-all duration-200"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span> Test Policy API
              </Button>
              */}
            </div>
          </div>
        </div>
      </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4">
          <div className="container mx-auto max-w-6xl">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white'
                      : 'bg-gray-800/80 text-gray-100 border border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'bot' && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-base font-bold text-white mb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-sm font-bold text-white mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="text-sm text-gray-200 mb-2 leading-relaxed" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside text-sm text-gray-200 mb-2 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside text-sm text-gray-200 mb-2 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="text-sm text-gray-200" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                            em: ({node, ...props}) => <em className="italic text-gray-300" {...props} />,
                            code: ({node, ...props}) => <code className="bg-gray-700 text-green-400 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-3 text-sm text-gray-300 italic mb-2" {...props} />,
                            hr: ({node, ...props}) => <hr className="border-gray-600 my-3" {...props} />
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-800/80 text-gray-100 border border-gray-700/50 rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scope Toggle */}
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="p-3 border-t border-gray-800 bg-black">
            <div className="text-center mb-3">
              <h2 className="text-lg font-bold text-white mb-2 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">Chat Scope</h2>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => setSelectedScope('onboarding')}
                  variant={selectedScope === 'onboarding' ? 'default' : 'outline'}
                  size="sm"
                  className={selectedScope === 'onboarding' 
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg border-0 px-4 py-2 text-sm font-semibold transition-all duration-300' 
                    : 'bg-gradient-to-br from-gray-800/80 to-gray-700/60 border-2 border-brand-500/60 text-brand-400 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-400 px-4 py-2 text-sm font-medium transition-all duration-300'
                  }
                >
                   Onboarding
                </Button>
                <Button
                  onClick={() => setSelectedScope('employee')}
                  variant={selectedScope === 'employee' ? 'default' : 'outline'}
                  size="sm"
                  className={selectedScope === 'employee' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg border-0 px-4 py-2 text-sm font-semibold transition-all duration-300' 
                    : 'bg-gradient-to-br from-gray-800/80 to-gray-700/60 border-2 border-green-500/60 text-green-400 hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 px-4 py-2 text-sm font-medium transition-all duration-300'
                  }
                >
                   Helpdesk
                </Button>
              </div>
              <p className="text-gray-300 text-xs mt-2">
                {selectedScope === 'onboarding' 
                  ? 'Get help with onboarding policies and procedures'
                  : 'Get assistance with day-to-day HR questions and support'
                }
              </p>
              {/* <p className="text-gray-400 text-xs mt-1">
                Debug: Current scope = "{selectedScope}" | Messages: {messages.length}
              </p> */}
            </div>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="p-3 border-t border-gray-800 bg-black">
            <div className="text-center mb-3">
              <h2 className="text-lg font-bold text-white mb-1 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">Quick Suggestions</h2>
              <p className="text-gray-300 text-xs">
                {selectedScope === 'onboarding' 
                  ? 'Click any suggestion to quickly ask common onboarding questions'
                  : 'Click any suggestion to quickly ask common HR support questions'
                }
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mb-3 justify-center">
              {currentPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  onClick={() => handlePromptClick(prompt.text, prompt.mode)}
                  variant="outline"
                  size="sm"
                  className={`bg-gradient-to-br from-gray-800/80 to-gray-700/60 border-2 text-white px-3 py-2 text-xs font-medium transition-all duration-300 hover:shadow-lg backdrop-blur-sm min-w-[160px] rounded-lg shadow-md ${prompt.borderColor} hover:${prompt.hoverBorder} hover:${prompt.hoverBg}`}
                >
                  <prompt.icon className={`h-3 w-3 mr-1 ${prompt.color}`} />
                  {prompt.text}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="p-3 border-t border-gray-800 bg-black">
            {isInitializing ? (
              <div className="flex items-center justify-center gap-2 py-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-400"></div>
                <span className="text-gray-400 text-sm">Initializing chat session...</span>
              </div>
            ) : (
              <>
                {/* Mode Selection - Only show for onboarding scope */}
                {selectedScope === 'onboarding' && (
                  <div className="mb-3 p-3 bg-gray-900 rounded-xl border border-gray-700/50 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-white font-bold text-sm">Chat Mode:</span>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedMode('global')}
                          variant={selectedMode === 'global' ? 'default' : 'outline'}
                          size="sm"
                          className={selectedMode === 'global' 
                            ? 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg border-0 px-4 py-1.5 text-xs font-semibold transition-all duration-300' 
                            : 'bg-gradient-to-br from-gray-800/80 to-gray-700/60 border-2 border-brand-500/60 text-brand-400 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-400 px-4 py-1.5 text-xs font-medium transition-all duration-300'
                          }
                        >
                           Global Mode
                        </Button>
                        <Button
                          onClick={() => setSelectedMode('guided')}
                          variant={selectedMode === 'guided' ? 'default' : 'outline'}
                          size="sm"
                          className={selectedMode === 'guided' 
                            ? 'bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white shadow-lg border-0 px-4 py-1.5 text-xs font-semibold transition-all duration-300' 
                            : 'bg-gradient-to-br from-gray-800/80 to-gray-700/60 border-2 border-brand-400/60 text-brand-400 hover:bg-brand-400/20 hover:text-brand-300 hover:border-brand-400 px-4 py-1.5 text-xs font-medium transition-all duration-300'
                          }
                        >
                           Guided Mode
                        </Button>
                      </div>
                    </div>
                    
                    {selectedMode === 'guided' && (
                      <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg border border-gray-600/50 shadow-md">
                        <span className="text-white text-xs font-semibold">Policy Section:</span>
                        <select
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                          className="bg-gray-800/80 border-2 border-gray-600 text-white rounded-md px-2 py-1 text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-all duration-200 font-medium"
                        >
                          <option value="">Select a policy section...</option>
                          {availableSections.map((section) => (
                            <option key={section.section_id} value={section.section_id}>
                              Step {section.order}: {section.title}
                            </option>
                          ))}
                        </select>
                        {selectedSection && (
                          <span className="text-brand-400 text-xs font-semibold flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse shadow-md"></div>
                            {availableSections.find(s => s.section_id === selectedSection)?.title}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-2 p-2 bg-gray-800 rounded-lg border border-gray-600/40 shadow-md">
                      <p className="text-xs text-gray-200 font-medium">
                        {selectedMode === 'global' 
                          ? 'Global Mode: AI will search through all 17 policy sections to answer your question with comprehensive coverage'
                          : 'Guided Mode: AI will focus on the selected policy section for more specific and targeted answers'
                        }
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Chat Input Field */}
                <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl border border-gray-700/50 shadow-lg">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder={
                        selectedScope === 'onboarding' 
                          ? (selectedMode === 'global' 
                              ? "Ask about any HR policy (AI searches all sections)..."
                              : "Ask about the selected policy section...")
                          : "Ask about insurance, payroll, holidays, IT, reimbursements, or any HR support question..."
                      }
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="w-full bg-gray-800/80 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 text-sm py-2 px-3 rounded-lg transition-all duration-300 shadow-inner font-medium text-left"
                      disabled={isInitializing}
                    />
                    {isTyping && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce shadow-md"></div>
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce shadow-md" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce shadow-md" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSendMessage()
                    }}
                    disabled={
                      !inputMessage.trim() || 
                      isTyping || 
                      isInitializing || 
                      (selectedScope === 'onboarding' && selectedMode === 'guided' && !selectedSection)
                    }
                    className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-6 py-2 text-sm font-bold disabled:opacity-50 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/25 disabled:hover:scale-100 flex items-center gap-2 shadow-md"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
   )
}
