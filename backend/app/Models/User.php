<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'first_name',
        'last_name',
        'email',
        'password',
        'date_of_birth',
        'gender',
        'height_cm',
        'current_weight_kg',
        'goal_weight_kg',
        'activity_level',
        'timezone',
        'profile_image_url',
        'about_me',
        'fitness_motivation',
        'friends',
        'inspirations',
        'is_premium',
        'email_verified',
        'privacy_settings',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'is_premium' => 'boolean',
            'email_verified' => 'boolean',
            'privacy_settings' => 'array',
            'friends' => 'array',
            'inspirations' => 'array',
        ];
    }

    // Relationships
    public function foodDiaryEntries()
    {
        return $this->hasMany(FoodDiaryEntry::class);
    }

    public function exerciseDiaryEntries()
    {
        return $this->hasMany(ExerciseDiaryEntry::class);
    }

    public function userGoals()
    {
        return $this->hasMany(UserGoal::class);
    }

    public function weightLogs()
    {
        return $this->hasMany(WeightLog::class);
    }

    public function recipes()
    {
        return $this->hasMany(Recipe::class);
    }

    public function createdFoodItems()
    {
        return $this->hasMany(FoodItem::class, 'created_by');
    }
}
