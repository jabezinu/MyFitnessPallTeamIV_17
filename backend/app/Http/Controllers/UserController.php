<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function profile(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
            'message' => 'Profile retrieved successfully'
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'height_cm' => 'nullable|integer|min:50|max:300',
            'activity_level' => 'nullable|in:sedentary,lightly_active,moderately_active,very_active,extremely_active',
            'timezone' => 'nullable|string',
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

        $user->update($request->only([
            'first_name',
            'last_name',
            'height_cm',
            'activity_level',
            'timezone'
        ]));

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Profile updated successfully'
        ]);
    }

    public function uploadProfileImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'profile_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
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

        $user = $request->user();

        if ($request->hasFile('profile_image')) {
            $image = $request->file('profile_image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('public/profile_images', $imageName);

            $user->update(['profile_image_url' => $imageName]);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'Profile image uploaded successfully'
        ]);
    }

    public function progress(Request $request)
    {
        $user = $request->user();
        $period = $request->query('period', 'weekly');
        $weeks = $request->query('weeks', 12);

        // This is a simplified implementation
        // In a real app, you'd calculate actual progress data
        $data = [
            'period' => $period,
            'data' => [
                [
                    'week_start' => '2024-01-01',
                    'avg_calories_consumed' => 1850,
                    'avg_calories_goal' => 1800,
                    'avg_weight' => 73.2,
                    'total_exercise_minutes' => 180,
                    'weight_change' => -0.3
                ]
            ],
            'summary' => [
                'total_weight_lost' => 2.1,
                'avg_weekly_loss' => 0.35,
                'goal_adherence_rate' => 0.85
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Progress data retrieved successfully'
        ]);
    }
}
