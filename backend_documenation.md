# MyFitnessPal-Like Backend Documentation


## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Design](#database-design)
4. [Authentication & Security](#authentication--security)
5. [Core APIs](#core-apis)
6. [Food & Nutrition System](#food--nutrition-system)
7. [Exercise & Activity Tracking](#exercise--activity-tracking)
8. [User Management](#user-management)


## System Overview


### Purpose
Build a comprehensive nutrition and fitness tracking backend system that allows users to:
- Track daily calorie intake and nutrition
- Log exercises and physical activities
- Set and monitor health goals
- Access a comprehensive food database
- Generate reports and insights


### Key Features
- **Nutrition Tracking**: Calorie counting, macro/micronutrient tracking
- **Food Database**: Comprehensive database
- **Exercise Logging**: Activity tracking with calorie burn calculations
- **Goal Management**: Weight loss, muscle gain, maintenance goals
- **Analytics**: Progress reports, trends, insights
- **Mobile & Web Support**: Cross-platform API support


## Architecture


### Technology Stack
```
Backend Framework: [Your chosen framework - e.g., Node.js/Express, Django, Spring Boot]
Database: SQLite
Authentication: JWT + OAuth 2.0
```


### System Architecture
```
                      ┌──────────────────┐
                      │   Load Balancer  │
                      └──────────────────┘
                              │
                      ┌──────────────────┐
                      │   API Gateway    │
                      └──────────────────┘
                                │
┌─────────────────┐    ┌──────────────────┐
│ Authentication  │    │   Core API       │
│   Service       │    │   Service        │
└─────────────────┘    └──────────────────┘
          │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                     ┌──────────────────┐
                     │   Database       │
                     │   SQLite         │
                     └──────────────────┘
```


## Database Design


### Core Entities


#### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    date_of_birth TEXT,
    gender TEXT,
    height_cm INTEGER,
    activity_level TEXT DEFAULT 'sedentary',
    timezone TEXT,
    profile_image_url TEXT,
    is_premium INTEGER DEFAULT 0,
    email_verified INTEGER DEFAULT 0,
    privacy_settings TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```


#### Food Items Table
```sql
CREATE TABLE food_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    serving_size REAL,
    serving_unit TEXT,
    calories_per_serving REAL,
    protein_g REAL,
    carbs_g REAL,
    fat_g REAL,
    fiber_g REAL,
    sugar_g REAL,
    sodium_mg REAL,
    vitamins TEXT,
    minerals TEXT,
    food_category_id INTEGER REFERENCES food_categories(id),
    verified INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_food_items_name ON food_items(name);
```


#### Food Categories Table
```sql
CREATE TABLE food_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER REFERENCES food_categories(id),
    icon_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```


#### Food Diary Entries
```sql
CREATE TABLE food_diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_item_id INTEGER NOT NULL REFERENCES food_items(id),
    meal_type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
    quantity REAL NOT NULL,
    serving_unit TEXT NOT NULL,
    logged_date TEXT NOT NULL,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);


CREATE INDEX idx_food_diary_user_date ON food_diary_entries(user_id, logged_date);
```


#### Exercise Database
```sql
CREATE TABLE exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- cardio, strength, flexibility, sports
    met_value REAL, -- Metabolic equivalent
    description TEXT,
    instructions TEXT,
    muscle_groups TEXT,
    equipment_needed TEXT,
    difficulty_level TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```


#### Exercise Diary Entries
```sql
CREATE TABLE exercise_diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id),
    duration_minutes INTEGER,
    calories_burned REAL,
    sets INTEGER,
    reps INTEGER,
    weight_used REAL,
    distance REAL,
    distance_unit TEXT,
    logged_date TEXT NOT NULL,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);


CREATE INDEX idx_exercise_diary_user_date ON exercise_diary_entries(user_id, logged_date);
```


#### User Goals
```sql
CREATE TABLE user_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL, -- weight_loss, weight_gain, maintain, muscle_gain
    target_weight_kg REAL,
    target_date TEXT,
    weekly_goal_kg REAL,
    daily_calorie_goal INTEGER,
    daily_protein_goal REAL,
    daily_carbs_goal REAL,
    daily_fat_goal REAL,
    daily_exercise_minutes INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```


#### Weight Logs
```sql
CREATE TABLE weight_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg REAL NOT NULL,
    logged_date TEXT NOT NULL,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);


CREATE UNIQUE INDEX idx_weight_logs_user_date ON weight_logs(user_id, logged_date);
```




#### Recipes
```sql
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    servings INTEGER,
    image_url TEXT,
    is_public INTEGER DEFAULT 0,
    total_calories REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    food_item_id INTEGER NOT NULL REFERENCES food_items(id),
    quantity REAL NOT NULL,
    unit TEXT NOT NULL
);
```


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


## Testing Strategy


### Unit Tests
- Service layer testing
- Database model validation
- Utility function testing
- Authentication logic


### Integration Tests
- API endpoint testing
- Database integration
- External service mocking
- End-to-end workflows


### Performance Tests
- Load testing for peak usage
- Database performance under load
- API response time benchmarks
- Memory usage optimization


---


## Development Phases


### Phase 1: Core Foundation (Weeks 1-4)
- User authentication system
- Basic user profile management
- Database setup and migrations
- Core API structure


### Phase 2: Food System (Weeks 5-8)
- Food database implementation
- Food search functionality
- Food diary CRUD operations


### Phase 3: Exercise System (Weeks 9-10)
- Exercise database
- Exercise logging
- Calorie burn calculations
- Activity tracking


### Phase 4: Goals & Progress (Weeks 11-12)
- Goal setting system
- Progress tracking
- Weight logging
- Dashboard analytics


### Phase 5: Polish & Optimization (Weeks 15-16)
- Security hardening
- Documentation completion


This documentation provides a comprehensive guide for building a MyFitnessPal-like backend system. The senior developer can use this as a roadmap to implement all core features.

