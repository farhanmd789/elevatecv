import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('resumeai_token')
    const savedUser = localStorage.getItem('resumeai_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('resumeai_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback((token, userData) => {
    localStorage.setItem('resumeai_token', token)
    localStorage.setItem('resumeai_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('resumeai_token')
    localStorage.removeItem('resumeai_user')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.getMe()
      const userData = res.data.data
      setUser(userData)
      localStorage.setItem('resumeai_user', JSON.stringify(userData))
    } catch {
      logout()
    }
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
