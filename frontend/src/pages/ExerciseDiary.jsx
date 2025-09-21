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

  useEffect(() => {
    fetchEntries()
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

  const searchExercises = async (query) => {
    if (query.length < 2) return
    try {
      const response = await exerciseAPI.searchExercises(query)
      setSearchResults(response.data.data || [])
    } catch (error) {
      console.error('Error searching exercises:', error)
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
          distance: parseFloat(distance),
          distance_unit: distanceUnit,
          logged_date: date
        }
        await exerciseAPI.addCardioEntry(entry)
      } else {
        entry = {
          exercise_id: selectedExercise.id,
          sets: sets,
          reps: reps,
          weight_used: parseFloat(weight),
          logged_date: date
        }
        await exerciseAPI.addStrengthEntry(entry)
      }

      setShowAddForm(false)
      setSelectedExercise(null)
      setSearchQuery('')
      resetForm()
      fetchEntries()
    } catch (error) {
      console.error('Error adding exercise entry:', error)
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

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Exercise Diary</h1>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Exercise
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Add Exercise Entry</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search Exercise</label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for exercise..."
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
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
            </div>

            {selectedExercise && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Exercise Type</label>
                  <select
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength Training</option>
                  </select>
                </div>

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

                <div className="flex space-x-2">
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
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Today's Exercises</h3>
        {entries.length === 0 ? (
          <p className="text-gray-500">No exercise entries for today</p>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <div key={entry.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{entry.exercise.name}</span>
                  <div className="text-sm text-gray-600 mt-1">
                    {entry.duration_minutes ? `${entry.duration_minutes} minutes` : ''}
                    {entry.distance ? ` - ${entry.distance} ${entry.distance_unit}` : ''}
                    {entry.sets ? ` - ${entry.sets} sets × ${entry.reps} reps` : ''}
                    {entry.weight_used ? ` @ ${entry.weight_used}kg` : ''}
                    {entry.calories_burned ? ` - ${entry.calories_burned} calories` : ''}
                  </div>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            ))}
            <div className="pt-4 border-t">
              <strong>
                Total Duration: {entries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)} minutes
              </strong>
              <br />
              <strong>
                Total Calories Burned: {entries.reduce((sum, entry) => sum + (entry.calories_burned || 0), 0)}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}