<?php

namespace App\Http\Controllers;

use App\Models\ExerciseDiaryEntry;
use App\Models\DailyExerciseNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExerciseDiaryController extends Controller
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

        $entries = ExerciseDiaryEntry::with('exercise')
            ->where('user_id', $request->user()->id)
            ->whereDate('logged_date', $date)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $entries,
            'message' => 'Exercise diary entries retrieved successfully'
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'exercise_id' => 'required|exists:exercises,id',
            'duration_minutes' => 'nullable|integer|min:1',
            'calories_burned' => 'nullable|numeric|min:0',
            'sets' => 'nullable|integer|min:1',
            'reps' => 'nullable|integer|min:1',
            'weight_used' => 'nullable|numeric|min:0',
            'distance' => 'nullable|numeric|min:0',
            'distance_unit' => 'nullable|string|max:10',
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

        // Calculate calories if not provided
        $data = $request->all();
        if (!isset($data['calories_burned']) || $data['calories_burned'] === null) {
            $exercise = \App\Models\Exercise::find($request->exercise_id);
            if ($exercise && isset($data['duration_minutes'])) {
                // Rough calculation: calories = MET * weight_kg * hours
                // Using average weight of 70kg for calculation
                $hours = $data['duration_minutes'] / 60;
                $data['calories_burned'] = round($exercise->met_value * 70 * $hours);
            }
        }

        $entry = ExerciseDiaryEntry::create(array_merge($data, [
            'user_id' => $request->user()->id,
            'logged_at' => now(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $entry->load('exercise'),
            'message' => 'Exercise diary entry created successfully'
        ], 201);
    }

    public function update(Request $request, ExerciseDiaryEntry $entry)
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
            'duration_minutes' => 'nullable|integer|min:1',
            'calories_burned' => 'nullable|numeric|min:0',
            'sets' => 'nullable|integer|min:1',
            'reps' => 'nullable|integer|min:1',
            'weight_used' => 'nullable|numeric|min:0',
            'distance' => 'nullable|numeric|min:0',
            'distance_unit' => 'nullable|string|max:10',
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

        $entry->update($request->only([
            'duration_minutes',
            'calories_burned',
            'sets',
            'reps',
            'weight_used',
            'distance',
            'distance_unit',
            'notes'
        ]));

        return response()->json([
            'success' => true,
            'data' => $entry->load('exercise'),
            'message' => 'Exercise diary entry updated successfully'
        ]);
    }

    public function destroy(Request $request, ExerciseDiaryEntry $entry)
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
            'message' => 'Exercise diary entry deleted successfully'
        ]);
    }

    public function storeCardio(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'exercise_id' => 'required|exists:exercises,id',
            'duration_minutes' => 'required|integer|min:1',
            'distance' => 'nullable|numeric|min:0',
            'distance_unit' => 'nullable|string|max:10',
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

        $data = $request->all();

        // Calculate calories if not provided
        if (!isset($data['calories_burned']) || $data['calories_burned'] === null) {
            $exercise = \App\Models\Exercise::find($request->exercise_id);
            if ($exercise && isset($data['duration_minutes'])) {
                // Rough calculation: calories = MET * weight_kg * hours
                // Using average weight of 70kg for calculation
                $hours = $data['duration_minutes'] / 60;
                $data['calories_burned'] = round($exercise->met_value * 70 * $hours);
            }
        }

        $entry = ExerciseDiaryEntry::create(array_merge($data, [
            'user_id' => $request->user()->id,
            'logged_at' => now(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $entry->load('exercise'),
            'message' => 'Cardio exercise entry created successfully'
        ], 201);
    }

    public function storeStrength(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'exercise_id' => 'required|exists:exercises,id',
            'sets' => 'required|integer|min:1',
            'reps' => 'required|integer|min:1',
            'weight_used' => 'nullable|numeric|min:0',
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

        $data = $request->all();

        // Calculate calories if not provided (rough estimate for strength training)
        if (!isset($data['calories_burned']) || $data['calories_burned'] === null) {
            $exercise = \App\Models\Exercise::find($request->exercise_id);
            if ($exercise && isset($data['sets']) && isset($data['reps'])) {
                // Rough calculation: calories = MET * weight_kg * hours
                // Estimate time based on sets/reps, using average weight of 70kg
                $estimatedMinutes = ($data['sets'] * $data['reps']) * 0.5; // rough estimate
                $hours = $estimatedMinutes / 60;
                $data['calories_burned'] = round($exercise->met_value * 70 * $hours);
            }
        }

        $entry = ExerciseDiaryEntry::create(array_merge($data, [
            'user_id' => $request->user()->id,
            'logged_at' => now(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $entry->load('exercise'),
            'message' => 'Strength exercise entry created successfully'
        ], 201);
    }

    public function getDailyNotes(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
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

        $note = DailyExerciseNote::where('user_id', $request->user()->id)
            ->where('date', $request->date)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $note ? $note->notes : '',
            'message' => 'Daily exercise notes retrieved successfully'
        ]);
    }

    public function saveDailyNotes(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
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

        $note = DailyExerciseNote::where('user_id', $request->user()->id)
            ->whereDate('date', $request->date)
            ->first();

        if ($note) {
            $note->update(['notes' => $request->notes]);
        } else {
            $note = DailyExerciseNote::create([
                'user_id' => $request->user()->id,
                'date' => $request->date,
                'notes' => $request->notes,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $note,
            'message' => 'Daily exercise notes saved successfully'
        ]);
    }
}
