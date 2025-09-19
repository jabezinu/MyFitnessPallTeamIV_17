<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExerciseDiaryEntry extends Model
{
    protected $fillable = [
        'user_id',
        'exercise_id',
        'duration_minutes',
        'calories_burned',
        'sets',
        'reps',
        'weight_used',
        'distance',
        'distance_unit',
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

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}
