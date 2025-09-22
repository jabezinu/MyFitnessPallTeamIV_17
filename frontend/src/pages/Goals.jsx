import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'

const calculateNutritionGoals = (user) => {
  if (!user.date_of_birth || !user.gender || !user.height_cm || !user.current_weight_kg || !user.activity_level) {
    return null
  }

  const birthDate = new Date(user.date_of_birth)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear() - (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0)

  const weight = user.current_weight_kg
  const height = user.height_cm

  // BMR calculation using Mifflin-St Jeor formula
  let bmr
  if (user.gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  }

  const tdee = bmr * activityMultipliers[user.activity_level]

  // Determine goal type based on current vs goal weight
  let goalType = 'maintain_weight'
  let dailyCalories = Math.round(tdee)

  if (user.goal_weight_kg) {
    if (user.goal_weight_kg < user.current_weight_kg) {
      goalType = 'weight_loss'
      dailyCalories = Math.round(tdee - 500) // 500 calorie deficit for 1kg/week loss
    } else if (user.goal_weight_kg > user.current_weight_kg) {
      goalType = 'weight_gain'
      dailyCalories = Math.round(tdee + 500) // 500 calorie surplus for 1kg/week gain
    }
  }

  // Macronutrient calculations
  const proteinPerKg = user.gender === 'male' ? 1.6 : 1.4 // g/kg protein
  const dailyProtein = Math.round(weight * proteinPerKg)
  const proteinCalories = dailyProtein * 4

  // Fat: 20-30% of calories
  const fatPercentage = 0.25
  const dailyFat = Math.round((dailyCalories * fatPercentage) / 9)
  const fatCalories = dailyFat * 9

  // Carbs: remaining calories
  const carbCalories = dailyCalories - proteinCalories - fatCalories
  const dailyCarbs = Math.round(carbCalories / 4)

  // Exercise minutes based on activity level
  const exerciseMinutes = {
    sedentary: 30,
    lightly_active: 45,
    moderately_active: 60,
    very_active: 75,
    extra_active: 90
  }

  return {
    goal_type: goalType,
    target_weight_kg: user.goal_weight_kg || user.current_weight_kg,
    weekly_goal_kg: 0.5,
    daily_calorie_goal: dailyCalories,
    daily_protein_goal: dailyProtein,
    daily_carbs_goal: dailyCarbs,
    daily_fat_goal: dailyFat,
    daily_exercise_minutes: exerciseMinutes[user.activity_level],
    target_date: user.goal_weight_kg ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '' // 90 days default
  }
}

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showForm, setShowForm] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [formData, setFormData] = useState({
    goal_type: 'weight_loss',
    target_weight_kg: '',
    weekly_goal_kg: 0.5,
    daily_calorie_goal: 2000,
    daily_protein_goal: 150,
    daily_carbs_goal: 250,
    daily_fat_goal: 67,
    daily_exercise_minutes: 60,
    target_date: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalsResponse, profileResponse] = await Promise.all([
          userAPI.getGoals(),
          userAPI.getProfile()
        ])
        setGoals(goalsResponse.data.data || [])
        setUserProfile(profileResponse.data.data)

        // Pre-fill form with calculated values
        const calculatedGoals = calculateNutritionGoals(profileResponse.data.data)
        if (calculatedGoals) {
          setFormData(calculatedGoals)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await userAPI.getGoals()
      setGoals(response.data.data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name.includes('goal') || name.includes('weight') || name.includes('minutes') ? parseFloat(value) || value : value
    })
  }

  const createGoal = async (e) => {
    e.preventDefault()
    try {
      await userAPI.createGoal(formData)
      setShowForm(false)
      resetForm()
      fetchGoals()
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }


  const resetForm = () => {
    setFormData({
      goal_type: 'weight_loss',
      target_weight_kg: '',
      weekly_goal_kg: 0.5,
      daily_calorie_goal: 2000,
      daily_protein_goal: 150,
      daily_carbs_goal: 250,
      daily_fat_goal: 67,
      daily_exercise_minutes: 60,
      target_date: ''
    })
  }

  const getGoalTypeLabel = (type) => {
    const labels = {
      weight_loss: 'Weight Loss',
      weight_gain: 'Weight Gain',
      maintain_weight: 'Maintain Weight',
      muscle_gain: 'Muscle Gain'
    }
    return labels[type] || type
  }

  const calculateProgress = (goal) => {
    // Placeholder progress calculation
    // In a real app, this would calculate based on actual progress data
    return Math.floor(Math.random() * 100)
  }

  const getCurrentGoal = () => {
    return goals.find(goal => goal.is_active) || null
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'nutrition', label: 'Daily Nutrition', icon: '🥗' },
    { id: 'micronutrients', label: 'Micronutrients', icon: '💊' },
    { id: 'meals', label: 'Calories by Meal', icon: '🍽️' },
    { id: 'fitness', label: 'Fitness', icon: '💪' }
  ]

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  const currentGoal = getCurrentGoal()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Fitness Goals</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Set New Goal
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {currentGoal ? (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{getGoalTypeLabel(currentGoal.goal_type)}</h3>
                      <p className="text-gray-600">Target Date: {new Date(currentGoal.target_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">{calculateProgress(currentGoal)}%</div>
                      <div className="text-sm text-gray-500">Progress</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentGoal.target_weight_kg && (
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Target Weight</div>
                        <div className="text-xl font-bold">{currentGoal.target_weight_kg} kg</div>
                      </div>
                    )}
                    {currentGoal.weekly_goal_kg && (
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Weekly Goal</div>
                        <div className="text-xl font-bold">{currentGoal.weekly_goal_kg} kg/week</div>
                      </div>
                    )}
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Daily Calories</div>
                      <div className="text-xl font-bold">{currentGoal.daily_calorie_goal}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Daily Protein</div>
                      <div className="text-xl font-bold">{currentGoal.daily_protein_goal}g</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Goals</h3>
                  <p className="text-gray-600 mb-4">Set your fitness goals to start tracking your progress!</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-medium"
                  >
                    Set Your First Goal
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Daily Nutrition Tab */}
          {activeTab === 'nutrition' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Daily Nutrition Goals</h3>
              {currentGoal ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🔥</span>
                      <h4 className="font-semibold text-gray-900">Calories</h4>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{currentGoal.daily_calorie_goal}</div>
                    <div className="text-sm text-gray-600">per day</div>
                  </div>

                  <div className="bg-red-50 p-6 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🥩</span>
                      <h4 className="font-semibold text-gray-900">Protein</h4>
                    </div>
                    <div className="text-3xl font-bold text-red-600">{currentGoal.daily_protein_goal}g</div>
                    <div className="text-sm text-gray-600">per day</div>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🌾</span>
                      <h4 className="font-semibold text-gray-900">Carbs</h4>
                    </div>
                    <div className="text-3xl font-bold text-yellow-600">{currentGoal.daily_carbs_goal || 'N/A'}g</div>
                    <div className="text-sm text-gray-600">per day</div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🧈</span>
                      <h4 className="font-semibold text-gray-900">Fat</h4>
                    </div>
                    <div className="text-3xl font-bold text-purple-600">{currentGoal.daily_fat_goal || 'N/A'}g</div>
                    <div className="text-sm text-gray-600">per day</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Set a goal to view your daily nutrition targets
                </div>
              )}
            </div>
          )}

          {/* Micronutrients Tab */}
          {activeTab === 'micronutrients' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Micronutrients Goals</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Track essential vitamins and minerals to ensure optimal health and performance.
                </p>
                {userProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      const age = userProfile.date_of_birth ? new Date().getFullYear() - new Date(userProfile.date_of_birth).getFullYear() : 30
                      const isMale = userProfile.gender === 'male'

                      const micronutrients = [
                        { name: 'Vitamin A', rda: age >= 19 ? (isMale ? '900 mcg' : '700 mcg') : '600-900 mcg', icon: '🥕' },
                        { name: 'Vitamin C', rda: age >= 19 ? '90 mg' : '45-75 mg', icon: '🍊' },
                        { name: 'Vitamin D', rda: age >= 19 ? '15 mcg' : '15 mcg', icon: '☀️' },
                        { name: 'Calcium', rda: age >= 19 ? '1000 mg' : '1000-1200 mg', icon: '🥛' },
                        { name: 'Iron', rda: isMale ? '8 mg' : '18 mg', icon: '🥩' },
                        { name: 'Zinc', rda: isMale ? '11 mg' : '8 mg', icon: '🌰' },
                        { name: 'Vitamin B12', rda: '2.4 mcg', icon: '🧄' },
                        { name: 'Folate', rda: '400 mcg', icon: '🥬' }
                      ]

                      return micronutrients.map((nutrient) => (
                        <div key={nutrient.name} className="bg-white p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <span className="text-xl mr-2">{nutrient.icon}</span>
                            <h4 className="font-medium">{nutrient.name}</h4>
                          </div>
                          <div className="text-sm text-gray-600">RDA: {nutrient.rda}</div>
                          <div className="text-xs text-gray-500 mt-1">Track in your meals</div>
                        </div>
                      ))
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Complete your profile to see personalized micronutrient recommendations
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calories by Meal Tab */}
          {activeTab === 'meals' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Calories by Meal</h3>
              {currentGoal ? (
                <div className="space-y-4">
                  {[
                    { name: 'Breakfast', percentage: 25, icon: '🌅' },
                    { name: 'Lunch', percentage: 35, icon: '☀️' },
                    { name: 'Dinner', percentage: 30, icon: '🌙' },
                    { name: 'Snacks', percentage: 10, icon: '🍪' }
                  ].map((meal) => (
                    <div key={meal.name} className="bg-white p-6 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{meal.icon}</span>
                          <div>
                            <h4 className="font-semibold text-lg">{meal.name}</h4>
                            <p className="text-gray-600">{meal.percentage}% of daily calories</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round((currentGoal.daily_calorie_goal * meal.percentage) / 100)}
                          </div>
                          <div className="text-sm text-gray-500">calories</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Set a calorie goal to view meal distribution
                </div>
              )}
            </div>
          )}

          {/* Fitness Tab */}
          {activeTab === 'fitness' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Fitness Goals</h3>
              {currentGoal ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <span className="text-3xl mr-3">🏃‍♂️</span>
                      <div>
                        <h4 className="font-semibold text-lg">Exercise Time</h4>
                        <p className="text-gray-600">Daily exercise goal</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {currentGoal.daily_exercise_minutes || 60}
                    </div>
                    <div className="text-sm text-gray-600">minutes per day</div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <span className="text-3xl mr-3">💪</span>
                      <div>
                        <h4 className="font-semibold text-lg">Goal Type</h4>
                        <p className="text-gray-600">Current fitness focus</p>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      {getGoalTypeLabel(currentGoal.goal_type)}
                    </div>
                    <div className="text-sm text-gray-600">primary objective</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Set a fitness goal to view your exercise targets
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Goal Creation Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold mb-4">Set New Fitness Goal</h3>
              {userProfile && (
                <div className="bg-blue-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-blue-800">
                    💡 Values are pre-calculated based on your profile (age: {userProfile.date_of_birth ? new Date().getFullYear() - new Date(userProfile.date_of_birth).getFullYear() : 'N/A'}, gender: {userProfile.gender || 'N/A'}, height: {userProfile.height_cm || 'N/A'}cm, weight: {userProfile.current_weight_kg || 'N/A'}kg, activity: {userProfile.activity_level || 'N/A'}).
                    You can adjust them as needed.
                  </p>
                </div>
              )}
              <form onSubmit={createGoal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Goal Type</label>
                    <select
                      name="goal_type"
                      value={formData.goal_type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="weight_loss">Weight Loss</option>
                      <option value="weight_gain">Weight Gain</option>
                      <option value="maintain_weight">Maintain Weight</option>
                      <option value="muscle_gain">Muscle Gain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Date</label>
                    <input
                      type="date"
                      name="target_date"
                      value={formData.target_date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                {(formData.goal_type === 'weight_loss' || formData.goal_type === 'weight_gain') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Target Weight (kg)</label>
                      <input
                        type="number"
                        name="target_weight_kg"
                        value={formData.target_weight_kg}
                        onChange={handleInputChange}
                        step="0.1"
                        min="30"
                        max="300"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weekly Goal (kg)</label>
                      <input
                        type="number"
                        name="weekly_goal_kg"
                        value={formData.weekly_goal_kg}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0.1"
                        max="2"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Daily Calories</label>
                    <input
                      type="number"
                      name="daily_calorie_goal"
                      value={formData.daily_calorie_goal}
                      onChange={handleInputChange}
                      min="800"
                      max="5000"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Daily Protein (g)</label>
                    <input
                      type="number"
                      name="daily_protein_goal"
                      value={formData.daily_protein_goal}
                      onChange={handleInputChange}
                      min="50"
                      max="500"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Daily Carbs (g)</label>
                    <input
                      type="number"
                      name="daily_carbs_goal"
                      value={formData.daily_carbs_goal}
                      onChange={handleInputChange}
                      min="50"
                      max="800"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Daily Fat (g)</label>
                    <input
                      type="number"
                      name="daily_fat_goal"
                      value={formData.daily_fat_goal}
                      onChange={handleInputChange}
                      min="20"
                      max="200"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Daily Exercise (minutes)</label>
                  <input
                    type="number"
                    name="daily_exercise_minutes"
                    value={formData.daily_exercise_minutes}
                    onChange={handleInputChange}
                    min="0"
                    max="300"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Create Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}