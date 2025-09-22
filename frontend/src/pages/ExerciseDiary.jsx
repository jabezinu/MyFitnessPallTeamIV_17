import { useState, useEffect } from 'react'
import { exerciseAPI } from '../services/api'

export default function ExerciseDiary() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [duration, setDuration] = useState(30)
  const [exerciseType, setExerciseType] = useState('cardio') // cardio or strength

  // For cardio
  const [distance, setDistance] = useState('')
  const [distanceUnit, setDistanceUnit] = useState('km')

  // For strength
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(12)
  const [weight, setWeight] = useState('')

  // For notes
  const [notes, setNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [originalNotes, setOriginalNotes] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchEntries()
    fetchDailyNotes()
  }, [date])

  const fetchEntries = async () => {
    try {
      const response = await exerciseAPI.getExerciseDiary(date)
      setEntries(response.data.data || [])
    } catch (error) {
      console.error('Error fetching exercise diary:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDailyNotes = async () => {
    try {
      const response = await exerciseAPI.getDailyNotes(date)
      setNotes(response.data.data || '')
      setOriginalNotes(response.data.data || '')
    } catch (error) {
      console.error('Error fetching daily notes:', error)
      setNotes('')
      setOriginalNotes('')
    }
  }

  const saveDailyNotes = async () => {
    try {
      await exerciseAPI.saveDailyNotes(date, notes)
      setOriginalNotes(notes)
      setEditingNotes(false)
      setMessage('Notes saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving daily notes:', error)
      setMessage('Error saving notes. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const searchExercises = async (query) => {
    if (query.length < 1) {
      setSearchResults([])
      return
    }
    try {
      console.log('Searching for:', query, 'in category:', exerciseType)
      const response = await exerciseAPI.searchExercises(query, exerciseType)
      console.log('Search response:', response.data)
      setSearchResults(response.data.data.results || [])
    } catch (error) {
      console.error('Error searching exercises:', error)
      setSearchResults([])
    }
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    searchExercises(query)
  }

  const selectExercise = (exercise) => {
    setSelectedExercise(exercise)
    setSearchQuery(exercise.name)
    setSearchResults([])
  }

  const addExerciseEntry = async () => {
    if (!selectedExercise) return

    try {
      let entry
      if (exerciseType === 'cardio') {
        entry = {
          exercise_id: selectedExercise.id,
          duration_minutes: duration,
          distance: parseFloat(distance) || null,
          distance_unit: distanceUnit,
          logged_date: date
        }
        console.log('Adding cardio entry:', entry)
        await exerciseAPI.addCardioEntry(entry)
      } else {
        entry = {
          exercise_id: selectedExercise.id,
          sets: sets,
          reps: reps,
          weight_used: parseFloat(weight) || null,
          logged_date: date
        }
        console.log('Adding strength entry:', entry)
        await exerciseAPI.addStrengthEntry(entry)
      }

      console.log('Entry added successfully')
      setShowAddForm(false)
      setSelectedExercise(null)
      setSearchQuery('')
      resetForm()
      fetchEntries()
    } catch (error) {
      console.error('Error adding exercise entry:', error)
      console.error('Error details:', error.response?.data)
    }
  }

  const resetForm = () => {
    setDuration(30)
    setDistance('')
    setSets(3)
    setReps(12)
    setWeight('')
  }

  const deleteEntry = async (entryId) => {
    try {
      await exerciseAPI.deleteExerciseEntry(entryId)
      fetchEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  // Separate entries by type
  const cardioEntries = entries.filter(entry => entry.exercise.category === 'cardio')
  const strengthEntries = entries.filter(entry => entry.exercise.category === 'strength')

  // Calculate totals
  const totalCardioMinutes = cardioEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)
  const totalCardioCalories = cardioEntries.reduce((sum, entry) => sum + (entry.calories_burned || 0), 0)

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Exercise Diary</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Your Exercise Diary for: {formatDate(date)}
        </h2>
      </div>

      {/* Cardiovascular Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Cardiovascular</h2>
            <button
              onClick={() => {
                setShowAddForm(true)
                setExerciseType('cardio')
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Add Exercise Quick Tools
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exercise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Minutes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calories Burned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cardioEntries.map(entry => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.exercise.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.duration_minutes || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.calories_burned || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Daily Total / Goal
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {totalCardioMinutes} / 0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {totalCardioCalories} / 0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
              </tr>
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Weekly Total / Goal
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  0 / 0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  0 / 0
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Strength Training Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Strength Training</h2>
            <button
              onClick={() => {
                setShowAddForm(true)
                setExerciseType('strength')
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Add Exercise Quick Tools
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exercise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reps/Set
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight/Set
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {strengthEntries.map(entry => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.exercise.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.sets || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.reps || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.weight_used || 0}kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exercise Notes Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Today's Exercise Notes</h2>
            <div className="flex space-x-2">
              {editingNotes && (
                <button
                  onClick={saveDailyNotes}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                >
                  Save
                </button>
              )}
              <button
                onClick={() => {
                  if (editingNotes) {
                    setNotes(originalNotes)
                    setEditingNotes(false)
                  } else {
                    setEditingNotes(true)
                  }
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
              >
                {editingNotes ? 'Cancel' : 'Edit Note'}
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          {editingNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your exercise notes here..."
              className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <p className="text-gray-700">
              {notes || 'No notes for today. Click "Edit Note" to add some.'}
            </p>
          )}
          {message && (
            <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Add Exercise Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Exercise Entry</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Search Exercise</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search for exercise..."
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button
                      onClick={() => searchExercises(searchQuery)}
                      disabled={!searchQuery.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Search
                    </button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                      {searchResults.map(exercise => (
                        <div
                          key={exercise.id}
                          onClick={() => selectExercise(exercise)}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-sm text-gray-600">{exercise.category}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchQuery && searchResults.length === 0 && (
                    <p className="mt-2 text-sm text-gray-500">No exercises found. Try a different search term.</p>
                  )}
                </div>

                {selectedExercise && (
                  <>
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Selected: {selectedExercise.name}</h4>
                      {exerciseType === 'cardio' ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                            <input
                              type="number"
                              value={duration}
                              onChange={(e) => setDuration(parseInt(e.target.value))}
                              min="1"
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Distance</label>
                              <input
                                type="number"
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                                step="0.1"
                                min="0"
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Unit</label>
                              <select
                                value={distanceUnit}
                                onChange={(e) => setDistanceUnit(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              >
                                <option value="km">Kilometers</option>
                                <option value="miles">Miles</option>
                              </select>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Sets</label>
                              <input
                                type="number"
                                value={sets}
                                onChange={(e) => setSets(parseInt(e.target.value))}
                                min="1"
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Reps</label>
                              <input
                                type="number"
                                value={reps}
                                onChange={(e) => setReps(parseInt(e.target.value))}
                                min="1"
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                              <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                step="0.5"
                                min="0"
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-4 border-t">
                      <button
                        onClick={addExerciseEntry}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Add Entry
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false)
                          setSelectedExercise(null)
                          setSearchQuery('')
                          resetForm()
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {!selectedExercise && (
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={() => {
                        setShowAddForm(false)
                        setSelectedExercise(null)
                        setSearchQuery('')
                        resetForm()
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}