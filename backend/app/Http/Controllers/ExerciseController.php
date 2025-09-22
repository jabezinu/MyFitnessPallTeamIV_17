<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExerciseController extends Controller
{
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'q' => 'nullable|string|min:1',
            'category' => 'nullable|in:cardio,strength,flexibility,sports',
            'limit' => 'nullable|integer|min:1|max:100',
            'offset' => 'nullable|integer|min:0',
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

        $query = Exercise::query();

        if ($request->has('q')) {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $limit = $request->get('limit', 20);
        $offset = $request->get('offset', 0);

        $exercises = $query->skip($offset)->take($limit)->get();
        $total = $query->count();

        return response()->json([
            'success' => true,
            'data' => [
                'results' => $exercises,
                'total' => $total,
                'page' => floor($offset / $limit) + 1,
                'per_page' => $limit
            ],
            'message' => 'Exercise search completed successfully'
        ]);
    }

    public function categories()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'cardio',
                'strength',
                'flexibility',
                'sports'
            ],
            'message' => 'Exercise categories retrieved successfully'
        ]);
    }

    public function myExercises(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'q' => 'nullable|string|min:1',
            'limit' => 'nullable|integer|min:1|max:100',
            'offset' => 'nullable|integer|min:0',
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

        $query = $request->get('q', '');
        $limit = $request->get('limit', 20);
        $offset = $request->get('offset', 0);

        $exercises = Exercise::where('created_by', $request->user()->id)
            ->where('name', 'like', '%' . $query . '%')
            ->skip($offset)
            ->take($limit)
            ->get();

        $total = Exercise::where('created_by', $request->user()->id)
            ->where('name', 'like', '%' . $query . '%')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'results' => $exercises,
                'total' => $total,
                'page' => floor($offset / $limit) + 1,
                'per_page' => $limit
            ],
            'message' => 'My exercises search completed successfully'
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category' => 'required|in:cardio,strength,flexibility,sports',
            'met_value' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'muscle_groups' => 'nullable|array',
            'equipment_needed' => 'nullable|array',
            'difficulty_level' => 'nullable|string',
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

        $exercise = Exercise::create(array_merge($request->all(), [
            'created_by' => $request->user()->id,
        ]));

        return response()->json([
            'success' => true,
            'data' => $exercise,
            'message' => 'Exercise created successfully'
        ], 201);
    }
}
