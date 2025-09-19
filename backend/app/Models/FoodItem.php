<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FoodItem extends Model
{
    protected $fillable = [
        'name',
        'brand',
        'serving_size',
        'serving_unit',
        'calories_per_serving',
        'protein_g',
        'carbs_g',
        'fat_g',
        'fiber_g',
        'sugar_g',
        'sodium_mg',
        'vitamins',
        'minerals',
        'food_category_id',
        'verified',
        'created_by',
    ];

    protected $casts = [
        'vitamins' => 'array',
        'minerals' => 'array',
        'verified' => 'boolean',
    ];

    public function foodCategory(): BelongsTo
    {
        return $this->belongsTo(FoodCategory::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function foodDiaryEntries(): HasMany
    {
        return $this->hasMany(FoodDiaryEntry::class);
    }

    public function recipeIngredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class);
    }
}
