import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'

export default function WeightLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [period, setPeriod] = useState(30)
  const [formData, setFormData] = useState({
    weight_kg: '',
    logged_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    fetchWeightLogs()
  }, [period])

  const fetchWeightLogs = async () => {
    try {
      const response = await userAPI.getWeightLogs(period)
      setLogs(response.data.data || [])
    } catch (error) {
      console.error('Error fetching weight logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'weight_kg' ? parseFloat(value) || '' : value
    })
  }

  const addWeightLog = async (e) => {
    e.preventDefault()
    try {
      await userAPI.addWeightLog(formData)
      setShowForm(false)
      setFormData({
        weight_kg: '',
        logged_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      fetchWeightLogs()
    } catch (error) {
      console.error('Error adding weight log:', error)
    }
  }

  const calculateWeightChange = (currentWeight, previousWeight) => {
    if (!previousWeight) return null
    return currentWeight - previousWeight
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Weight Tracking</h1>
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Weight
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Add Weight Entry</h3>
          <form onSubmit={addWeightLog} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleInputChange}
                step="0.1"
                min="30"
                max="300"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="logged_date"
                value={formData.logged_date}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Any notes about this measurement..."
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add Entry
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

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Weight History</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500">No weight entries found. Add your first weight measurement!</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => {
              const previousLog = logs[index + 1]
              const weightChange = calculateWeightChange(log.weight_kg, previousLog?.weight_kg)

              return (
                <div key={log.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{log.weight_kg} kg</div>
                    <div className="text-sm text-gray-600">
                      {new Date(log.logged_date).toLocaleDateString()}
                      {log.notes && ` - ${log.notes}`}
                    </div>
                  </div>
                  <div className="text-right">
                    {weightChange !== null && (
                      <div className={`font-semibold ${weightChange > 0 ? 'text-red-600' : weightChange < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {logs.length > 1 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Weight Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Current Weight</div>
              <div className="text-2xl font-bold">{logs[0]?.weight_kg} kg</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Starting Weight</div>
              <div className="text-2xl font-bold">{logs[logs.length - 1]?.weight_kg} kg</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Change</div>
              <div className={`text-2xl font-bold ${logs[0]?.weight_kg - logs[logs.length - 1]?.weight_kg > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {(logs[0]?.weight_kg - logs[logs.length - 1]?.weight_kg).toFixed(1)} kg
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Average Weight</div>
              <div className="text-2xl font-bold">
                {(logs.reduce((sum, log) => sum + log.weight_kg, 0) / logs.length).toFixed(1)} kg
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}