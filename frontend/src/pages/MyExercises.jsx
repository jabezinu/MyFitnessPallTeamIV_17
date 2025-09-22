import { useState, useEffect } from 'react'
import { exerciseAPI } from '../services/api'

export default function MyExercises() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    met_value: '',
    description: '',
    instructions: '',
    muscle_groups: '',
    equipment_needed: '',
    difficulty_level: ''
  })

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await exerciseAPI.getCategories()
        setCategories(response.data.data)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const response = await exerciseAPI.searchMyExercises(searchQuery, 50, 0)
      setExercises(response.data.data.results || [])
    } catch (error) {
      console.error('Error fetching exercises:', error)
      setExercises([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCreateExercise = async () => {
    try {
      const exerciseData = {
        ...formData,
        muscle_groups: formData.muscle_groups ? formData.muscle_groups.split(',').map(s => s.trim()) : [],
        equipment_needed: formData.equipment_needed ? formData.equipment_needed.split(',').map(s => s.trim()) : [],
        met_value: formData.met_value ? parseFloat(formData.met_value) : null
      }
      await exerciseAPI.createExercise(exerciseData)
      setShowCreateForm(false)
      setFormData({
        name: '',
        category: '',
        met_value: '',
        description: '',
        instructions: '',
        muscle_groups: '',
        equipment_needed: '',
        difficulty_level: ''
      })
      // Optionally refresh search results if there's a current search
      if (searchQuery.trim()) {
        handleSearch()
      }
    } catch (error) {
      console.error('Error creating exercise:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Exercises</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Create Exercise
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm">
          <div className="pl-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search your custom exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Create Custom Exercise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">MET Value (optional)</label>
              <input
                type="number"
                step="0.1"
                value={formData.met_value}
                onChange={(e) => setFormData({ ...formData, met_value: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows="3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Instructions (optional)</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Muscle Groups (comma-separated, optional)</label>
              <input
                type="text"
                value={formData.muscle_groups}
                onChange={(e) => setFormData({ ...formData, muscle_groups: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., chest, triceps, shoulders"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Equipment Needed (comma-separated, optional)</label>
              <input
                type="text"
                value={formData.equipment_needed}
                onChange={(e) => setFormData({ ...formData, equipment_needed: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., dumbbells, barbell"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty Level (optional)</label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Difficulty</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-2 mt-6">
            <button
              onClick={handleCreateExercise}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Create Exercise
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Searching exercises...
          </div>
        </div>
      )}

      {!loading && exercises.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-gray-500">No exercises found matching "{searchQuery}". Try a different search term or create a new exercise.</p>
        </div>
      )}

      {!loading && exercises.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map(exercise => (
            <div key={exercise.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{exercise.name}</h3>
                <p className="text-sm text-gray-600 capitalize">Category: {exercise.category}</p>
                <div className="mt-4">
                  {exercise.met_value && (
                    <div className="text-sm text-gray-600">
                      <strong>MET Value:</strong> {exercise.met_value}
                    </div>
                  )}
                  {exercise.description && (
                    <div className="text-sm text-gray-600 mt-2">
                      <strong>Description:</strong> {exercise.description}
                    </div>
                  )}
                  {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                    <div className="text-sm text-gray-600 mt-2">
                      <strong>Muscle Groups:</strong> {exercise.muscle_groups.join(', ')}
                    </div>
                  )}
                  {exercise.difficulty_level && (
                    <div className="text-sm text-gray-600 mt-2">
                      <strong>Difficulty:</strong> {exercise.difficulty_level}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedExercise(exercise)}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedExercise && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedExercise.name}</h3>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <h4 className="font-medium">Basic Info</h4>
                  <p className="text-sm text-gray-600">Category: {selectedExercise.category}</p>
                  {selectedExercise.met_value && (
                    <p className="text-sm text-gray-600">MET Value: {selectedExercise.met_value}</p>
                  )}
                  {selectedExercise.difficulty_level && (
                    <p className="text-sm text-gray-600">Difficulty: {selectedExercise.difficulty_level}</p>
                  )}
                </div>
                {selectedExercise.description && (
                  <div>
                    <h4 className="font-medium">Description</h4>
                    <p className="text-sm text-gray-600">{selectedExercise.description}</p>
                  </div>
                )}
                {selectedExercise.instructions && (
                  <div>
                    <h4 className="font-medium">Instructions</h4>
                    <p className="text-sm text-gray-600">{selectedExercise.instructions}</p>
                  </div>
                )}
                {selectedExercise.muscle_groups && selectedExercise.muscle_groups.length > 0 && (
                  <div>
                    <h4 className="font-medium">Muscle Groups</h4>
                    <p className="text-sm text-gray-600">{selectedExercise.muscle_groups.join(', ')}</p>
                  </div>
                )}
                {selectedExercise.equipment_needed && selectedExercise.equipment_needed.length > 0 && (
                  <div>
                    <h4 className="font-medium">Equipment Needed</h4>
                    <p className="text-sm text-gray-600">{selectedExercise.equipment_needed.join(', ')}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}