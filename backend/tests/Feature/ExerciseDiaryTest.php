<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\ExerciseDiaryEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExerciseDiaryTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $exercise;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->exercise = Exercise::create([
            'name' => 'Running',
            'category' => 'cardio',
            'calories_per_hour' => 600,
            'description' => 'Running exercise',
        ]);
    }

    public function test_user_can_get_exercise_diary_entries()
    {
        ExerciseDiaryEntry::create([
            'user_id' => $this->user->id,
            'exercise_id' => $this->exercise->id,
            'logged_date' => now()->toDateString(),
            'duration_minutes' => 30,
            'calories_burned' => 300,
            'logged_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/exercise-diary');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);
    }

    public function test_user_can_create_exercise_diary_entry()
    {
        $entryData = [
            'exercise_id' => $this->exercise->id,
            'logged_date' => now()->toDateString(),
            'duration_minutes' => 45,
            'calories_burned' => 450,
            'sets' => 3,
            'reps' => 10,
            'notes' => 'Good workout',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/exercise-diary', $entryData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);

        $this->assertDatabaseHas('exercise_diary_entries', [
            'user_id' => $this->user->id,
            'exercise_id' => $this->exercise->id,
            'duration_minutes' => 45,
        ]);
    }

    public function test_user_cannot_create_exercise_diary_entry_with_invalid_data()
    {
        $invalidData = [
            'exercise_id' => 999, // Non-existent
            'logged_date' => 'invalid-date',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/exercise-diary', $invalidData);

        $response->assertStatus(400)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_user_can_update_exercise_diary_entry()
    {
        $entry = ExerciseDiaryEntry::create([
            'user_id' => $this->user->id,
            'exercise_id' => $this->exercise->id,
            'logged_date' => now()->toDateString(),
            'duration_minutes' => 30,
            'calories_burned' => 300,
            'logged_at' => now(),
        ]);

        $updateData = [
            'duration_minutes' => 60,
            'calories_burned' => 600,
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->putJson("/api/exercise-diary/{$entry->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);

        $this->assertDatabaseHas('exercise_diary_entries', [
            'id' => $entry->id,
            'duration_minutes' => 60,
        ]);
    }

    public function test_user_cannot_update_others_exercise_diary_entry()
    {
        $otherUser = User::factory()->create();
        $entry = ExerciseDiaryEntry::create([
            'user_id' => $otherUser->id,
            'exercise_id' => $this->exercise->id,
            'logged_date' => now()->toDateString(),
            'duration_minutes' => 30,
            'logged_at' => now(),
        ]);

        $updateData = [
            'duration_minutes' => 60,
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->putJson("/api/exercise-diary/{$entry->id}", $updateData);

        $response->assertStatus(403)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_user_can_delete_exercise_diary_entry()
    {
        $entry = ExerciseDiaryEntry::create([
            'user_id' => $this->user->id,
            'exercise_id' => $this->exercise->id,
            'logged_date' => now()->toDateString(),
            'duration_minutes' => 30,
            'logged_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->deleteJson("/api/exercise-diary/{$entry->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Exercise diary entry deleted successfully'
                 ]);

        $this->assertDatabaseMissing('exercise_diary_entries', [
            'id' => $entry->id,
        ]);
    }

    public function test_exercise_diary_requires_authentication()
    {
        $response = $this->getJson('/api/exercise-diary');
        $response->assertStatus(401);
    }
}