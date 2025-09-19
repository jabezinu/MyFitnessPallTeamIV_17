<?php

namespace App\Http\Controllers;

use App\Models\ExerciseDiaryEntry;
use App\Models\FoodDiaryEntry;
use App\Models\UserGoal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DashboardController extends Controller
{
    public function dailySummary(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Invalid input data',
                    'details' => $validator->errors()
                ]
            ], 400);
        }

        $date = $request->get('date', now()->toDateString());
        $userId = $request->user()->id;

        // Get active goal
        $goal = UserGoal::where('user_id', $userId)
            ->where('is_active', true)
            ->first();

        // Calculate consumed nutrients
        $foodEntries = FoodDiaryEntry::with('foodItem')
            ->where('user_id', $userId)
            ->where('logged_date', $date)
            ->get();

        $consumed = [
            'calories' => 0,
            'protein' => 0,
            'carbs' => 0,
            'fat' => 0,
        ];

        $meals = [
            'breakfast' => ['calories' => 0, 'entries' => 0],
            'lunch' => ['calories' => 0, 'entries' => 0],
            'dinner' => ['calories' => 0, 'entries' => 0],
            'snacks' => ['calories' => 0, 'entries' => 0],
        ];

        foreach ($foodEntries as $entry) {
            $quantity = $entry->quantity;
            $calories = ($entry->foodItem->calories_per_serving * $quantity);
            $protein = ($entry->foodItem->protein_g ?? 0) * $quantity;
            $carbs = ($entry->foodItem->carbs_g ?? 0) * $quantity;
            $fat = ($entry->foodItem->fat_g ?? 0) * $quantity;

            $consumed['calories'] += $calories;
            $consumed['protein'] += $protein;
            $consumed['carbs'] += $carbs;
            $consumed['fat'] += $fat;

            $meals[$entry->meal_type]['calories'] += $calories;
            $meals[$entry->meal_type]['entries']++;
        }

        // Calculate exercise calories
        $exerciseEntries = ExerciseDiaryEntry::where('user_id', $userId)
            ->where('logged_date', $date)
            ->get();

        $exerciseCalories = $exerciseEntries->sum('calories_burned');
        $totalExerciseMinutes = $exerciseEntries->sum('duration_minutes');

        $netCalories = $consumed['calories'] - $exerciseCalories;

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date,
                'goals' => $goal ? [
                    'calories' => $goal->daily_calorie_goal,
                    'protein' => $goal->daily_protein_goal,
                    'carbs' => $goal->daily_carbs_goal,
                    'fat' => $goal->daily_fat_goal,
                ] : null,
                'consumed' => $consumed,
                'exercise_calories_burned' => $exerciseCalories,
                'net_calories' => $netCalories,
                'meals' => $meals,
                'exercises' => [
                    'total_duration' => $totalExerciseMinutes,
                    'total_calories' => $exerciseCalories,
                    'entries' => $exerciseEntries->count(),
                ],
            ],
            'message' => 'Daily summary retrieved successfully'
        ]);
    }
}
