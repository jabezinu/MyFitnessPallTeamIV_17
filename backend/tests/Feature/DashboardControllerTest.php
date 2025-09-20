<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\ExerciseDiaryEntry;
use App\Models\FoodDiaryEntry;
use App\Models\FoodItem;
use App\Models\User;
use App\Models\UserGoal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $foodItem;
    private $exercise;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->foodItem = FoodItem::create([
            'name' => 'Apple',
            'serving_size' => 100,
            'serving_unit' => 'g',
            'calories_per_serving' => 52,
            'protein_g' => 0.2,
            'carbs_g' => 14,
            'fat_g' => 0.2,
            'created_by' => $this->user->id,
            'verified' => true,
        ]);

        $this->exercise = Exercise::create([
            'name' => 'Running',
            'category' => 'cardio',
            'calories_per_hour' => 600,
        ]);

        // Create a goal
        UserGoal::create([
            'user_id' => $this->user->id,
            'goal_type' => 'weight_loss',
            'daily_calorie_goal' => 2000,
            'daily_protein_goal' => 150,
            'daily_carbs_goal' => 200,
            'daily_fat_goal' => 67,
            'is_active' => true,
        ]);
    }

    public function test_user_can_get_daily_summary()
    {
        // Create some food entries
        FoodDiaryEntry::create([
            'user_id' => $this->user->id,
            'food_item_id' => $this->foodItem->id,
            'meal_type' => 'breakfast',
            'quantity' => 2,
            'serving_unit' => 'g',
            'logged_date' => now()->toDateString(),
            'logged_at' => now(),
        ]);

        // Create exercise entry
        ExerciseDiaryEntry::create([
            'user_id' => $this->user->id,
            'exercise_id' => $this->exercise->id,
            'logged_date' => now()->toDateString(),
            'duration_minutes' => 30,
            'calories_burned' => 300,
            'logged_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/users/daily-summary');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'date',
                         'goals',
                         'consumed',
                         'exercise_calories_burned',
                         'net_calories',
                         'meals',
                         'exercises'
                     ],
                     'message'
                 ]);

        $data = $response->json('data');
        $this->assertEquals(104, $data['consumed']['calories']); // 52 * 2
        $this->assertEquals(300, $data['exercise_calories_burned']);
        $this->assertEquals(-196, $data['net_calories']); // 104 - 300
    }

    public function test_daily_summary_with_specific_date()
    {
        $specificDate = '2023-10-15';

        FoodDiaryEntry::create([
            'user_id' => $this->user->id,
            'food_item_id' => $this->foodItem->id,
            'meal_type' => 'lunch',
            'quantity' => 1,
            'serving_unit' => 'g',
            'logged_date' => $specificDate,
            'logged_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson("/api/users/daily-summary?date={$specificDate}");

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertEquals($specificDate, $data['date']);
        $this->assertEquals(52, $data['consumed']['calories']);
    }

    public function test_daily_summary_with_invalid_date()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/users/daily-summary?date=invalid-date');

        $response->assertStatus(400)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_daily_summary_without_goal()
    {
        // Deactivate the goal
        UserGoal::where('user_id', $this->user->id)->update(['is_active' => false]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/users/daily-summary');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertNull($data['goals']);
    }

    public function test_daily_summary_requires_authentication()
    {
        $response = $this->getJson('/api/users/daily-summary');
        $response->assertStatus(401);
    }
}