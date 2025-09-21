<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FoodDiaryEntry extends Model
{
    protected $fillable = [
        'user_id',
        'food_item_id',
        'meal_type',
        'quantity',
        'serving_unit',
        'calories',
        'logged_date',
        'logged_at',
        'notes',
    ];

    protected $casts = [
        'logged_date' => 'date',
        'logged_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function foodItem(): BelongsTo
    {
        return $this->belongsTo(FoodItem::class);
    }
}
