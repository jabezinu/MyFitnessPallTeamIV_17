import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    height_cm: '',
    activity_level: 'moderate',
    timezone: 'UTC'
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile()
      const profileData = response.data.data
      setProfile(profileData)
      setFormData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        height_cm: profileData.height_cm || '',
        activity_level: profileData.activity_level || 'moderate',
        timezone: profileData.timezone || 'UTC'
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'height_cm' ? parseInt(value) || '' : value
    })
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    try {
      await userAPI.updateProfile(formData)
      setEditing(false)
      fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return null
    const heightM = height / 100
    return (weight / (heightM * heightM)).toFixed(1)
  }

  const getBMICategory = (bmi) => {
    if (!bmi) return ''
    if (bmi < 18.5) return 'Underweight'
    if (bmi < 25) return 'Normal weight'
    if (bmi < 30) return 'Overweight'
    return 'Obese'
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        {editing ? (
          <form onSubmit={updateProfile} className="space-y-6">
            <h3 className="text-lg font-semibold">Edit Profile</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                <input
                  type="number"
                  name="height_cm"
                  value={formData.height_cm}
                  onChange={handleInputChange}
                  min="100"
                  max="250"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Activity Level</label>
                <select
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly active</option>
                  <option value="moderate">Moderately active</option>
                  <option value="active">Very active</option>
                  <option value="extra">Extra active</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setFormData({
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || '',
                    height_cm: profile.height_cm || '',
                    activity_level: profile.activity_level || 'moderate',
                    timezone: profile.timezone || 'UTC'
                  })
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{profile.first_name} {profile.last_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{profile.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Height</div>
                  <div className="font-medium">{profile.height_cm ? `${profile.height_cm} cm` : 'Not set'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Activity Level</div>
                  <div className="font-medium capitalize">{profile.activity_level || 'Not set'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500">Timezone</div>
                  <div className="font-medium">{profile.timezone || 'UTC'}</div>
                </div>
              </div>
            </div>

            {profile.height_cm && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Health Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-500">BMI</div>
                    <div className="text-2xl font-bold">
                      {calculateBMI(profile.height_cm, profile.current_weight_kg) || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getBMICategory(calculateBMI(profile.height_cm, profile.current_weight_kg))}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-500">Current Weight</div>
                    <div className="text-2xl font-bold">
                      {profile.current_weight_kg ? `${profile.current_weight_kg} kg` : 'Not set'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-500">Member Since</div>
                    <div className="text-lg font-bold">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}