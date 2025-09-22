<?php

namespace App\Http\Controllers;

use App\Models\WeightLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WeightLogController extends Controller
{
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'period' => 'nullable|integer|min:1|max:365',
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

        $period = $request->get('period', 30);
        $startDate = now()->subDays($period);

        $logs = WeightLog::where('user_id', $request->user()->id)
            ->where('logged_date', '>=', $startDate->toDateString())
            ->orderBy('logged_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $logs,
            'message' => 'Weight logs retrieved successfully'
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'weight_kg' => 'required|numeric|min:30|max:500',
            'neck_cm' => 'nullable|numeric|min:20|max:100',
            'waist_cm' => 'nullable|numeric|min:40|max:200',
            'hips_cm' => 'nullable|numeric|min:50|max:200',
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

        // Check if log already exists for this date
        $existing = WeightLog::where('user_id', $request->user()->id)
            ->where('logged_date', $request->logged_date)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'DUPLICATE_ENTRY',
                    'message' => 'Weight log already exists for this date'
                ]
            ], 409);
        }

        $log = WeightLog::create(array_merge($request->all(), [
            'user_id' => $request->user()->id,
            'logged_at' => now(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $log,
            'message' => 'Weight log created successfully'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $log = WeightLog::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'weight_kg' => 'required|numeric|min:30|max:500',
            'neck_cm' => 'nullable|numeric|min:20|max:100',
            'waist_cm' => 'nullable|numeric|min:40|max:200',
            'hips_cm' => 'nullable|numeric|min:50|max:200',
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

        // Check if another log exists for this date (excluding current log)
        $existing = WeightLog::where('user_id', $request->user()->id)
            ->where('logged_date', $request->logged_date)
            ->where('id', '!=', $id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'DUPLICATE_ENTRY',
                    'message' => 'Weight log already exists for this date'
                ]
            ], 409);
        }

        $log->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $log,
            'message' => 'Weight log updated successfully'
        ]);
    }
}
