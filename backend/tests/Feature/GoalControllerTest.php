<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserGoal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GoalControllerTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
    }

    public function test_user_can_get_goals()
    {
        UserGoal::create([
            'user_id' => $this->user->id,
            'goal_type' => 'weight_loss',
            'daily_calorie_goal' => 1800,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/users/goals');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('weight_loss', $data[0]['goal_type']);
    }

    public function test_user_can_create_goal()
    {
        $goalData = [
            'goal_type' => 'muscle_gain',
            'target_weight_kg' => 75,
            'target_date' => now()->addMonths(3)->toDateString(),
            'weekly_goal_kg' => 0.5,
            'daily_calorie_goal' => 2500,
            'daily_protein_goal' => 200,
            'daily_carbs_goal' => 250,
            'daily_fat_goal' => 83,
            'daily_exercise_minutes' => 60,
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/users/goals', $goalData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);

        $this->assertDatabaseHas('user_goals', [
            'user_id' => $this->user->id,
            'goal_type' => 'muscle_gain',
            'is_active' => true,
        ]);
    }

    public function test_user_cannot_create_goal_with_invalid_data()
    {
        $invalidData = [
            'goal_type' => 'invalid_type',
            'daily_calorie_goal' => 15000, // Exceeds max
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/users/goals', $invalidData);

        $response->assertStatus(400)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_creating_new_goal_deactivates_previous_ones()
    {
        // Create first goal
        UserGoal::create([
            'user_id' => $this->user->id,
            'goal_type' => 'weight_loss',
            'daily_calorie_goal' => 1800,
            'is_active' => true,
        ]);

        // Create second goal
        $newGoalData = [
            'goal_type' => 'maintain',
            'daily_calorie_goal' => 2200,
        ];

        $this->actingAs($this->user, 'sanctum')
             ->postJson('/api/users/goals', $newGoalData);

        // Check that old goal is deactivated
        $oldGoals = UserGoal::where('user_id', $this->user->id)
                           ->where('goal_type', 'weight_loss')
                           ->get();

        foreach ($oldGoals as $goal) {
            $this->assertFalse($goal->is_active);
        }

        // Check new goal is active
        $this->assertDatabaseHas('user_goals', [
            'user_id' => $this->user->id,
            'goal_type' => 'maintain',
            'is_active' => true,
        ]);
    }

    public function test_user_can_update_goal()
    {
        $goal = UserGoal::create([
            'user_id' => $this->user->id,
            'goal_type' => 'weight_loss',
            'daily_calorie_goal' => 1800,
            'is_active' => true,
        ]);

        $updateData = [
            'daily_calorie_goal' => 1700,
            'daily_protein_goal' => 160,
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->putJson("/api/users/goals/{$goal->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);

        $this->assertDatabaseHas('user_goals', [
            'id' => $goal->id,
            'daily_calorie_goal' => 1700,
            'daily_protein_goal' => 160,
        ]);
    }

    public function test_user_cannot_update_others_goal()
    {
        $otherUser = User::factory()->create();
        $goal = UserGoal::create([
            'user_id' => $otherUser->id,
            'goal_type' => 'weight_loss',
            'daily_calorie_goal' => 1800,
            'is_active' => true,
        ]);

        $updateData = [
            'daily_calorie_goal' => 1700,
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->putJson("/api/users/goals/{$goal->id}", $updateData);

        $response->assertStatus(403)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_goal_endpoints_require_authentication()
    {
        $response = $this->getJson('/api/users/goals');
        $response->assertStatus(401);

        $response = $this->postJson('/api/users/goals', []);
        $response->assertStatus(401);
    }
}