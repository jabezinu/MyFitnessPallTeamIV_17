<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'username' => 'required|unique:users',
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'height_cm' => 'nullable|integer|min:50|max:300',
            'current_weight_kg' => 'nullable|numeric|min:20|max:500',
            'goal_weight_kg' => 'nullable|numeric|min:20|max:500',
            'activity_level' => 'nullable|in:sedentary,lightly_active,moderately_active,very_active,extra_active',
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

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'username' => $request->username,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'height_cm' => $request->height_cm,
            'current_weight_kg' => $request->current_weight_kg,
            'goal_weight_kg' => $request->goal_weight_kg,
            'activity_level' => $request->activity_level,
            'email_verified' => false, // In real app, send verification email
        ]);

        $token = $user->createToken('API Token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => $token
            ],
            'message' => 'User registered successfully'
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
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

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INVALID_CREDENTIALS',
                    'message' => 'Invalid email or password'
                ]
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('API Token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => $token
            ],
            'message' => 'Login successful'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function refreshToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'refresh_token' => 'required|string',
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

        // In a real implementation, you'd validate the refresh token
        // For simplicity, we'll just create a new token for the authenticated user
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'INVALID_TOKEN',
                    'message' => 'Invalid refresh token'
                ]
            ], 401);
        }

        // Delete current token and create new one
        $request->user()->currentAccessToken()->delete();
        $token = $user->createToken('API Token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token
            ],
            'message' => 'Token refreshed successfully'
        ]);
    }
}
