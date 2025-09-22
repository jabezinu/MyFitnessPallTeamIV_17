import { useState } from 'react'
import { foodAPI } from '../services/api'

export default function FoodDatabase() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const response = await foodAPI.searchFoods(searchQuery, 50, 0)
      setFoods(response.data.data.results || [])
    } catch (error) {
      console.error('Error fetching foods:', error)
      setFoods([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Food Database</h1>
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
            placeholder="Search for foods by name..."
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

      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Searching foods...
          </div>
        </div>
      )}

      {!loading && foods.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-gray-500">No foods found matching "{searchQuery}". Try a different search term.</p>
        </div>
      )}

      {!loading && foods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map(food => (
            <div key={food.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{food.name}</h3>
                {food.brand && (
                  <p className="text-sm text-gray-600">Brand: {food.brand}</p>
                )}
                <div className="mt-4">
                  <div className="text-sm text-gray-600">
                    <strong>Calories:</strong> {food.calories_per_serving} cal per {food.serving_size} {food.serving_unit}
                  </div>
                  {food.protein_g && (
                    <div className="text-sm text-gray-600">
                      <strong>Protein:</strong> {food.protein_g}g
                    </div>
                  )}
                  {food.carbs_g && (
                    <div className="text-sm text-gray-600">
                      <strong>Carbs:</strong> {food.carbs_g}g
                    </div>
                  )}
                  {food.fat_g && (
                    <div className="text-sm text-gray-600">
                      <strong>Fat:</strong> {food.fat_g}g
                    </div>
                  )}
                  {food.fiber_g && (
                    <div className="text-sm text-gray-600">
                      <strong>Fiber:</strong> {food.fiber_g}g
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedFood(food)}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFood && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedFood.name}</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium">Basic Info</h4>
                  <p className="text-sm text-gray-600">Brand: {selectedFood.brand || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Serving Size: {selectedFood.serving_size} {selectedFood.serving_unit}</p>
                  <p className="text-sm text-gray-600">Verified: {selectedFood.verified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Nutritional Facts</h4>
                  <p className="text-sm text-gray-600">Calories: {selectedFood.calories_per_serving}</p>
                  <p className="text-sm text-gray-600">Protein: {selectedFood.protein_g || 0}g</p>
                  <p className="text-sm text-gray-600">Carbs: {selectedFood.carbs_g || 0}g</p>
                  <p className="text-sm text-gray-600">Fat: {selectedFood.fat_g || 0}g</p>
                  <p className="text-sm text-gray-600">Fiber: {selectedFood.fiber_g || 0}g</p>
                  <p className="text-sm text-gray-600">Sugar: {selectedFood.sugar_g || 0}g</p>
                  <p className="text-sm text-gray-600">Sodium: {selectedFood.sodium_mg || 0}mg</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedFood(null)}
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