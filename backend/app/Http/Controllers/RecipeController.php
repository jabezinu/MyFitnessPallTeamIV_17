<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RecipeController extends Controller
{
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string',
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

        $query = Recipe::with(['user', 'recipeIngredients.foodItem']);

        // Show public recipes or user's own recipes
        $query->where(function ($q) use ($request) {
            $q->where('is_public', true)
              ->orWhere('user_id', $request->user()->id);
        });

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('name', 'like', '%' . $search . '%');
        }

        $limit = $request->get('limit', 20);
        $offset = $request->get('offset', 0);

        $recipes = $query->skip($offset)->take($limit)->get();
        $total = $query->count();

        return response()->json([
            'success' => true,
            'data' => [
                'recipes' => $recipes,
                'total' => $total,
                'page' => floor($offset / $limit) + 1,
                'per_page' => $limit
            ],
            'message' => 'Recipes retrieved successfully'
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'prep_time_minutes' => 'nullable|integer|min:0',
            'cook_time_minutes' => 'nullable|integer|min:0',
            'servings' => 'nullable|integer|min:1',
            'image_url' => 'nullable|url',
            'is_public' => 'boolean',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.food_item_id' => 'required|exists:food_items,id',
            'ingredients.*.quantity' => 'required|numeric|min:0',
            'ingredients.*.unit' => 'required|string|max:50',
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

        // Calculate total calories
        $totalCalories = 0;
        foreach ($request->ingredients as $ingredient) {
            $foodItem = \App\Models\FoodItem::find($ingredient['food_item_id']);
            $multiplier = $ingredient['quantity'] / $foodItem->serving_size;
            $totalCalories += $foodItem->calories_per_serving * $multiplier;
        }

        $recipe = Recipe::create(array_merge($request->only([
            'name', 'description', 'instructions', 'prep_time_minutes',
            'cook_time_minutes', 'servings', 'image_url', 'is_public'
        ]), [
            'user_id' => $request->user()->id,
            'total_calories' => $totalCalories,
        ]));

        // Create recipe ingredients
        foreach ($request->ingredients as $ingredient) {
            RecipeIngredient::create([
                'recipe_id' => $recipe->id,
                'food_item_id' => $ingredient['food_item_id'],
                'quantity' => $ingredient['quantity'],
                'unit' => $ingredient['unit'],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $recipe->load(['user', 'recipeIngredients.foodItem']),
            'message' => 'Recipe created successfully'
        ], 201);
    }

    public function show(Request $request, Recipe $recipe)
    {
        // Check if user can view this recipe
        if (!$recipe->is_public && $recipe->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'FORBIDDEN',
                    'message' => 'You do not have permission to view this recipe'
                ]
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $recipe->load(['user', 'recipeIngredients.foodItem']),
            'message' => 'Recipe retrieved successfully'
        ]);
    }

    public function update(Request $request, Recipe $recipe)
    {
        if ($recipe->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'FORBIDDEN',
                    'message' => 'You do not have permission to update this recipe'
                ]
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'prep_time_minutes' => 'nullable|integer|min:0',
            'cook_time_minutes' => 'nullable|integer|min:0',
            'servings' => 'nullable|integer|min:1',
            'image_url' => 'nullable|url',
            'is_public' => 'boolean',
            'ingredients' => 'nullable|array|min:1',
            'ingredients.*.food_item_id' => 'required|exists:food_items,id',
            'ingredients.*.quantity' => 'required|numeric|min:0',
            'ingredients.*.unit' => 'required|string|max:50',
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

        $recipe->update($request->only([
            'name', 'description', 'instructions', 'prep_time_minutes',
            'cook_time_minutes', 'servings', 'image_url', 'is_public'
        ]));

        // Update ingredients if provided
        if ($request->has('ingredients')) {
            // Delete existing ingredients
            $recipe->recipeIngredients()->delete();

            // Calculate total calories
            $totalCalories = 0;
            foreach ($request->ingredients as $ingredient) {
                $foodItem = \App\Models\FoodItem::find($ingredient['food_item_id']);
                $multiplier = $ingredient['quantity'] / $foodItem->serving_size;
                $totalCalories += $foodItem->calories_per_serving * $multiplier;
            }

            $recipe->update(['total_calories' => $totalCalories]);

            // Create new ingredients
            foreach ($request->ingredients as $ingredient) {
                RecipeIngredient::create([
                    'recipe_id' => $recipe->id,
                    'food_item_id' => $ingredient['food_item_id'],
                    'quantity' => $ingredient['quantity'],
                    'unit' => $ingredient['unit'],
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $recipe->load(['user', 'recipeIngredients.foodItem']),
            'message' => 'Recipe updated successfully'
        ]);
    }

    public function destroy(Request $request, Recipe $recipe)
    {
        if ($recipe->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'FORBIDDEN',
                    'message' => 'You do not have permission to delete this recipe'
                ]
            ], 403);
        }

        $recipe->delete();

        return response()->json([
            'success' => true,
            'message' => 'Recipe deleted successfully'
        ]);
    }

    public function myRecipes(Request $request)
    {
        $validator = Validator::make($request->all(), [
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

        $limit = $request->get('limit', 20);
        $offset = $request->get('offset', 0);

        $recipes = Recipe::with(['recipeIngredients.foodItem'])
            ->where('user_id', $request->user()->id)
            ->skip($offset)
            ->take($limit)
            ->get();

        $total = Recipe::where('user_id', $request->user()->id)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'recipes' => $recipes,
                'total' => $total,
                'page' => floor($offset / $limit) + 1,
                'per_page' => $limit
            ],
            'message' => 'User recipes retrieved successfully'
        ]);
    }
}