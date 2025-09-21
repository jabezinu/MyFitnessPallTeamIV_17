import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export default function Layout() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-green-600">
                MyFitnessPal
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/food-diary" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Food Diary
              </Link>
              <Link to="/exercise-diary" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Exercise Diary
              </Link>
              <Link to="/goals" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Goals
              </Link>
              <Link to="/weight-logs" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Weight
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Profile
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.first_name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}