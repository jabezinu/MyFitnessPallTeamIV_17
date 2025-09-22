import { useState, useEffect, useRef } from 'react'
import { userAPI } from '../services/api'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    height_cm: '',
    activity_level: 'moderate',
    timezone: 'UTC',
    about_me: '',
    fitness_motivation: ''
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
        date_of_birth: profileData.date_of_birth || '',
        gender: profileData.gender || '',
        height_cm: profileData.height_cm || '',
        activity_level: profileData.activity_level || 'moderate',
        timezone: profileData.timezone || 'UTC',
        about_me: profileData.about_me || '',
        fitness_motivation: profileData.fitness_motivation || ''
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('profile_image', file)
      await userAPI.uploadProfileImage(formData)
      fetchProfile()
    } catch (error) {
      console.error('Error uploading photo:', error)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
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

  const sections = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'about', label: 'About Me', icon: '📝' },
    { id: 'fitness', label: 'Fitness Journey', icon: '💪' }
  ]

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              {/* Profile Photo */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 overflow-hidden">
                    {profile.profile_image_url ? (
                      <img
                        src={`/storage/profile_images/${profile.profile_image_url}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'U'
                    )}
                  </div>
                  {!editing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
                    >
                      📷
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-gray-600">{profile.email}</p>
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Age</span>
                  <span className="font-medium">{calculateAge(profile.date_of_birth) || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Sex</span>
                  <span className="font-medium capitalize">{profile.gender || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Height</span>
                  <span className="font-medium">{profile.height_cm ? `${profile.height_cm} cm` : 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-medium text-sm">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-8 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {editing ? (
              /* Edit Mode */
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h3>
                <form onSubmit={updateProfile} className="space-y-8">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                        <input
                          type="number"
                          name="height_cm"
                          value={formData.height_cm}
                          onChange={handleInputChange}
                          min="100"
                          max="250"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                        <select
                          name="activity_level"
                          value={formData.activity_level}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="sedentary">Sedentary</option>
                          <option value="light">Lightly active</option>
                          <option value="moderate">Moderately active</option>
                          <option value="active">Very active</option>
                          <option value="extra">Extra active</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* About Me */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">About Me</h4>
                    <textarea
                      name="about_me"
                      value={formData.about_me}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Fitness Motivation */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Why I Want to Get in Shape</h4>
                    <textarea
                      name="fitness_motivation"
                      value={formData.fitness_motivation}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="What motivates you on your fitness journey?"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>


                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-6">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        fetchProfile()
                      }}
                      className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-8">
                {activeSection === 'overview' && (
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Overview</h3>

                    {/* Health Metrics */}
                    {profile.height_cm && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                          <div className="text-sm text-blue-600 font-medium mb-2">BMI</div>
                          <div className="text-3xl font-bold text-blue-900">
                            {calculateBMI(profile.height_cm, profile.current_weight_kg) || 'N/A'}
                          </div>
                          <div className="text-sm text-blue-700 mt-1">
                            {getBMICategory(calculateBMI(profile.height_cm, profile.current_weight_kg))}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                          <div className="text-sm text-green-600 font-medium mb-2">Current Weight</div>
                          <div className="text-3xl font-bold text-green-900">
                            {profile.current_weight_kg ? `${profile.current_weight_kg} kg` : 'Not set'}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                          <div className="text-sm text-purple-600 font-medium mb-2">Activity Level</div>
                          <div className="text-xl font-bold text-purple-900 capitalize">
                            {profile.activity_level || 'Not set'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recent Activity Placeholder */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                      <p className="text-gray-600">Your fitness journey summary will appear here.</p>
                    </div>
                  </div>
                )}

                {activeSection === 'about' && (
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">About Me</h3>
                    <div className="prose max-w-none">
                      {profile.about_me ? (
                        <p className="text-gray-700 text-lg leading-relaxed">{profile.about_me}</p>
                      ) : (
                        <p className="text-gray-500 italic">No information provided yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeSection === 'fitness' && (
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">My Fitness Journey</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Why I Want to Get in Shape</h4>
                        {profile.fitness_motivation ? (
                          <p className="text-gray-700 text-lg leading-relaxed">{profile.fitness_motivation}</p>
                        ) : (
                          <p className="text-gray-500 italic">No motivation shared yet.</p>
                        )}
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Current Goals</h4>
                        <p className="text-gray-700">Check out your goals section to see your current fitness objectives.</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}