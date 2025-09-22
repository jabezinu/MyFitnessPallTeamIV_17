import axios from 'axios'

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8000' // Adjust this to match your backend URL
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => axios.post('/api/auth/login', credentials),
  register: (userData) => axios.post('/api/auth/register', userData),
  logout: () => axios.post('/api/auth/logout'),
  refreshToken: (refreshToken) => axios.post('/api/auth/refresh-token', { refresh_token: refreshToken }),
}

export const userAPI = {
  getProfile: () => axios.get('/api/users/profile'),
  updateProfile: (data) => axios.put('/api/users/profile', data),
  getDailySummary: (date) => axios.get(`/api/users/daily-summary?date=${date}`),
  getGoals: () => axios.get('/api/users/goals'),
  createGoal: (goal) => axios.post('/api/users/goals', goal),
  updateGoal: (goalId, goal) => axios.put(`/api/users/goals/${goalId}`, goal),
  getWeightLogs: (period) => axios.get(`/api/users/weight-logs?period=${period}`),
  addWeightLog: (log) => axios.post('/api/users/weight-logs', log),
  updateWeightLog: (id, log) => axios.put(`/api/users/weight-logs/${id}`, log),
  getProgress: (params) => axios.get('/api/users/progress', { params }),
}

export const foodAPI = {
  searchFoods: (query, limit = 20, offset = 0) =>
    axios.get('/api/foods/search', { params: { q: query, limit, offset } }),
  createFood: (food) => axios.post('/api/foods', food),
  getFoodDiary: (date) => axios.get(`/api/food-diary?date=${date}`),
  addFoodEntry: (entry) => axios.post('/api/food-diary', entry),
  updateFoodEntry: (entryId, entry) => axios.put(`/api/food-diary/${entryId}`, entry),
  deleteFoodEntry: (entryId) => axios.delete(`/api/food-diary/${entryId}`),
  quickAdd: (data) => axios.post('/api/food-diary/quick-add', data),
  copyYesterday: (targetDate) => axios.post('/api/food-diary/copy-yesterday', { target_date: targetDate }),
  copyFromDate: (sourceDate, targetDate) => axios.post('/api/food-diary/copy-from-date', { source_date: sourceDate, target_date: targetDate }),
  copyToDate: (sourceDate, targetDate) => axios.post('/api/food-diary/copy-to-date', { source_date: sourceDate, target_date: targetDate }),
}


export const exerciseAPI = {
  searchExercises: (query, category) => 
    axios.get('/api/exercises/search', { params: { q: query, category } }),
  getCategories: () => axios.get('/api/exercises/categories'),
  getExerciseDiary: (date) => axios.get(`/api/exercise-diary?date=${date}`),
  addExerciseEntry: (entry) => axios.post('/api/exercise-diary', entry),
  addCardioEntry: (entry) => axios.post('/api/exercise-diary/cardio', entry),
  addStrengthEntry: (entry) => axios.post('/api/exercise-diary/strength', entry),
  updateExerciseEntry: (entryId, entry) => axios.put(`/api/exercise-diary/${entryId}`, entry),
  deleteExerciseEntry: (entryId) => axios.delete(`/api/exercise-diary/${entryId}`),
}

export default axios