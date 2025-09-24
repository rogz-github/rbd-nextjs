'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, CheckCircle, Loader2 } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="animate-bounce mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}!
          </h2>
          <p className="text-gray-600 mb-4">
            You have successfully signed in to your account.
          </p>
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
            <span className="text-sm text-gray-500">Redirecting you to the homepage...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} onFocus={handleFormFocus} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700">
                Username or Email
              </label>
              <div className="mt-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="usernameOrEmail"
                    name="usernameOrEmail"
                    type="text"
                    autoComplete="username"
                    value={formData.usernameOrEmail}
                    onChange={(e) => handleInputChange('usernameOrEmail', e.target.value)}
                    className={`input pl-10 transition-colors ${errors.usernameOrEmail ? 'border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white'}`}
                    placeholder="Enter your username or email"
                  />
                </div>
                <div className="h-5 mt-1">
                  {errors.usernameOrEmail && (
                    <p className="text-sm text-red-600 flex items-center">
                      <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">{errors.usernameOrEmail}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`input pl-10 pr-10 transition-colors ${errors.password ? 'border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white'}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="h-5 mt-1">
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center">
                      <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">{errors.password}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me for 1 year
              </label>
            </div>

            <div className="text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
