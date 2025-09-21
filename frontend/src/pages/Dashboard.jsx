import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchSummary()
  }, [date])

  const fetchSummary = async () => {
    try {
      const response = await userAPI.getDailySummary(date)
      setSummary(response.data.data)
    } catch (error) {
      console.error('Error fetching summary:', error)
      // Set empty summary on error so the UI still renders
      setSummary({
        consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        exercise_calories_burned: 0,
        net_calories: 0,
        goals: null,
        meals: {
          breakfast: { calories: 0, entries: 0 },
          lunch: { calories: 0, entries: 0 },
          dinner: { calories: 0, entries: 0 },
          snacks: { calories: 0, entries: 0 }
        },
        exercises: {
          total_duration: 0,
          total_calories: 0,
          entries: 0
        }
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Calories Consumed</h3>
            <p className="text-3xl font-bold text-green-600">{summary.consumed.calories}</p>
            <p className="text-sm text-gray-500">Goal: {summary.goals?.calories || 'Not set'}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Calories Burned</h3>
            <p className="text-3xl font-bold text-blue-600">{summary.exercise_calories_burned}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Net Calories</h3>
            <p className="text-3xl font-bold text-purple-600">{summary.net_calories}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Protein</h3>
            <p className="text-3xl font-bold text-orange-600">{summary.consumed.protein}g</p>
            <p className="text-sm text-gray-500">Goal: {summary.goals?.protein ? `${summary.goals.protein}g` : 'Not set'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Meals</h3>
          {summary?.meals && (
            <div className="space-y-2">
              {Object.entries(summary.meals).map(([meal, data]) => (
                <div key={meal} className="flex justify-between">
                  <span className="capitalize">{meal}</span>
                  <span>{data.calories} cal ({data.entries} entries)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Exercise</h3>
          {summary?.exercises && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Duration</span>
                <span>{summary.exercises.total_duration} min</span>
              </div>
              <div className="flex justify-between">
                <span>Calories Burned</span>
                <span>{summary.exercises.total_calories}</span>
              </div>
              <div className="flex justify-between">
                <span>Entries</span>
                <span>{summary.exercises.entries}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}