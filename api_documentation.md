# MyFitnessPal-Like API Documentation

## Table of Contents
1. [Authentication & Security](#authentication--security)
2. [Core APIs](#core-apis)
3. [Food & Nutrition System](#food--nutrition-system)
4. [Exercise & Activity Tracking](#exercise--activity-tracking)
5. [User Management](#user-management)
6. [API Documentation Standards](#api-documentation-standards)

## Authentication & Security

### JWT Token Structure
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "is_premium": false,
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Security Endpoints

#### POST /api/auth/register
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### POST /api/auth/login
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### POST /api/auth/refresh-token
```json
{
  "refresh_token": "refresh_token_here"
}
```

#### POST /api/auth/logout
Logs out the current user by invalidating their access token.

### Security Features
- Password hashing using bcrypt (minimum 12 rounds)
- JWT tokens with short expiration (15 minutes access, 7 days refresh)
- Rate limiting on authentication endpoints
- Email verification required
- Password reset with secure tokens
- Account lockout after failed attempts

## Core APIs

### User Profile APIs

#### GET /api/users/profile
Returns current user's profile information.

#### PUT /api/users/profile
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "height_cm": 180,
  "activity_level": "moderate",
  "timezone": "America/New_York"
}
```

#### POST /api/users/profile-image
Upload profile image (multipart/form-data)

### Daily Summary API

#### GET /api/users/daily-summary?date=2024-01-15
```json
{
  "date": "2024-01-15",
  "goals": {
    "calories": 2000,
    "protein": 150,
    "carbs": 250,
    "fat": 67
  },
  "consumed": {
    "calories": 1850,
    "protein": 140,
    "carbs": 200,
    "fat": 65
  },
  "exercise_calories_burned": 300,
  "net_calories": 1550,
  "meals": {
    "breakfast": { "calories": 400, "entries": 3 },
    "lunch": { "calories": 600, "entries": 4 },
    "dinner": { "calories": 700, "entries": 5 },
    "snacks": { "calories": 150, "entries": 2 }
  },
  "exercises": {
    "total_duration": 45,
    "total_calories": 300,
    "entries": 2
  }
}
```

## Food & Nutrition System

### Food Search API

#### GET /api/foods/search?q=apple&limit=20&offset=0
```json
{
  "results": [
    {
      "id": 1,
      "name": "Apple, Raw",
      "brand": null,
      "calories_per_serving": 95,
      "serving_size": 1,
      "serving_unit": "medium apple",
      "verified": true,
      "nutrition": {
        "protein": 0.5,
        "carbs": 25,
        "fat": 0.3,
        "fiber": 4
      }
    }
  ],
  "total": 150,
  "page": 1,
  "per_page": 20
}
```

#### POST /api/foods
Create custom food item.
```json
{
  "name": "Homemade Smoothie",
  "serving_size": 1,
  "serving_unit": "cup",
  "calories_per_serving": 150,
  "protein_g": 5,
  "carbs_g": 30,
  "fat_g": 2
}
```

### Food Diary APIs

#### GET /api/food-diary?date=2024-01-15
Returns all food entries for a specific date.

#### POST /api/food-diary
```json
{
  "food_item_id": 1,
  "meal_type": "breakfast",
  "quantity": 1.5,
  "serving_unit": "cup",
  "logged_date": "2024-01-15",
  "notes": "With almond milk"
}
```

#### PUT /api/food-diary/{entry_id}
Update existing food diary entry.

#### DELETE /api/food-diary/{entry_id}
Delete food diary entry.

### Quick Add APIs

#### POST /api/food-diary/quick-add
```json
{
  "meal_type": "lunch",
  "calories": 350,
  "logged_date": "2024-01-15",
  "description": "Restaurant meal"
}
```

## Exercise & Activity Tracking

### Exercise Database APIs

#### GET /api/exercises/search?q=running&category=cardio
Search exercises by name and category.

#### GET /api/exercises/categories
Return all exercise categories.

### Exercise Diary APIs

#### GET /api/exercise-diary?date=2024-01-15
Return all exercise entries for a date.

#### POST /api/exercise-diary
```json
{
  "exercise_id": 1,
  "duration_minutes": 30,
  "calories_burned": 300,
  "logged_date": "2024-01-15",
  "notes": "Morning run"
}
```

#### POST /api/exercise-diary/cardio
```json
{
  "exercise_id": 1,
  "duration_minutes": 45,
  "distance": 5.2,
  "distance_unit": "km",
  "logged_date": "2024-01-15"
}
```

#### POST /api/exercise-diary/strength
```json
{
  "exercise_id": 1,
  "sets": 3,
  "reps": 12,
  "weight_used": 50,
  "logged_date": "2024-01-15"
}
```

#### PUT /api/exercise-diary/{entry}
Update existing exercise diary entry.

#### DELETE /api/exercise-diary/{entry}
Delete exercise diary entry.

## User Management

### Goals Management

#### GET /api/users/goals
Return current active goals.

#### POST /api/users/goals
```json
{
  "goal_type": "weight_loss",
  "target_weight_kg": 70,
  "weekly_goal_kg": 0.5,
  "daily_calorie_goal": 1800,
  "daily_protein_goal": 120,
  "target_date": "2024-06-01"
}
```

#### PUT /api/users/goals/{goal}
Update existing goal.

### Weight Tracking

#### GET /api/users/weight-logs?period=30
Return weight logs for specified period.

#### POST /api/users/weight-logs
```json
{
  "weight_kg": 72.5,
  "logged_date": "2024-01-15",
  "notes": "Morning weight"
}
```

### Progress Reports

#### GET /api/users/progress?period=weekly&weeks=12
```json
{
  "period": "weekly",
  "data": [
    {
      "week_start": "2024-01-01",
      "avg_calories_consumed": 1850,
      "avg_calories_goal": 1800,
      "avg_weight": 73.2,
      "total_exercise_minutes": 180,
      "weight_change": -0.3
    }
  ],
  "summary": {
    "total_weight_lost": 2.1,
    "avg_weekly_loss": 0.35,
    "goal_adherence_rate": 0.85
  }
}
```

## API Documentation Standards

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

---

This API documentation provides detailed specifications for all endpoints in the MyFitnessPal-like backend system.