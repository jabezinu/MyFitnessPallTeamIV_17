<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class Exercise extends Model
{
    protected $fillable = [
        'name',
        'category',
        'met_value',
        'description',
        'instructions',
        'muscle_groups',
        'equipment_needed',
        'difficulty_level',
        'created_by',
    ];

    protected $casts = [
        'muscle_groups' => 'array',
        'equipment_needed' => 'array',
    ];

    public function exerciseDiaryEntries(): HasMany
    {
        return $this->hasMany(ExerciseDiaryEntry::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
