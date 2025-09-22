import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    username: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    height_cm: '',
    current_weight_kg: '',
    goal_weight_kg: '',
    activity_level: 'sedentary'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const result = await register(formData)
    setLoading(false)

    if (result.success) {
      setSuccess('Registration successful! Please check your email for verification.')
      setTimeout(() => navigate('/login'), 2000)
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MyFitnessPal</h1>
          <p className="text-gray-600">Join the #1 nutrition and calorie tracking app</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Confirm your password"
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="height_cm" className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  id="height_cm"
                  name="height_cm"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="170"
                  value={formData.height_cm}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="current_weight_kg" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Weight (kg)
                </label>
                <input
                  id="current_weight_kg"
                  name="current_weight_kg"
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="70.0"
                  value={formData.current_weight_kg}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="goal_weight_kg" className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Weight (kg)
                </label>
                <input
                  id="goal_weight_kg"
                  name="goal_weight_kg"
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="65.0"
                  value={formData.goal_weight_kg}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="activity_level" className="block text-sm font-medium text-gray-700 mb-1">
                Activity Level
              </label>
              <select
                id="activity_level"
                name="activity_level"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={formData.activity_level}
                onChange={handleChange}
              >
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="lightly_active">Lightly active (light exercise 1-3 days/week)</option>
                <option value="moderately_active">Moderately active (moderate exercise 3-5 days/week)</option>
                <option value="very_active">Very active (hard exercise 6-7 days/week)</option>
                <option value="extra_active">Extra active (very hard exercise & physical job)</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition duration-150 ease-in-out"
            >
              {loading ? 'Creating account...' : 'Get Started'}
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}