import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export default function Layout() {
  const { user, logout, loading } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [activeSection, setActiveSection] = useState('home')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Navigation data structure
  const navigation = {
    home: {
      label: 'Home',
      items: [
        { label: 'Home', path: '/' },
        { label: 'Goals', path: '/goals' },
        { label: 'Check-in', path: '/weight-logs' },
        { label: 'Profile', path: '/profile' }
      ]
    },
    food: {
      label: 'Food',
      items: [
        { label: 'Food Diary', path: '/food-diary' },
        { label: 'Database', path: '/food-database' },
        { label: 'My Foods', path: '/my-foods' }
      ]
    },
    exercise: {
      label: 'Exercise',
      items: [
        { label: 'Exercise Diary', path: '/exercise-diary' },
        { label: 'Database', path: '/exercise-database' },
        { label: 'My Exercise', path: '/my-exercise' },
        { label: 'Settings', path: '/exercise-settings' }
      ]
    },
    reports: {
      label: 'Reports',
      items: [
        { label: 'Chart', path: '/reports/chart' },
        { label: 'Export Data', path: '/reports/export' },
        { label: 'Weekly Digest', path: '/reports/digest' },
        { label: 'Printable Diary', path: '/reports/printable' }
      ]
    }
  }

  // Determine active section based on current path
  useEffect(() => {
    const path = location.pathname
    if (path === '/' || path.startsWith('/goals') || path.startsWith('/weight-logs') || path.startsWith('/profile')) {
      setActiveSection('home')
    } else if (path.startsWith('/food')) {
      setActiveSection('food')
    } else if (path.startsWith('/exercise')) {
      setActiveSection('exercise')
    } else if (path.startsWith('/reports')) {
      setActiveSection('reports')
    }
  }, [location.pathname])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* First level navigation */}
          <div className="flex justify-between items-center h-12 border-b">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-green-600">
                MyFitnessPal
              </Link>
            </div>
            <nav className="flex space-x-8">
              {Object.entries(navigation).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeSection === key
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.first_name || user?.username || 'User'}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Second level navigation */}
          <div className="flex items-center h-12">
            <nav className="flex space-x-6">
              {navigation[activeSection].items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-green-600 text-white'
                      : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}