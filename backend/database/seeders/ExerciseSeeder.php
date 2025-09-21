<?php

namespace Database\Seeders;

use App\Models\Exercise;
use Illuminate\Database\Seeder;

class ExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $exercises = [
            [
                'name' => 'Running',
                'category' => 'cardio',
                'description' => 'Outdoor or treadmill running',
                'met_value' => 8.3,
            ],
            [
                'name' => 'Walking',
                'category' => 'cardio',
                'description' => 'Brisk walking',
                'met_value' => 3.8,
            ],
            [
                'name' => 'Cycling',
                'category' => 'cardio',
                'description' => 'Stationary or outdoor cycling',
                'met_value' => 6.8,
            ],
            [
                'name' => 'Swimming',
                'category' => 'cardio',
                'description' => 'Freestyle swimming',
                'met_value' => 7.0,
            ],
            [
                'name' => 'Push-ups',
                'category' => 'strength',
                'description' => 'Standard push-ups',
                'met_value' => 3.0,
            ],
            [
                'name' => 'Squats',
                'category' => 'strength',
                'description' => 'Bodyweight squats',
                'met_value' => 4.0,
            ],
            [
                'name' => 'Bench Press',
                'category' => 'strength',
                'description' => 'Barbell bench press',
                'met_value' => 3.0,
            ],
            [
                'name' => 'Deadlift',
                'category' => 'strength',
                'description' => 'Conventional deadlift',
                'met_value' => 3.0,
            ],
            [
                'name' => 'Pull-ups',
                'category' => 'strength',
                'description' => 'Assisted or unassisted pull-ups',
                'met_value' => 3.0,
            ],
            [
                'name' => 'Yoga',
                'category' => 'flexibility',
                'description' => 'Hatha or Vinyasa yoga',
                'met_value' => 2.5,
            ],
        ];

        foreach ($exercises as $exercise) {
            Exercise::create($exercise);
        }
    }
}