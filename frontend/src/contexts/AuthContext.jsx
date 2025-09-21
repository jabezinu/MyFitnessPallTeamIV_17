import { createContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // For now, set a placeholder user. In a real app, you'd validate the token
      // and fetch user data from the API
      setUser({ first_name: 'User', username: 'user' })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { token, user: userData } = response.data.data
      localStorage.setItem('token', token)
      setUser(userData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error?.message || 'Login failed' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      return { success: true, message: response.data.message }
    } catch (error) {
      return { success: false, error: error.response?.data?.error?.message || 'Registration failed' }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }