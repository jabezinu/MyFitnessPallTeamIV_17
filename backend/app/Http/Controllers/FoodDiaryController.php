<?php

namespace App\Http\Controllers;

use App\Models\FoodDiaryEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FoodDiaryController extends Controller
{
    public function index(Request $request)
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

        $entries = FoodDiaryEntry::with('foodItem')
            ->where('user_id', $request->user()->id)
            ->where('logged_date', $date)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $entries,
            'message' => 'Food diary entries retrieved successfully'
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'food_item_id' => 'required|exists:food_items,id',
            'meal_type' => 'required|in:breakfast,lunch,dinner,snack',
            'quantity' => 'required|numeric|min:0',
            'serving_unit' => 'required|string|max:50',
            'logged_date' => 'required|date',
            'notes' => 'nullable|string',
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

        $entry = FoodDiaryEntry::create(array_merge($request->all(), [
            'user_id' => $request->user()->id,
            'logged_at' => now(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $entry->load('foodItem'),
            'message' => 'Food diary entry created successfully'
        ], 201);
    }

    public function update(Request $request, FoodDiaryEntry $entry)
    {
        if ($entry->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'FORBIDDEN',
                    'message' => 'You do not have permission to update this entry'
                ]
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'meal_type' => 'nullable|in:breakfast,lunch,dinner,snack',
            'quantity' => 'nullable|numeric|min:0',
            'serving_unit' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
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

        $entry->update($request->only(['meal_type', 'quantity', 'serving_unit', 'notes']));

        return response()->json([
            'success' => true,
            'data' => $entry->load('foodItem'),
            'message' => 'Food diary entry updated successfully'
        ]);
    }

    public function destroy(Request $request, FoodDiaryEntry $entry)
    {
        if ($entry->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'FORBIDDEN',
                    'message' => 'You do not have permission to delete this entry'
                ]
            ], 403);
        }

        $entry->delete();

        return response()->json([
            'success' => true,
            'message' => 'Food diary entry deleted successfully'
        ]);
    }
}
