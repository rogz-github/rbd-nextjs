'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
// import { Eye, EyeOff, Mail, Lock, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignIn() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userName, setUserName] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router])

  // Custom validation functions
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    // Username or Email validation
    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Please enter your username or email address'
    } else if (formData.usernameOrEmail.trim().length < 3) {
      newErrors.usernameOrEmail = 'Username or email must be at least 3 characters long'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Please enter your password'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Clear specific field error when user starts typing
  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  // Handle input changes and clear errors
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    clearFieldError(field)
  }

  // Clear all errors when form is focused
  const handleFormFocus = () => {
    if (Object.keys(errors).length > 0) {
      setErrors({})
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please check the highlighted fields and try again')
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting login with:', formData.usernameOrEmail)
      
      const result = await signIn('credentials', {
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
        rememberMe: rememberMe,
        redirect: false,
      })

      console.log('Login result:', result)

      if (result?.error) {
        console.log('Login error:', result.error)
        // Set specific error for invalid credentials
        setErrors({
          usernameOrEmail: 'The username/email or password you entered is incorrect',
          password: 'The username/email or password you entered is incorrect'
        })
        toast.error('Login failed. Please check your credentials and try again.')
      } else if (result?.ok) {
        console.log('Login successful, getting session...')
        // Get user session to display welcome message
        const session = await getSession()
        console.log('Session after login:', session)
        
        const name = session?.user?.name || 'User'
        setUserName(name)
        setIsSuccess(true)
        
        // Show success toast with user's name
        toast.success(`Welcome back, ${name}!`, {
          duration: 3000,
          icon: '🎉',
        })
        
        // Wait for success animation, then redirect
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 2000)
      } else {
        console.log('Unexpected result:', result)
        toast.error('Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Something went wrong. Please try again in a moment.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show success animation if login was successful
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-green-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="mb-6">
              <Link href="/" className="inline-block hover:opacity-80 transition-opacity duration-200 mb-4">
                <Image
                  src="/images/logo/ready-logo.webp"
                  alt="RBD Logo"
                  width={100}
                  height={50}
                  priority
                  className="object-contain mx-auto"
                  style={{ width: 'auto', height: 'auto' }}
                  quality={100}
                />
              </Link>
              <div className="animate-bounce">
                <div className="h-16 w-16 text-green-500 mx-auto drop-shadow-lg text-6xl">✅</div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userName}! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              You have successfully signed in to your account.
            </p>
            <div className="flex items-center justify-center bg-green-50 rounded-lg py-3 px-4">
              <div className="animate-spin text-green-600 mr-2">⏳</div>
              <span className="text-sm text-green-700 font-medium">Redirecting you to the homepage...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-6">
              <Link href="/" className="inline-block hover:opacity-80 transition-opacity duration-200">
                <Image
                  src="/images/logo/ready-logo.webp"
                  alt="RBD Logo"
                  width={160}
                  height={60}
                  priority
                  className="object-contain mx-auto"
                  style={{ width: 'auto', height: 'auto' }}
                  quality={100}
                />
              </Link>
            </div>
           
            <p className="text-gray-600 text-sm">
              Please sign-in to your account and start the adventure
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit} onFocus={handleFormFocus} noValidate>
            {/* Email/Username field */}
            <div className="space-y-2">
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">@</span>
                </div>
                <input
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  type="text"
                  autoComplete="username"
                  value={formData.usernameOrEmail}
                  onChange={(e) => handleInputChange('usernameOrEmail', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 ${
                    errors.usernameOrEmail 
                      ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  placeholder="Enter your email or username"
                />
              </div>
              {errors.usernameOrEmail && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.usernameOrEmail}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔒</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 ${
                    errors.password 
                      ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <span>🙈</span>
                  ) : (
                    <span>👁️</span>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember Me
                </label>
              </div>
              <Link 
                href="/auth/forgot-password" 
                className="text-sm font-medium text-pink-600 hover:text-pink-500 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 px-4 rounded-lg font-medium text-sm hover:from-pink-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin mr-2">⏳</div>
                  Signing in...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              New on our platform?{' '}
              <Link 
                href="/auth/signup" 
                className="font-medium text-pink-600 hover:text-pink-500 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative triangle */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-xl"></div>
        <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-tr from-pink-400/20 to-blue-600/20 rounded-full blur-lg"></div>
      </div>
    </div>
  )
}
