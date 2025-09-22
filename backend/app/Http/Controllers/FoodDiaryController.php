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

        $userGoal = \App\Models\UserGoal::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->first();

        $dailyCalorieGoal = $userGoal ? $userGoal->daily_calorie_goal : 2000; // Default to 2000 if no goal set

        return response()->json([
            'success' => true,
            'data' => [
                'entries' => $entries,
                'daily_calorie_goal' => $dailyCalorieGoal,
                'total_calories' => $entries->sum('calories')
            ],
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

        // Calculate calories
        $foodItem = \App\Models\FoodItem::find($request->food_item_id);
        $calories = $foodItem->calories_per_serving * $request->quantity;

        $entry = FoodDiaryEntry::create(array_merge($request->all(), [
            'user_id' => $request->user()->id,
            'calories' => $calories,
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

    public function quickAdd(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'meal_type' => 'required|in:breakfast,lunch,dinner,snack',
            'calories' => 'required|numeric|min:0',
            'logged_date' => 'required|date',
            'description' => 'nullable|string',
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

        $entry = FoodDiaryEntry::create([
            'user_id' => $request->user()->id,
            'meal_type' => $request->meal_type,
            'calories' => $request->calories,
            'logged_date' => $request->logged_date,
            'notes' => $request->description,
            'logged_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $entry,
            'message' => 'Quick food entry added successfully'
        ], 201);
    }

    public function copyYesterday(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'target_date' => 'required|date',
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

        $yesterday = \Carbon\Carbon::parse($request->target_date)->subDay()->toDateString();

        $yesterdayEntries = FoodDiaryEntry::where('user_id', $request->user()->id)
            ->where('logged_date', $yesterday)
            ->get();

        $copiedEntries = [];
        foreach ($yesterdayEntries as $entry) {
            $newEntry = FoodDiaryEntry::create([
                'user_id' => $request->user()->id,
                'food_item_id' => $entry->food_item_id,
                'meal_type' => $entry->meal_type,
                'quantity' => $entry->quantity,
                'serving_unit' => $entry->serving_unit,
                'calories' => $entry->calories,
                'logged_date' => $request->target_date,
                'notes' => $entry->notes,
                'logged_at' => now(),
            ]);
            $copiedEntries[] = $newEntry->load('foodItem');
        }

        return response()->json([
            'success' => true,
            'data' => $copiedEntries,
            'message' => 'Food diary entries copied from yesterday successfully'
        ], 201);
    }

    public function copyFromDate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'source_date' => 'required|date',
            'target_date' => 'required|date',
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

        $sourceEntries = FoodDiaryEntry::where('user_id', $request->user()->id)
            ->where('logged_date', $request->source_date)
            ->get();

        $copiedEntries = [];
        foreach ($sourceEntries as $entry) {
            $newEntry = FoodDiaryEntry::create([
                'user_id' => $request->user()->id,
                'food_item_id' => $entry->food_item_id,
                'meal_type' => $entry->meal_type,
                'quantity' => $entry->quantity,
                'serving_unit' => $entry->serving_unit,
                'calories' => $entry->calories,
                'logged_date' => $request->target_date,
                'notes' => $entry->notes,
                'logged_at' => now(),
            ]);
            $copiedEntries[] = $newEntry->load('foodItem');
        }

        return response()->json([
            'success' => true,
            'data' => $copiedEntries,
            'message' => 'Food diary entries copied from date successfully'
        ], 201);
    }

    public function copyToDate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'source_date' => 'required|date',
            'target_date' => 'required|date',
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

        $sourceEntries = FoodDiaryEntry::where('user_id', $request->user()->id)
            ->where('logged_date', $request->source_date)
            ->get();

        $copiedEntries = [];
        foreach ($sourceEntries as $entry) {
            $newEntry = FoodDiaryEntry::create([
                'user_id' => $request->user()->id,
                'food_item_id' => $entry->food_item_id,
                'meal_type' => $entry->meal_type,
                'quantity' => $entry->quantity,
                'serving_unit' => $entry->serving_unit,
                'calories' => $entry->calories,
                'logged_date' => $request->target_date,
                'notes' => $entry->notes,
                'logged_at' => now(),
            ]);
            $copiedEntries[] = $newEntry->load('foodItem');
        }

        return response()->json([
            'success' => true,
            'data' => $copiedEntries,
            'message' => 'Food diary entries copied to date successfully'
        ], 201);
    }
}
