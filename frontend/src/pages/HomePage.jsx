import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Bot,
  User,
  Building,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Lightbulb,
  Brain,
  Hand,
  FileText,
  Mic,
  Send,
  ChevronRight
} from 'lucide-react'

export const HomePage = () => {
  const [currentChat, setCurrentChat] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [animatedText, setAnimatedText] = useState('')
  const [showCaret, setShowCaret] = useState(true)
  const navigate = useNavigate()

  // Animated placeholder phrases
  const phrases = [
    "Ask me anything about HR and onboarding...",
    "Try: \"What are our leave policies?\"",
    "Try: \"Add a new employee joining today.\"",
    "Try: \"Show me onboarding status for August.\""
  ]

  // Speed controls
  const TYPE_MS = 90;        // typing speed per char
  const BACKSPACE_MS = 45;   // backspace speed per char
  const END_PAUSE_MS = 1200; // pause at end of a phrase
  const START_PAUSE_MS = 600;// pause before starting next phrase

  // Refactored animation logic - single loop implementation
  useEffect(() => {
    let timeoutId;

    // Stable refs for the loop
    const phrasesRef = { current: phrases };
    const idxRef = { current: 0 };
    const forwardRef = { current: true };  // typing forward vs backspacing
    const textRef = { current: "" };

    const schedule = (fn, ms) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(fn, ms);
    };

    const step = () => {
      // Pause the animation when user starts typing
      if (currentChat && currentChat.trim().length > 0) {
        if (timeoutId) clearTimeout(timeoutId);
        return;
      }

      const phrase = phrasesRef.current[idxRef.current];

      if (forwardRef.current) {
        // Typing forward
        if (textRef.current.length < phrase.length) {
          const next = phrase.slice(0, textRef.current.length + 1);
          textRef.current = next;
          setAnimatedText(next);
          schedule(step, TYPE_MS);
        } else {
          // End reached: pause, then backspace
          forwardRef.current = false;
          schedule(step, END_PAUSE_MS);
        }
      } else {
        // Backspacing
        if (textRef.current.length > 0) {
          const next = textRef.current.slice(0, -1);
          textRef.current = next;
          setAnimatedText(next);
          schedule(step, BACKSPACE_MS);
        } else {
          // Next phrase
          idxRef.current = (idxRef.current + 1) % phrasesRef.current.length;
          forwardRef.current = true;
          schedule(step, START_PAUSE_MS);
        }
      }
    };

    // Start once
    step();

    // Cleanup single timer on unmount or dependency change
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    // Re-run only when user switches between typing and not typing.
    // This prevents per-character re-initialization and stacked timers.
  }, [!!currentChat]);

  // Blinking caret effect
  useEffect(() => {
    if (currentChat.length > 0) {
      setShowCaret(false)
      return
    }
    
    const interval = setInterval(() => {
      setShowCaret(prev => !prev)
    }, 600)
    
    return () => clearInterval(interval)
  }, [currentChat])

  const handleNewChat = () => {
    setCurrentChat('')
  }

  const handleClearChat = () => {
    setCurrentChat('')
  }

  const handleFeatureClick = (path) => {
    navigate(path)
  }

  const handleSendMessage = () => {
    if (currentChat.trim()) {
      // Navigate to chat page with the message
      navigate('/chat', { state: { initialMessage: currentChat } })
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <div className="flex-1 bg-black main-content">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
      
             {/* Main Content */}
       <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
         <div className="pt-4 lg:pt-4">
           {/* Main Heading - Above Avatar */}
           <div className="mb-12 lg:mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 bg-clip-text text-transparent text-center">
            Your AI HR Navigator
            </h1>
          </div>

                     {/* AI Avatar - Centered and Prominent */}
           <div className="flex justify-center mb-16 lg:mb-20">
            <div 
              className="relative cursor-pointer transition-all duration-500 group"
              onClick={() => handleFeatureClick('/chat')}
            >
              {/* Main Avatar with Enhanced Effects */}
              <div className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 rounded-full flex items-center justify-center shadow-2xl shadow-brand-500/40 group-hover:shadow-brand-500/60 group-hover:shadow-2xl">
                <Bot className="h-12 w-12 md:h-16 md:w-16 lg:h-18 lg:w-18 text-white" />
              </div>
             
              {/* Enhanced Glow Effect */}
              <div className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 rounded-full blur-2xl opacity-40 animate-pulse group-hover:opacity-60 group-hover:blur-3xl transition-all duration-500"></div>
             
              {/* Floating Particles Effect */}
              <div className="absolute -top-2 -left-2 w-3 h-3 md:w-4 md:h-4 bg-yellow-400 rounded-full animate-bounce opacity-80 group-hover:opacity-100"></div>
              <div className="absolute -top-3 -right-2 w-2.5 h-2.5 md:w-3 md:h-3 bg-pink-400 rounded-full animate-bounce opacity-80 group-hover:opacity-100" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute -bottom-2 -left-3 w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-400 rounded-full animate-bounce opacity-80 group-hover:opacity-100" style={{ animationDelay: '1s' }}></div>
              <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-400 rounded-full animate-bounce opacity-80 group-hover:opacity-100" style={{ animationDelay: '1.5s' }}></div>
             
              {/* Enhanced Chat Indicator */}
              <div className="absolute -bottom-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-brand-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                <MessageCircle className="h-3 w-3 md:h-4 md:w-4 text-white" />
              </div>
             
              {/* Enhanced Click Hint - Fixed positioning to prevent overlap */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-sm md:text-base text-brand-400 opacity-100 transition-all duration-300 whitespace-nowrap font-medium z-10">
                ✨ Click to start chatting! ✨
              </div>
             
              {/* Pulse Ring Effect */}
              <div className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 border-2 border-brand-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
            </div>
          </div>

                     {/* Chat Input Area - Centered */}
           <div className="max-w-3xl mx-auto w-full mt-16 mb-16">
            <div className="relative group">
              {/* Modern Floating Input Container */}
              <div className="relative bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-1.5 shadow-lg shadow-black/20 group-hover:border-brand-500/30 group-hover:shadow-brand-500/10 transition-all duration-300 focus-within:ring-1 focus-within:ring-brand-500/40 focus-within:shadow-brand-500/20 focus-within:border-brand-500/50">
                {/* Input Field */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder=""
                      value={currentChat}
                      onChange={(e) => setCurrentChat(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:outline-none focus:ring-0 text-sm md:text-base pr-3 pl-3 py-2.5 min-h-[40px] md:min-h-[44px] relative z-10 text-left"
                    />
                   
                                         {/* Animated Placeholder with Blinking Caret */}
                     <div 
                       className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0 flex items-center"
                       aria-live="polite"
                     >
                       <span className={`text-sm md:text-base transition-all duration-300 ${currentChat ? 'text-transparent' : 'text-gray-400'}`}>
                         {animatedText}
                         <span 
                           className={`inline-block w-0.5 h-5 bg-brand-400 ml-0.5 transition-opacity duration-200 ${currentChat ? 'opacity-0' : 'opacity-100'}`}
                           style={{ animation: currentChat ? 'none' : 'blink 1.2s infinite' }}
                         />
                       </span>
                     </div>
                  </div>
                  
                                     {/* Send Button */}
                   <Button
                     onClick={handleSendMessage}
                     disabled={!currentChat.trim()}
                     className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-4 py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/25 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 shadow-md"
                   >
                     <Send className="h-4 w-4" />
                     Send
                   </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* AI Chat Card */}
            <Card className="h-56 lg:h-60 bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-gray-700/50 hover:border-brand-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10 group cursor-pointer rounded-2xl" onClick={() => handleFeatureClick('/chat')}>
              <CardHeader className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white group-hover:text-brand-400 transition-colors duration-300 tracking-tight">AI Chat</CardTitle>
                <CardDescription className="text-gray-400 leading-relaxed">Get instant answers to your HR questions</CardDescription>
              </CardHeader>
            </Card>

            {/* Employee Onboarding Card */}
            <Card className="h-56 lg:h-60 bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-gray-700/50 hover:border-brand-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10 group cursor-pointer rounded-2xl" onClick={() => handleFeatureClick('/onboarding')}>
              <CardHeader className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <User className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors duration-300 tracking-tight">Employee Onboarding</CardTitle>
                <CardDescription className="text-gray-400 leading-relaxed">Complete your onboarding process</CardDescription>
              </CardHeader>
            </Card>

            {/* Company Policies Card */}
            <Card className="h-56 lg:h-60 bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-gray-700/50 hover:border-brand-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10 group cursor-pointer rounded-2xl" onClick={() => handleFeatureClick('/policies')}>
              <CardHeader className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors duration-300 tracking-tight">Company Policies</CardTitle>
                <CardDescription className="text-gray-400 leading-relaxed">Access and review company policies</CardDescription>
              </CardHeader>
            </Card>

            {/* Analytics Card */}
            {/* <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-gray-700/50 hover:border-brand-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10 group cursor-pointer" onClick={() => handleFeatureClick('/analytics')}>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors duration-300">Analytics</CardTitle>
                <CardDescription className="text-gray-400">View onboarding metrics and insights</CardDescription>
              </CardHeader>
            </Card> */}

            {/* Settings Card */}
            {/* <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 border border-gray-700/50 hover:border-brand-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10 group cursor-pointer" onClick={() => handleFeatureClick('/settings')}>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors duration-300">Settings</CardTitle>
                <CardDescription className="text-gray-400">Customize your experience</CardDescription>
              </CardHeader>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  )
}
