<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserGoal extends Model
{
    protected $fillable = [
        'user_id',
        'goal_type',
        'target_weight_kg',
        'target_date',
        'weekly_goal_kg',
        'daily_calorie_goal',
        'daily_protein_goal',
        'daily_carbs_goal',
        'daily_fat_goal',
        'daily_exercise_minutes',
        'is_active',
    ];

    protected $casts = [
        'target_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
