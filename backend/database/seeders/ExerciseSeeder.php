<?php

namespace Database\Seeders;

use App\Models\Exercise;
use Illuminate\Database\Seeder;

class ExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $exercises = [
            // Cardio Exercises
            [
                'name' => 'Running',
                'category' => 'cardio',
                'description' => 'Outdoor or treadmill running',
                'met_value' => 8.3,
                'muscle_groups' => ['legs', 'core'],
                'equipment_needed' => ['running shoes'],
                'difficulty_level' => 'intermediate',
                'instructions' => 'Start with a warm-up walk, maintain steady pace, cool down gradually.'
            ],
            [
                'name' => 'Walking',
                'category' => 'cardio',
                'description' => 'Brisk walking',
                'met_value' => 3.8,
                'muscle_groups' => ['legs', 'core'],
                'equipment_needed' => ['walking shoes'],
                'difficulty_level' => 'beginner',
                'instructions' => 'Walk at a brisk pace, swing arms naturally, maintain good posture.'
            ],
            [
                'name' => 'Cycling',
                'category' => 'cardio',
                'description' => 'Stationary or outdoor cycling',
                'met_value' => 6.8,
                'muscle_groups' => ['legs', 'core'],
                'equipment_needed' => ['bicycle', 'helmet'],
                'difficulty_level' => 'intermediate',
                'instructions' => 'Adjust seat height, maintain steady cadence, use proper form.'
            ],
            [
                'name' => 'Swimming',
                'category' => 'cardio',
                'description' => 'Freestyle swimming',
                'met_value' => 7.0,
                'muscle_groups' => ['arms', 'shoulders', 'legs', 'core'],
                'equipment_needed' => ['swimsuit', 'goggles'],
                'difficulty_level' => 'intermediate',
                'instructions' => 'Use proper breathing technique, maintain steady stroke rhythm.'
            ],
            [
                'name' => 'Jump Rope',
                'category' => 'cardio',
                'description' => 'Rope jumping exercise',
                'met_value' => 10.0,
                'muscle_groups' => ['legs', 'arms', 'core'],
                'equipment_needed' => ['jump rope'],
                'difficulty_level' => 'intermediate',
                'instructions' => 'Keep elbows close to body, jump with light feet, maintain rhythm.'
            ],
            [
                'name' => 'Elliptical Training',
                'category' => 'cardio',
                'description' => 'Elliptical machine workout',
                'met_value' => 6.0,
                'muscle_groups' => ['legs', 'arms', 'core'],
                'equipment_needed' => ['elliptical machine'],
                'difficulty_level' => 'beginner',
                'instructions' => 'Maintain upright posture, use full range of motion, adjust resistance as needed.'
            ],

            // Strength Exercises
            [
                'name' => 'Push-ups',
                'category' => 'strength',
                'description' => 'Standard push-ups',
                'met_value' => 3.0,
                'muscle_groups' => ['chest', 'shoulders', 'triceps'],
                'equipment_needed' => [],
                'difficulty_level' => 'intermediate',
                'instructions' => 'Keep body straight, lower chest to ground, push back up explosively.'
            ],
            [
                'name' => 'Squats',
                'category' => 'strength',
                'description' => 'Bodyweight squats',
                'met_value' => 4.0,
                'muscle_groups' => ['quadriceps', 'glutes', 'hamstrings'],
                'equipment_needed' => [],
                'difficulty_level' => 'beginner',
                'instructions' => 'Feet shoulder-width apart, lower as if sitting back into chair, keep knees behind toes.'
            ],
            [
                'name' => 'Bench Press',
                'category' => 'strength',
                'description' => 'Barbell bench press',
                'met_value' => 3.0,
                'muscle_groups' => ['chest', 'shoulders', 'triceps'],
                'equipment_needed' => ['barbell', 'bench', 'weights'],
                'difficulty_level' => 'intermediate',
                'instructions' => 'Lie on bench, grip bar shoulder-width, lower to chest, press up explosively.'
            ],
            [
                'name' => 'Deadlift',
                'category' => 'strength',
                'description' => 'Conventional deadlift',
                'met_value' => 3.0,
                'muscle_groups' => ['back', 'glutes', 'hamstrings'],
                'equipment_needed' => ['barbell', 'weights'],
                'difficulty_level' => 'advanced',
                'instructions' => 'Feet hip-width apart, hinge at hips, grip bar, lift by extending hips and knees.'
            ],
            [
                'name' => 'Pull-ups',
                'category' => 'strength',
                'description' => 'Assisted or unassisted pull-ups',
                'met_value' => 3.0,
                'muscle_groups' => ['back', 'biceps', 'shoulders'],
                'equipment_needed' => ['pull-up bar', 'assistance bands'],
                'difficulty_level' => 'advanced',
                'instructions' => 'Hang from bar, pull body up until chin clears bar, lower with control.'
            ],
            [
                'name' => 'Lunges',
                'category' => 'strength',
                'description' => 'Walking or stationary lunges',
                'met_value' => 3.0,
                'muscle_groups' => ['quadriceps', 'glutes', 'hamstrings'],
                'equipment_needed' => ['dumbbells'],
                'difficulty_level' => 'intermediate',
                'instructions' => 'Step forward into lunge position, lower until both knees are bent 90 degrees, push back up.'
            ],
            [
                'name' => 'Shoulder Press',
                'category' => 'strength',
                'description' => 'Dumbbell shoulder press',
                'met_value' => 3.0,
                'muscle_groups' => ['shoulders', 'triceps'],
                'equipment_needed' => ['dumbbells'],
                'difficulty_level' => 'intermediate',
                'instructions' => 'Hold dumbbells at shoulder height, press overhead, lower with control.'
            ],
            [
                'name' => 'Bicep Curls',
                'category' => 'strength',
                'description' => 'Dumbbell bicep curls',
                'met_value' => 2.0,
                'muscle_groups' => ['biceps'],
                'equipment_needed' => ['dumbbells'],
                'difficulty_level' => 'beginner',
                'instructions' => 'Hold dumbbells with arms extended, curl weights toward shoulders, lower slowly.'
            ],

            // Flexibility Exercises
            [
                'name' => 'Yoga',
                'category' => 'flexibility',
                'description' => 'Hatha or Vinyasa yoga',
                'met_value' => 2.5,
                'muscle_groups' => ['full body'],
                'equipment_needed' => ['yoga mat'],
                'difficulty_level' => 'beginner',
                'instructions' => 'Follow instructor cues, focus on breathing, hold poses comfortably.'
            ],
            [
                'name' => 'Stretching',
                'category' => 'flexibility',
                'description' => 'Full body stretching routine',
                'met_value' => 2.0,
                'muscle_groups' => ['full body'],
                'equipment_needed' => [],
                'difficulty_level' => 'beginner',
                'instructions' => 'Hold each stretch for 20-30 seconds, breathe deeply, never bounce.'
            ],
            [
                'name' => 'Pilates',
                'category' => 'flexibility',
                'description' => 'Pilates core and flexibility workout',
                'met_value' => 3.0,
                'muscle_groups' => ['core', 'back', 'legs'],
                'equipment_needed' => ['pilates mat'],
                'difficulty_level' => 'intermediate',
                'instructions' => 'Focus on core engagement, controlled movements, proper breathing technique.'
            ],

            // Sports Exercises
            [
                'name' => 'Basketball',
                'category' => 'sports',
                'description' => 'Basketball game or practice',
                'met_value' => 8.0,
                'muscle_groups' => ['legs', 'arms', 'core'],
                'equipment_needed' => ['basketball', 'basketball court'],
                'difficulty_level' => 'intermediate',
                'instructions' => 'Warm up properly, practice fundamentals, stay hydrated during play.'
            ],
            [
                'name' => 'Tennis',
                'category' => 'sports',
                'description' => 'Tennis match or practice',
                'met_value' => 7.0,
                'muscle_groups' => ['arms', 'legs', 'core'],
                'equipment_needed' => ['tennis racket', 'tennis balls', 'tennis court'],
                'difficulty_level' => 'intermediate',
                'instructions' => 'Practice proper form, warm up before serving, stay light on feet.'
            ],
            [
                'name' => 'Soccer',
                'category' => 'sports',
                'description' => 'Soccer game or training',
                'met_value' => 7.0,
                'muscle_groups' => ['legs', 'core'],
                'equipment_needed' => ['soccer ball', 'soccer field'],
                'difficulty_level' => 'intermediate',
                'instructions' => 'Focus on ball control, maintain proper running form, communicate with teammates.'
            ],
        ];

        foreach ($exercises as $exercise) {
            Exercise::create($exercise);
        }
    }
}