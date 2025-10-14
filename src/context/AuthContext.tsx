/**
 * Authentication Context for Staff Members
 * Manages login state, session persistence, and protected routes
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Staff {
  id: string
  username: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
}

interface AuthContextType {
  staff: Staff | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, pin: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = 'http://localhost:3000/api/staff'
const TOKEN_KEY = 'staff_auth_token'
const STAFF_KEY = 'staff_data'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staff, setStaff] = useState<Staff | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedStaff = localStorage.getItem(STAFF_KEY)

      if (storedToken && storedStaff) {
        try {
          // Verify token is still valid
          const response = await fetch(`${API_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          })

          if (response.ok) {
            await response.json() // Verify response is valid
            setToken(storedToken)
            setStaff(JSON.parse(storedStaff))
          } else {
            // Token expired or invalid, clear storage
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(STAFF_KEY)
          }
        } catch (error) {
          console.error('Failed to verify session:', error)
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(STAFF_KEY)
        }
      }

      setIsLoading(false)
    }

    loadSession()
  }, [])

  const login = async (username: string, pin: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, pin })
      })

      const data = await response.json()

      if (data.success) {
        setToken(data.token)
        setStaff(data.staff)
        
        // Persist session
        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(STAFF_KEY, JSON.stringify(data.staff))

        // Redirect to dashboard
        navigate('/manager')

        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    // Clear state
    setStaff(null)
    setToken(null)

    // Clear storage
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(STAFF_KEY)

    // Redirect to login
    navigate('/manager/login')
  }

  const checkAuth = async (): Promise<boolean> => {
    if (!token) return false

    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      return response.ok
    } catch {
      return false
    }
  }

  const value = {
    staff,
    token,
    isAuthenticated: !!staff && !!token,
    isLoading,
    login,
    logout,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
