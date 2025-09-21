import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    goal_type: 'weight_loss',
    target_weight_kg: '',
    weekly_goal_kg: 0.5,
    daily_calorie_goal: 2000,
    daily_protein_goal: 150,
    target_date: ''
  })

  useEffect(() => {
    fetchGoals()
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
      [name]: name.includes('goal') || name.includes('weight') ? parseFloat(value) || value : value
    })
  }

  const createGoal = async (e) => {
    e.preventDefault()
    try {
      await userAPI.createGoal(formData)
      setShowForm(false)
      setFormData({
        goal_type: 'weight_loss',
        target_weight_kg: '',
        weekly_goal_kg: 0.5,
        daily_calorie_goal: 2000,
        daily_protein_goal: 150,
        target_date: ''
      })
      fetchGoals()
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const getGoalTypeLabel = (type) => {
    const labels = {
      weight_loss: 'Weight Loss',
      weight_gain: 'Weight Gain',
      maintain_weight: 'Maintain Weight'
    }
    return labels[type] || type
  }

  const calculateProgress = () => {
    // This would need current weight data to calculate actual progress
    // For now, return a placeholder
    return Math.floor(Math.random() * 100) // Placeholder
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Set New Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Set New Goal</h3>
          <form onSubmit={createGoal} className="space-y-4">
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
              </select>
            </div>

            {(formData.goal_type === 'weight_loss' || formData.goal_type === 'weight_gain') && (
              <>
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
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Daily Calorie Goal</label>
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
              <label className="block text-sm font-medium text-gray-700">Daily Protein Goal (g)</label>
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

            <div className="flex space-x-2">
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
      )}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-center">No goals set yet. Create your first goal!</p>
          </div>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{getGoalTypeLabel(goal.goal_type)}</h3>
                  <p className="text-gray-600">Target Date: {new Date(goal.target_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{calculateProgress(goal)}%</div>
                  <div className="text-sm text-gray-500">Progress</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {goal.target_weight_kg && (
                  <div>
                    <div className="text-sm text-gray-500">Target Weight</div>
                    <div className="font-semibold">{goal.target_weight_kg} kg</div>
                  </div>
                )}
                {goal.weekly_goal_kg && (
                  <div>
                    <div className="text-sm text-gray-500">Weekly Goal</div>
                    <div className="font-semibold">{goal.weekly_goal_kg} kg/week</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">Daily Calories</div>
                  <div className="font-semibold">{goal.daily_calorie_goal}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Daily Protein</div>
                  <div className="font-semibold">{goal.daily_protein_goal}g</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}