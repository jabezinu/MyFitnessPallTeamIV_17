import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import FoodDiary from './pages/FoodDiary'
import ExerciseDiary from './pages/ExerciseDiary'
import Goals from './pages/Goals'
import WeightLogs from './pages/WeightLogs'
import Profile from './pages/Profile'
import Placeholder from './pages/Placeholder'
import Layout from './components/Layout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="food-diary" element={<FoodDiary />} />
        <Route path="exercise-diary" element={<ExerciseDiary />} />
        <Route path="goals" element={<Goals />} />
        <Route path="weight-logs" element={<WeightLogs />} />
        <Route path="profile" element={<Profile />} />

        {/* Food section routes */}
        <Route path="food-database" element={<Placeholder title="Food Database" />} />
        <Route path="my-foods" element={<Placeholder title="My Foods" />} />
        <Route path="my-meals" element={<Placeholder title="My Meals" />} />
        <Route path="recipes" element={<Placeholder title="Recipes" />} />
        <Route path="food-settings" element={<Placeholder title="Food Settings" />} />

        {/* Exercise section routes */}
        <Route path="exercise-database" element={<Placeholder title="Exercise Database" />} />
        <Route path="my-exercise" element={<Placeholder title="My Exercise" />} />
        <Route path="exercise-settings" element={<Placeholder title="Exercise Settings" />} />

        {/* Reports section routes */}
        <Route path="reports/chart" element={<Placeholder title="Reports Chart" />} />
        <Route path="reports/export" element={<Placeholder title="Export Data" />} />
        <Route path="reports/digest" element={<Placeholder title="Weekly Digest" />} />
        <Route path="reports/printable" element={<Placeholder title="Printable Diary" />} />
      </Route>
    </Routes>
  )
}