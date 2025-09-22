<?php

namespace App\Http\Controllers;

use App\Models\FoodItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FoodController extends Controller
{
    public function search(Request $request)
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

        $foods = FoodItem::where('name', 'like', '%' . $query . '%')
            ->orWhere('brand', 'like', '%' . $query . '%')
            ->skip($offset)
            ->take($limit)
            ->get();

        $total = FoodItem::where('name', 'like', '%' . $query . '%')
            ->orWhere('brand', 'like', '%' . $query . '%')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'results' => $foods,
                'total' => $total,
                'page' => floor($offset / $limit) + 1,
                'per_page' => $limit
            ],
            'message' => 'Food search completed successfully'
        ]);
    }

    public function myFoods(Request $request)
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

        $foods = FoodItem::where('created_by', $request->user()->id)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', '%' . $query . '%')
                  ->orWhere('brand', 'like', '%' . $query . '%');
            })
            ->skip($offset)
            ->take($limit)
            ->get();

        $total = FoodItem::where('created_by', $request->user()->id)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', '%' . $query . '%')
                  ->orWhere('brand', 'like', '%' . $query . '%');
            })
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'results' => $foods,
                'total' => $total,
                'page' => floor($offset / $limit) + 1,
                'per_page' => $limit
            ],
            'message' => 'My foods search completed successfully'
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'serving_size' => 'required|numeric|min:0',
            'serving_unit' => 'required|string|max:50',
            'calories_per_serving' => 'required|numeric|min:0',
            'protein_g' => 'nullable|numeric|min:0',
            'carbs_g' => 'nullable|numeric|min:0',
            'fat_g' => 'nullable|numeric|min:0',
            'fiber_g' => 'nullable|numeric|min:0',
            'sugar_g' => 'nullable|numeric|min:0',
            'sodium_mg' => 'nullable|numeric|min:0',
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

        $food = FoodItem::create(array_merge($request->all(), [
            'created_by' => $request->user()->id,
            'verified' => false
        ]));

        return response()->json([
            'success' => true,
            'data' => $food,
            'message' => 'Food item created successfully'
        ], 201);
    }
}
