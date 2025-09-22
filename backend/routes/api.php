<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ExerciseDiaryController;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\FoodDiaryController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WeightLogController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/auth/refresh-token', [AuthController::class, 'refreshToken']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User profile
    Route::get('/users/profile', [UserController::class, 'profile']);
    Route::put('/users/profile', [UserController::class, 'updateProfile']);
    Route::post('/users/profile-image', [UserController::class, 'uploadProfileImage']);

    // Food
    Route::get('/foods/search', [FoodController::class, 'search']);
    Route::post('/foods', [FoodController::class, 'store']);

    // Food diary
    Route::get('/food-diary', [FoodDiaryController::class, 'index']);
    Route::post('/food-diary', [FoodDiaryController::class, 'store']);
    Route::put('/food-diary/{entry}', [FoodDiaryController::class, 'update']);
    Route::delete('/food-diary/{entry}', [FoodDiaryController::class, 'destroy']);
    Route::post('/food-diary/quick-add', [FoodDiaryController::class, 'quickAdd']);
    Route::post('/food-diary/copy-yesterday', [FoodDiaryController::class, 'copyYesterday']);
    Route::post('/food-diary/copy-from-date', [FoodDiaryController::class, 'copyFromDate']);
    Route::post('/food-diary/copy-to-date', [FoodDiaryController::class, 'copyToDate']);

    // Exercises
    Route::get('/exercises/search', [ExerciseController::class, 'search']);
    Route::get('/exercises/categories', [ExerciseController::class, 'categories']);

    // Exercise diary
    Route::get('/exercise-diary', [ExerciseDiaryController::class, 'index']);
    Route::post('/exercise-diary', [ExerciseDiaryController::class, 'store']);
    Route::put('/exercise-diary/{entry}', [ExerciseDiaryController::class, 'update']);
    Route::delete('/exercise-diary/{entry}', [ExerciseDiaryController::class, 'destroy']);
    Route::post('/exercise-diary/cardio', [ExerciseDiaryController::class, 'storeCardio']);
    Route::post('/exercise-diary/strength', [ExerciseDiaryController::class, 'storeStrength']);

    // Goals
    Route::get('/users/goals', [GoalController::class, 'index']);
    Route::post('/users/goals', [GoalController::class, 'store']);
    Route::put('/users/goals/{goal}', [GoalController::class, 'update']);

    // Weight logs
    Route::get('/users/weight-logs', [WeightLogController::class, 'index']);
    Route::post('/users/weight-logs', [WeightLogController::class, 'store']);
    Route::put('/users/weight-logs/{id}', [WeightLogController::class, 'update']);

    // Dashboard
    Route::get('/users/daily-summary', [DashboardController::class, 'dailySummary']);
    Route::get('/users/progress', [UserController::class, 'progress']);
});