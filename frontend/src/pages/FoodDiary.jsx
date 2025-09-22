import { useState, useEffect } from 'react'
import { foodAPI } from '../services/api'

export default function FoodDiary() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000)
  const [dailyProteinGoal, setDailyProteinGoal] = useState(150)
  const [dailyCarbsGoal, setDailyCarbsGoal] = useState(250)
  const [dailyFatGoal, setDailyFatGoal] = useState(70)
  const [totalCalories, setTotalCalories] = useState(0)
  const [totalProtein, setTotalProtein] = useState(0)
  const [totalCarbs, setTotalCarbs] = useState(0)
  const [totalFat, setTotalFat] = useState(0)
  const [totalFiber, setTotalFiber] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedFood, setSelectedFood] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [mealType, setMealType] = useState('breakfast')
  const [showQuickAddForm, setShowQuickAddForm] = useState(false)
  const [quickCalories, setQuickCalories] = useState('')
  const [quickDescription, setQuickDescription] = useState('')
  const [showCopyFromDateForm, setShowCopyFromDateForm] = useState(false)
  const [copyFromDate, setCopyFromDate] = useState('')
  const [showCopyToDateForm, setShowCopyToDateForm] = useState(false)
  const [copyToDate, setCopyToDate] = useState('')
  const [currentMealType, setCurrentMealType] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [date])

  const fetchEntries = async () => {
    try {
      const response = await foodAPI.getFoodDiary(date)
      console.log('API Response:', response.data)
      const entriesData = response.data.data.entries || []
      console.log('Entries:', entriesData)
      setEntries(entriesData)
      setDailyCalorieGoal(response.data.data.daily_calorie_goal || 2000)
      setDailyProteinGoal(response.data.data.daily_protein_goal || 150)
      setDailyCarbsGoal(response.data.data.daily_carbs_goal || 250)
      setDailyFatGoal(response.data.data.daily_fat_goal || 70)
      setTotalCalories(response.data.data.total_calories || 0)

      // Calculate macronutrient totals
      let protein = 0, carbs = 0, fat = 0, fiber = 0
      entriesData.forEach(entry => {
        if (entry.food_item) {
          const foodItem = entry.food_item
          const multiplier = entry.quantity / foodItem.serving_size
          protein += (foodItem.protein_g || 0) * multiplier
          carbs += (foodItem.carbs_g || 0) * multiplier
          fat += (foodItem.fat_g || 0) * multiplier
          fiber += (foodItem.fiber_g || 0) * multiplier
        }
      })
      setTotalProtein(protein)
      setTotalCarbs(carbs)
      setTotalFat(fat)
      setTotalFiber(fiber)
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
    if (!selectedFood) {
      console.error('No food selected')
      return
    }

    try {
      const entry = {
        food_item_id: selectedFood.id,
        meal_type: mealType,
        quantity: quantity,
        serving_unit: selectedFood.serving_unit,
        logged_date: date
      }
      console.log('Adding entry:', entry)
      const response = await foodAPI.addFoodEntry(entry)
      console.log('Add response:', response)
      setShowAddForm(false)
      setSelectedFood(null)
      setSearchQuery('')
      setQuantity(1)
      fetchEntries()
    } catch (error) {
      console.error('Error adding food entry:', error)
      console.error('Error details:', error.response?.data)
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

  const handleQuickAdd = async () => {
    if (!quickCalories || !currentMealType) return

    try {
      await foodAPI.quickAdd({
        meal_type: currentMealType,
        calories: parseFloat(quickCalories),
        logged_date: date,
        description: quickDescription
      })
      setShowQuickAddForm(false)
      setQuickCalories('')
      setQuickDescription('')
      fetchEntries()
    } catch (error) {
      console.error('Error adding quick calories:', error)
    }
  }

  const handleCopyYesterday = async (mealType) => {
    try {
      await foodAPI.copyYesterday(date, mealType)
      fetchEntries()
    } catch (error) {
      console.error('Error copying from yesterday:', error)
    }
  }

  const handleCopyFromDate = async () => {
    if (!copyFromDate) return

    try {
      await foodAPI.copyFromDate(copyFromDate, date)
      setShowCopyFromDateForm(false)
      setCopyFromDate('')
      fetchEntries()
    } catch (error) {
      console.error('Error copying from date:', error)
    }
  }

  const handleCopyToDate = async () => {
    if (!copyToDate) return

    try {
      await foodAPI.copyToDate(date, copyToDate)
      setShowCopyToDateForm(false)
      setCopyToDate('')
      // No need to fetch entries since we're copying to another date
    } catch (error) {
      console.error('Error copying to date:', error)
    }
  }

  const openQuickAddForm = (mealType) => {
    setCurrentMealType(mealType)
    setShowQuickAddForm(true)
  }

  const meals = ['breakfast', 'lunch', 'dinner', 'snack']
  const mealEntries = meals.reduce((acc, meal) => {
    acc[meal] = entries.filter(entry => entry.meal_type === meal)
    return acc
  }, {})

  console.log('Meals:', meals)
  console.log('Entries:', entries)
  console.log('MealEntries:', mealEntries)

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

      {showQuickAddForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Add Calories</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Calories</label>
              <input
                type="number"
                value={quickCalories}
                onChange={(e) => setQuickCalories(e.target.value)}
                placeholder="Enter calories"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
              <input
                type="text"
                value={quickDescription}
                onChange={(e) => setQuickDescription(e.target.value)}
                placeholder="e.g., Apple, Banana"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleQuickAdd}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Add Calories
              </button>
              <button
                onClick={() => {
                  setShowQuickAddForm(false)
                  setQuickCalories('')
                  setQuickDescription('')
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCopyFromDateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Copy from Date</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Source Date</label>
              <input
                type="date"
                value={copyFromDate}
                onChange={(e) => setCopyFromDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyFromDate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Copy Entries
              </button>
              <button
                onClick={() => {
                  setShowCopyFromDateForm(false)
                  setCopyFromDate('')
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCopyToDateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Copy to Date</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Date</label>
              <input
                type="date"
                value={copyToDate}
                onChange={(e) => setCopyToDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyToDate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Copy Entries
              </button>
              <button
                onClick={() => {
                  setShowCopyToDateForm(false)
                  setCopyToDate('')
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {meals.map(meal => (
          <div key={meal} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold capitalize">{meal === 'snack' ? 'Snacks' : meal}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setMealType(meal)
                    setShowAddForm(true)
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                >
                  Add Food
                </button>
                <div className="relative">
                  <button
                    onClick={() => {
                      const dropdown = document.getElementById(`quick-food-${meal}`)
                      dropdown.classList.toggle('hidden')
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Quick Food ▼
                  </button>
                  <div id={`quick-food-${meal}`} className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 hidden">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          openQuickAddForm(meal)
                          document.getElementById(`quick-food-${meal}`).classList.add('hidden')
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Quick add calories
                      </button>
                      <button
                        onClick={() => {
                          handleCopyYesterday(meal)
                          document.getElementById(`quick-food-${meal}`).classList.add('hidden')
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Copy yesterday
                      </button>
                      <button
                        onClick={() => {
                          setShowCopyFromDateForm(true)
                          document.getElementById(`quick-food-${meal}`).classList.add('hidden')
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Copy from date
                      </button>
                      <button
                        onClick={() => {
                          setShowCopyToDateForm(true)
                          document.getElementById(`quick-food-${meal}`).classList.add('hidden')
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Copy to date
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {mealEntries[meal].length === 0 ? (
              <p className="text-gray-500">No entries for {meal === 'snack' ? 'Snacks' : meal}</p>
            ) : (
              <div className="space-y-1">
                {mealEntries[meal].map(entry => {
                  const isQuickAdd = !entry.food_item

                  if (isQuickAdd) {
                    return (
                      <div key={entry.id} className="p-2 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{entry.notes || 'Quick Added Calories'}</div>
                            <div className="text-xs text-gray-600">
                              {entry.calories} cal
                            </div>
                          </div>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="text-red-600 hover:text-red-800 ml-2 text-sm"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )
                  }

                  const foodItem = entry.food_item
                  const multiplier = entry.quantity / foodItem.serving_size
                  const protein = (foodItem.protein_g || 0) * multiplier
                  const carbs = (foodItem.carbs_g || 0) * multiplier
                  const fat = (foodItem.fat_g || 0) * multiplier
                  const fiber = (foodItem.fiber_g || 0) * multiplier

                  return (
                    <div key={entry.id} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{foodItem.name}</div>
                          <div className="text-xs text-gray-600">
                            {entry.quantity} {entry.serving_unit} • {entry.calories} cal
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                            <span>P: {protein.toFixed(1)}g</span>
                            <span>C: {carbs.toFixed(1)}g</span>
                            <span>F: {fat.toFixed(1)}g</span>
                            {fiber > 0 && <span>Fb: {fiber.toFixed(1)}g</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 ml-2 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })}
                <div className="pt-2 border-t">
                  <strong>Total: {mealEntries[meal].reduce((sum, entry) => sum + entry.calories, 0)} calories</strong>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Daily Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Daily Summary</h3>

        {/* Calories Section */}
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3">Calories</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalCalories.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Calories Consumed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dailyCalorieGoal}</div>
              <div className="text-sm text-gray-600">Daily Goal</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${totalCalories > dailyCalorieGoal ? 'text-red-600' : 'text-green-600'}`}>
                {Math.max(0, dailyCalorieGoal - totalCalories).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${totalCalories > dailyCalorieGoal ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, (totalCalories / dailyCalorieGoal) * 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              {((totalCalories / dailyCalorieGoal) * 100).toFixed(1)}% of daily goal
            </div>
          </div>
        </div>

        {/* Macronutrients Section */}
        <div>
          <h4 className="text-lg font-medium mb-3">Macronutrients</h4>
          <div className="space-y-4">
            {/* Protein */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-purple-700">Protein</span>
                <span className="text-xs text-gray-500">
                  {totalProtein.toFixed(1)}g / {dailyProteinGoal}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-purple-500"
                  style={{ width: `${Math.min(100, (totalProtein / dailyProteinGoal) * 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.max(0, dailyProteinGoal - totalProtein).toFixed(1)}g remaining
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-yellow-700">Carbs</span>
                <span className="text-xs text-gray-500">
                  {totalCarbs.toFixed(1)}g / {dailyCarbsGoal}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-yellow-500"
                  style={{ width: `${Math.min(100, (totalCarbs / dailyCarbsGoal) * 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.max(0, dailyCarbsGoal - totalCarbs).toFixed(1)}g remaining
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-red-700">Fat</span>
                <span className="text-xs text-gray-500">
                  {totalFat.toFixed(1)}g / {dailyFatGoal}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-red-500"
                  style={{ width: `${Math.min(100, (totalFat / dailyFatGoal) * 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.max(0, dailyFatGoal - totalFat).toFixed(1)}g remaining
              </div>
            </div>

            {/* Fiber */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-700">Fiber</span>
                <span className="text-xs text-gray-500">
                  {totalFiber.toFixed(1)}g consumed
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Recommended: 25-30g daily
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
