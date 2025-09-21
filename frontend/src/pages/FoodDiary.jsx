import { useState, useEffect } from 'react'
import { foodAPI } from '../services/api'

export default function FoodDiary() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedFood, setSelectedFood] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [mealType, setMealType] = useState('breakfast')

  useEffect(() => {
    fetchEntries()
  }, [date])

  const fetchEntries = async () => {
    try {
      const response = await foodAPI.getFoodDiary(date)
      setEntries(response.data.data || [])
    } catch (error) {
      console.error('Error fetching food diary:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchFoods = async (query) => {
    if (query.length < 2) return
    try {
      const response = await foodAPI.searchFoods(query)
      setSearchResults(response.data.data.results || [])
    } catch (error) {
      console.error('Error searching foods:', error)
    }
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    searchFoods(query)
  }

  const selectFood = (food) => {
    setSelectedFood(food)
    setSearchQuery(food.name)
    setSearchResults([])
  }

  const addFoodEntry = async () => {
    if (!selectedFood) return

    try {
      const entry = {
        food_item_id: selectedFood.id,
        meal_type: mealType,
        quantity: quantity,
        serving_unit: selectedFood.serving_unit,
        logged_date: date
      }
      await foodAPI.addFoodEntry(entry)
      setShowAddForm(false)
      setSelectedFood(null)
      setSearchQuery('')
      setQuantity(1)
      fetchEntries()
    } catch (error) {
      console.error('Error adding food entry:', error)
    }
  }

  const deleteEntry = async (entryId) => {
    try {
      await foodAPI.deleteFoodEntry(entryId)
      fetchEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const meals = ['breakfast', 'lunch', 'dinner', 'snacks']
  const mealEntries = meals.reduce((acc, meal) => {
    acc[meal] = entries.filter(entry => entry.meal_type === meal)
    return acc
  }, {})

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Food Diary</h1>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Add Food
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Add Food Entry</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search Food</label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for food..."
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                  {searchResults.map(food => (
                    <div
                      key={food.id}
                      onClick={() => selectFood(food)}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="font-medium">{food.name}</div>
                      <div className="text-sm text-gray-600">
                        {food.calories_per_serving} cal per {food.serving_size} {food.serving_unit}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedFood && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value))}
                    min="0.1"
                    step="0.1"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={addFoodEntry}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Add Entry
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setSelectedFood(null)
                      setSearchQuery('')
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

      <div className="space-y-4">
        {meals.map(meal => (
          <div key={meal} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold capitalize mb-4">{meal}</h3>
            {mealEntries[meal].length === 0 ? (
              <p className="text-gray-500">No entries for {meal}</p>
            ) : (
              <div className="space-y-2">
                {mealEntries[meal].map(entry => (
                  <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{entry.food_item.name}</span>
                      <span className="text-gray-600 ml-2">
                        {entry.quantity} {entry.serving_unit} - {entry.calories} cal
                      </span>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <strong>Total: {mealEntries[meal].reduce((sum, entry) => sum + entry.calories, 0)} calories</strong>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}