import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'

export default function WeightLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingLog, setEditingLog] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [formData, setFormData] = useState({
    weight_kg: '',
    neck_cm: '',
    waist_cm: '',
    hips_cm: '',
    logged_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    fetchWeightLogs()
  }, [])

  const fetchWeightLogs = async () => {
    try {
      const response = await userAPI.getWeightLogs(365) // Get last year
      const logsData = response.data.data || []
      // Sort by logged_date descending (most recent first)
      logsData.sort((a, b) => new Date(b.logged_date) - new Date(a.logged_date))
      setLogs(logsData)
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
      [name]: ['weight_kg', 'neck_cm', 'waist_cm', 'hips_cm'].includes(name)
        ? parseFloat(value) || ''
        : value
    })
  }

  const addWeightLog = async () => {
    if (!formData.weight_kg) return

    try {
      await userAPI.addWeightLog(formData)
      resetForm()
      fetchWeightLogs()
    } catch (error) {
      console.error('Error adding weight log:', error)
    }
  }

  const updateWeightLog = async (e) => {
    e.preventDefault()
    try {
      await userAPI.updateWeightLog(editingLog.id, formData)
      setEditingLog(null)
      resetForm()
      fetchWeightLogs()
    } catch (error) {
      console.error('Error updating weight log:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      weight_kg: '',
      neck_cm: '',
      waist_cm: '',
      hips_cm: '',
      logged_date: new Date().toISOString().split('T')[0],
      notes: ''
    })
  }

  const startEditing = (log) => {
    setEditingLog(log)
    setFormData({
      weight_kg: log.weight_kg || '',
      neck_cm: log.neck_cm || '',
      waist_cm: log.waist_cm || '',
      hips_cm: log.hips_cm || '',
      logged_date: log.logged_date,
      notes: log.notes || ''
    })
  }

  const cancelEditing = () => {
    setEditingLog(null)
    resetForm()
  }

  const getLastEntry = () => {
    return logs.length > 0 ? logs[0] : null
  }

  const getTodaysEntry = () => {
    const today = new Date().toISOString().split('T')[0]
    return logs.find(log => log.logged_date === today)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  const lastEntry = getLastEntry()
  const todaysEntry = getTodaysEntry()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Check-in</h1>
      </div>

      {/* Enter today's measurements */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Enter today's measurements:</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
              <input
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleInputChange}
                step="0.1"
                min="30"
                max="300"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g. 70.5"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Neck (cm)</label>
              <input
                type="number"
                name="neck_cm"
                value={formData.neck_cm}
                onChange={handleInputChange}
                step="0.1"
                min="20"
                max="100"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g. 38.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waist (cm)</label>
              <input
                type="number"
                name="waist_cm"
                value={formData.waist_cm}
                onChange={handleInputChange}
                step="0.1"
                min="40"
                max="200"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g. 85.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hips (cm)</label>
              <input
                type="number"
                name="hips_cm"
                value={formData.hips_cm}
                onChange={handleInputChange}
                step="0.1"
                min="50"
                max="200"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g. 95.0"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Any notes about today's measurements..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={addWeightLog}
              disabled={!formData.weight_kg}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Save Today's Check-in
            </button>
          </div>
        </div>

        {/* Other Measurements */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Other Measurements</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b font-medium"></th>
                  <th className="text-center p-2 border-b font-medium">Last Entry</th>
                  <th className="text-center p-2 border-b font-medium">Today's Entry</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b font-medium">Neck</td>
                  <td className="text-center p-2 border-b">{lastEntry?.neck_cm ? `${lastEntry.neck_cm} cm` : 'None'}</td>
                  <td className="text-center p-2 border-b">{todaysEntry?.neck_cm ? `${todaysEntry.neck_cm} cm` : 'None'}</td>
                </tr>
                <tr>
                  <td className="p-2 border-b font-medium">Waist</td>
                  <td className="text-center p-2 border-b">{lastEntry?.waist_cm ? `${lastEntry.waist_cm} cm` : 'None'}</td>
                  <td className="text-center p-2 border-b">{todaysEntry?.waist_cm ? `${todaysEntry.waist_cm} cm` : 'None'}</td>
                </tr>
                <tr>
                  <td className="p-2 border-b font-medium">Hips</td>
                  <td className="text-center p-2 border-b">{lastEntry?.hips_cm ? `${lastEntry.hips_cm} cm` : 'None'}</td>
                  <td className="text-center p-2 border-b">{todaysEntry?.hips_cm ? `${todaysEntry.hips_cm} cm` : 'None'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Previous Entries Button */}
        <div className="text-center">
          <button
            onClick={() => setShowEditForm(!showEditForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
          >
            Edit Previous Entries
          </button>
        </div>
      </div>

      {/* Measurement History */}
      {showEditForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Measurement History</h3>
          {logs.length === 0 ? (
            <p className="text-gray-500">No entries found. Add your first measurement!</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-lg">
                      {new Date(log.logged_date).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => startEditing(log)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Weight:</span>
                      <span className="ml-2 font-medium">{log.weight_kg} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Neck:</span>
                      <span className="ml-2 font-medium">{log.neck_cm ? `${log.neck_cm} cm` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Waist:</span>
                      <span className="ml-2 font-medium">{log.waist_cm ? `${log.waist_cm} cm` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hips:</span>
                      <span className="ml-2 font-medium">{log.hips_cm ? `${log.hips_cm} cm` : 'N/A'}</span>
                    </div>
                  </div>

                  {log.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {log.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Form Modal */}
      {editingLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold mb-4">Edit Measurement</h3>
              <form onSubmit={updateWeightLog} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700">Neck (cm)</label>
                    <input
                      type="number"
                      name="neck_cm"
                      value={formData.neck_cm}
                      onChange={handleInputChange}
                      step="0.1"
                      min="20"
                      max="100"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Waist (cm)</label>
                    <input
                      type="number"
                      name="waist_cm"
                      value={formData.waist_cm}
                      onChange={handleInputChange}
                      step="0.1"
                      min="40"
                      max="200"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hips (cm)</label>
                    <input
                      type="number"
                      name="hips_cm"
                      value={formData.hips_cm}
                      onChange={handleInputChange}
                      step="0.1"
                      min="50"
                      max="200"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      rows={2}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Any notes about this measurement..."
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Update Entry
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
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