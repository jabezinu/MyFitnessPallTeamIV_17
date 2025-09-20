<?php

namespace Tests\Feature;

use App\Models\FoodDiaryEntry;
use App\Models\FoodItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FoodDiaryTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $foodItem;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->foodItem = FoodItem::create([
            'name' => 'Apple',
            'brand' => 'Generic',
            'serving_size' => 100,
            'serving_unit' => 'g',
            'calories_per_serving' => 52,
            'protein_g' => 0.2,
            'carbs_g' => 14,
            'fat_g' => 0.2,
            'created_by' => $this->user->id,
            'verified' => true,
        ]);
    }

    public function test_user_can_get_food_diary_entries()
    {
        FoodDiaryEntry::create([
            'user_id' => $this->user->id,
            'food_item_id' => $this->foodItem->id,
            'meal_type' => 'breakfast',
            'quantity' => 1,
            'serving_unit' => 'medium',
            'logged_date' => now()->toDateString(),
            'logged_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/food-diary');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);
    }

    public function test_user_can_create_food_diary_entry()
    {
        $entryData = [
            'food_item_id' => $this->foodItem->id,
            'meal_type' => 'lunch',
            'quantity' => 2,
            'serving_unit' => 'g',
            'logged_date' => now()->toDateString(),
            'notes' => 'Healthy lunch',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/food-diary', $entryData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);

        $this->assertDatabaseHas('food_diary_entries', [
            'user_id' => $this->user->id,
            'food_item_id' => $this->foodItem->id,
            'meal_type' => 'lunch',
        ]);
    }

    public function test_user_cannot_create_food_diary_entry_with_invalid_data()
    {
        $invalidData = [
            'food_item_id' => 999, // Non-existent
            'meal_type' => 'invalid_meal',
            'quantity' => -1,
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/food-diary', $invalidData);

        $response->assertStatus(400)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_user_can_update_food_diary_entry()
    {
        $entry = FoodDiaryEntry::create([
            'user_id' => $this->user->id,
            'food_item_id' => $this->foodItem->id,
            'meal_type' => 'breakfast',
            'quantity' => 1,
            'serving_unit' => 'g',
            'logged_date' => now()->toDateString(),
            'logged_at' => now(),
        ]);

        $updateData = [
            'meal_type' => 'snack',
            'quantity' => 1.5,
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->putJson("/api/food-diary/{$entry->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);

        $this->assertDatabaseHas('food_diary_entries', [
            'id' => $entry->id,
            'meal_type' => 'snack',
            'quantity' => 1.5,
        ]);
    }

    public function test_user_cannot_update_others_food_diary_entry()
    {
        $otherUser = User::factory()->create();
        $entry = FoodDiaryEntry::create([
            'user_id' => $otherUser->id,
            'food_item_id' => $this->foodItem->id,
            'meal_type' => 'breakfast',
            'quantity' => 1,
            'serving_unit' => 'g',
            'logged_date' => now()->toDateString(),
            'logged_at' => now(),
        ]);

        $updateData = [
            'quantity' => 2,
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->putJson("/api/food-diary/{$entry->id}", $updateData);

        $response->assertStatus(403)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_user_can_delete_food_diary_entry()
    {
        $entry = FoodDiaryEntry::create([
            'user_id' => $this->user->id,
            'food_item_id' => $this->foodItem->id,
            'meal_type' => 'breakfast',
            'quantity' => 1,
            'serving_unit' => 'g',
            'logged_date' => now()->toDateString(),
            'logged_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->deleteJson("/api/food-diary/{$entry->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Food diary entry deleted successfully'
                 ]);

        $this->assertDatabaseMissing('food_diary_entries', [
            'id' => $entry->id,
        ]);
    }

    public function test_food_diary_requires_authentication()
    {
        $response = $this->getJson('/api/food-diary');
        $response->assertStatus(401);
    }
}