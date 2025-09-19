<?php

namespace App\Http\Controllers;

use App\Models\UserGoal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GoalController extends Controller
{
    public function index(Request $request)
    {
        $goals = UserGoal::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $goals,
            'message' => 'Goals retrieved successfully'
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'goal_type' => 'required|in:weight_loss,weight_gain,maintain,muscle_gain',
            'target_weight_kg' => 'nullable|numeric|min:30|max:500',
            'target_date' => 'nullable|date|after:today',
            'weekly_goal_kg' => 'nullable|numeric|min:-5|max:5',
            'daily_calorie_goal' => 'nullable|integer|min:500|max:10000',
            'daily_protein_goal' => 'nullable|numeric|min:0|max:1000',
            'daily_carbs_goal' => 'nullable|numeric|min:0|max:1000',
            'daily_fat_goal' => 'nullable|numeric|min:0|max:500',
            'daily_exercise_minutes' => 'nullable|integer|min:0|max:1440',
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

        // Deactivate existing goals
        UserGoal::where('user_id', $request->user()->id)->update(['is_active' => false]);

        $goal = UserGoal::create(array_merge($request->all(), [
            'user_id' => $request->user()->id,
            'is_active' => true,
        ]));

        return response()->json([
            'success' => true,
            'data' => $goal,
            'message' => 'Goal created successfully'
        ], 201);
    }

    public function update(Request $request, UserGoal $goal)
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'FORBIDDEN',
                    'message' => 'You do not have permission to update this goal'
                ]
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'goal_type' => 'nullable|in:weight_loss,weight_gain,maintain,muscle_gain',
            'target_weight_kg' => 'nullable|numeric|min:30|max:500',
            'target_date' => 'nullable|date|after:today',
            'weekly_goal_kg' => 'nullable|numeric|min:-5|max:5',
            'daily_calorie_goal' => 'nullable|integer|min:500|max:10000',
            'daily_protein_goal' => 'nullable|numeric|min:0|max:1000',
            'daily_carbs_goal' => 'nullable|numeric|min:0|max:1000',
            'daily_fat_goal' => 'nullable|numeric|min:0|max:500',
            'daily_exercise_minutes' => 'nullable|integer|min:0|max:1440',
            'is_active' => 'nullable|boolean',
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

        $goal->update($request->only([
            'goal_type',
            'target_weight_kg',
            'target_date',
            'weekly_goal_kg',
            'daily_calorie_goal',
            'daily_protein_goal',
            'daily_carbs_goal',
            'daily_fat_goal',
            'daily_exercise_minutes',
            'is_active'
        ]));

        return response()->json([
            'success' => true,
            'data' => $goal,
            'message' => 'Goal updated successfully'
        ]);
    }
}
