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
9. [External Integrations](#external-integrations)
10. [Performance & Scalability](#performance--scalability)
11. [Deployment & Infrastructure](#deployment--infrastructure)


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
- **Food Database**: Comprehensive database with barcode scanning
- **Exercise Logging**: Activity tracking with calorie burn calculations
- **Goal Management**: Weight loss, muscle gain, maintenance goals
- **Analytics**: Progress reports, trends, insights
- **Mobile & Web Support**: Cross-platform API support


## Architecture


### Technology Stack
```
Backend Framework: [Your chosen framework - e.g., Node.js/Express, Django, Spring Boot]
Database: PostgreSQL (Primary) + Redis (Caching)
Authentication: JWT + OAuth 2.0
File Storage: AWS S3 / CloudStorage
Search Engine: Elasticsearch (for food search)
Queue System: Redis Queue / AWS SQS
Monitoring: Application monitoring and logging
```


### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │    │    Web Client    │    │  Admin Panel    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   Load Balancer  │
                    └──────────────────┘
                                 │
                    ┌──────────────────┐
                    │   API Gateway    │
                    └──────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Authentication  │    │   Core API       │    │  External APIs  │
│   Service       │    │   Service        │    │   Service       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   Database       │
                    │   PostgreSQL     │
                    └──────────────────┘
```


## Database Design


### Core Entities


#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(10),
    height_cm INTEGER,
    activity_level VARCHAR(20) DEFAULT 'sedentary',
    timezone VARCHAR(50),
    profile_image_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    privacy_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```


#### Food Items Table
```sql
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    barcode VARCHAR(50),
    serving_size DECIMAL(10,2),
    serving_unit VARCHAR(50),
    calories_per_serving DECIMAL(8,2),
    protein_g DECIMAL(8,2),
    carbs_g DECIMAL(8,2),
    fat_g DECIMAL(8,2),
    fiber_g DECIMAL(8,2),
    sugar_g DECIMAL(8,2),
    sodium_mg DECIMAL(8,2),
    vitamins JSONB,
    minerals JSONB,
    food_category_id UUID REFERENCES food_categories(id),
    verified BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE INDEX idx_food_items_name ON food_items USING gin(to_tsvector('english', name));
CREATE INDEX idx_food_items_barcode ON food_items(barcode);
```


#### Food Categories Table
```sql
CREATE TABLE food_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES food_categories(id),
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```


#### Food Diary Entries
```sql
CREATE TABLE food_diary_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id),
    meal_type VARCHAR(20) NOT NULL, -- breakfast, lunch, dinner, snack
    quantity DECIMAL(10,2) NOT NULL,
    serving_unit VARCHAR(50) NOT NULL,
    logged_date DATE NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);


CREATE INDEX idx_food_diary_user_date ON food_diary_entries(user_id, logged_date);
```


#### Exercise Database
```sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- cardio, strength, flexibility, sports
    met_value DECIMAL(4,2), -- Metabolic equivalent
    description TEXT,
    instructions TEXT,
    muscle_groups TEXT[],
    equipment_needed TEXT[],
    difficulty_level VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```


#### Exercise Diary Entries
```sql
CREATE TABLE exercise_diary_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    duration_minutes INTEGER,
    calories_burned DECIMAL(8,2),
    sets INTEGER,
    reps INTEGER,
    weight_used DECIMAL(8,2),
    distance DECIMAL(10,2),
    distance_unit VARCHAR(20),
    logged_date DATE NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);


CREATE INDEX idx_exercise_diary_user_date ON exercise_diary_entries(user_id, logged_date);
```


#### User Goals
```sql
CREATE TABLE user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL, -- weight_loss, weight_gain, maintain, muscle_gain
    target_weight_kg DECIMAL(5,2),
    target_date DATE,
    weekly_goal_kg DECIMAL(4,2),
    daily_calorie_goal INTEGER,
    daily_protein_goal DECIMAL(6,2),
    daily_carbs_goal DECIMAL(6,2),
    daily_fat_goal DECIMAL(6,2),
    daily_exercise_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```


#### Weight Logs
```sql
CREATE TABLE weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL,
    logged_date DATE NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);


CREATE UNIQUE INDEX idx_weight_logs_user_date ON weight_logs(user_id, logged_date);
```




#### Recipes
```sql
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    servings INTEGER,
    image_url TEXT,
    is_public BOOLEAN DEFAULT false,
    total_calories DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL
);
```


## Authentication & Security


### JWT Token Structure
```json
{
  "user_id": "uuid",
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
      "id": "uuid",
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


#### GET /api/foods/barcode/{barcode}
Returns food item by barcode scan.


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
  "food_item_id": "uuid",
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
  "exercise_id": "uuid",
  "duration_minutes": 30,
  "calories_burned": 300,
  "logged_date": "2024-01-15",
  "notes": "Morning run"
}
```


#### POST /api/exercise-diary/cardio
```json
{
  "exercise_id": "uuid",
  "duration_minutes": 45,
  "distance": 5.2,
  "distance_unit": "km",
  "logged_date": "2024-01-15"
}
```


#### POST /api/exercise-diary/strength
```json
{
  "exercise_id": "uuid",
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




## External Integrations


### Barcode Scanning
Integration with barcode databases:
- OpenFoodFacts API
- USDA Food Database
- Custom barcode database


### Fitness Device Integration
- Fitbit API integration
- Apple Health integration
- Google Fit integration
- Generic webhook support for IoT devices


### Third-party Authentication
- Google OAuth 2.0
- Facebook Login
- Apple Sign In


## Performance & Scalability


### Caching Strategy
```yaml
User Sessions: Redis (30 min TTL)
Food Search Results: Redis (1 hour TTL)
Daily Summaries: Redis (5 min TTL)
Exercise Database: Application cache (24 hour TTL)
User Profiles: Application cache (15 min TTL)
```


### Database Optimization
- Proper indexing on frequently queried columns
- Partitioning for large tables (food_diary_entries by date)
- Read replicas for analytics queries
- Connection pooling


### API Performance
- Response compression (gzip)
- Pagination for large datasets
- Async processing for heavy operations
- Rate limiting by user tier


### Monitoring & Logging
- Application performance monitoring
- Database query monitoring
- API endpoint response times
- Error tracking and alerting
- User activity analytics


## Deployment & Infrastructure


### Environment Configuration
```yaml
# Development
DATABASE_URL: postgresql://localhost/myfitnesspal_dev
REDIS_URL: redis://localhost:6379
JWT_SECRET: dev_secret_key


# Production
DATABASE_URL: postgresql://prod-db/myfitnesspal
REDIS_URL: redis://prod-redis:6379
JWT_SECRET: secure_production_secret
```


### Docker Configuration
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```


### Database Migrations
Implement proper migration system for schema changes:
- Version controlled migrations
- Rollback capabilities
- Production migration procedures


### Health Checks
```yaml
GET /health:
  - Database connectivity
  - Redis connectivity
  - External API availability
  - System resources
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
- Barcode scanning integration


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
- Performance optimization
- Security hardening
- Documentation completion
- Deployment preparation


This documentation provides a comprehensive guide for building a MyFitnessPal-like backend system. The senior developer can use this as a roadmap to implement all core features while maintaining scalability and performance standards.

