import { useState, useEffect } from 'react'
import { foodAPI } from '../services/api'

export default function MyFoods() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedFood, setSelectedFood] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    serving_size: '',
    serving_unit: '',
    calories_per_serving: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    fiber_g: '',
    sugar_g: '',
    sodium_mg: ''
  })

  useEffect(() => {
    fetchFoods()
  }, [])

  const fetchFoods = async () => {
    try {
      // For now, we'll search all foods. In a real app, you'd have a separate endpoint for user's foods
      const response = await foodAPI.searchFoods('', 100, 0)
      // Filter to show only foods created by the current user (if that info is available)
      setFoods(response.data.data.results || [])
    } catch (error) {
      console.error('Error fetching foods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFood = async () => {
    try {
      await foodAPI.createFood(formData)
      setShowCreateForm(false)
      setFormData({
        name: '',
        brand: '',
        serving_size: '',
        serving_unit: '',
        calories_per_serving: '',
        protein_g: '',
        carbs_g: '',
        fat_g: '',
        fiber_g: '',
        sugar_g: '',
        sodium_mg: ''
      })
      fetchFoods()
    } catch (error) {
      console.error('Error creating food:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Foods</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Create Food
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Create Custom Food</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
              <label className="block text-sm font-medium text-gray-700">Brand (optional)</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Serving Size</label>
              <input
                type="number"
                value={formData.serving_size}
                onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Serving Unit</label>
              <input
                type="text"
                value={formData.serving_unit}
                onChange={(e) => setFormData({ ...formData, serving_unit: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., grams, cups, pieces"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Calories per Serving</label>
              <input
                type="number"
                value={formData.calories_per_serving}
                onChange={(e) => setFormData({ ...formData, calories_per_serving: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Protein (g)</label>
              <input
                type="number"
                value={formData.protein_g}
                onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Carbohydrates (g)</label>
              <input
                type="number"
                value={formData.carbs_g}
                onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fat (g)</label>
              <input
                type="number"
                value={formData.fat_g}
                onChange={(e) => setFormData({ ...formData, fat_g: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fiber (g)</label>
              <input
                type="number"
                value={formData.fiber_g}
                onChange={(e) => setFormData({ ...formData, fiber_g: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sugar (g)</label>
              <input
                type="number"
                value={formData.sugar_g}
                onChange={(e) => setFormData({ ...formData, sugar_g: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sodium (mg)</label>
              <input
                type="number"
                value={formData.sodium_mg}
                onChange={(e) => setFormData({ ...formData, sodium_mg: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                step="0.1"
              />
            </div>
          </div>

          <div className="flex space-x-2 mt-6">
            <button
              onClick={handleCreateFood}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Create Food
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