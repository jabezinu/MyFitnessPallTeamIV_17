<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeightLog extends Model
{
    protected $fillable = [
        'user_id',
        'weight_kg',
        'neck_cm',
        'waist_cm',
        'hips_cm',
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
}
