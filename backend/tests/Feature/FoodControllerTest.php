<?php

namespace Tests\Feature;

use App\Models\FoodItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FoodControllerTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        // Create some food items
        FoodItem::create([
            'name' => 'Banana',
            'brand' => 'Generic',
            'serving_size' => 100,
            'serving_unit' => 'g',
            'calories_per_serving' => 89,
            'protein_g' => 1.1,
            'carbs_g' => 23,
            'fat_g' => 0.3,
            'created_by' => $this->user->id,
            'verified' => true,
        ]);

        FoodItem::create([
            'name' => 'Chicken Breast',
            'brand' => 'Organic Farms',
            'serving_size' => 100,
            'serving_unit' => 'g',
            'calories_per_serving' => 165,
            'protein_g' => 31,
            'carbs_g' => 0,
            'fat_g' => 3.6,
            'created_by' => $this->user->id,
            'verified' => true,
        ]);
    }

    public function test_user_can_search_foods()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/foods/search?q=banana');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'results',
                         'total',
                         'page',
                         'per_page'
                     ],
                     'message'
                 ]);

        $data = $response->json('data');
        $this->assertEquals(1, $data['total']);
        $this->assertEquals('Banana', $data['results'][0]['name']);
    }

    public function test_user_can_search_foods_by_brand()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/foods/search?q=organic');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertEquals(1, $data['total']);
        $this->assertEquals('Organic Farms', $data['results'][0]['brand']);
    }

    public function test_food_search_with_pagination()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/foods/search?limit=1&offset=1');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertEquals(1, $data['per_page']);
        $this->assertEquals(2, $data['page']);
        $this->assertCount(1, $data['results']);
    }

    public function test_food_search_with_invalid_parameters()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/foods/search?limit=150'); // Exceeds max

        $response->assertStatus(400)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_user_can_create_food_item()
    {
        $foodData = [
            'name' => 'Orange',
            'brand' => 'Fresh Produce',
            'serving_size' => 150,
            'serving_unit' => 'g',
            'calories_per_serving' => 62,
            'protein_g' => 1.2,
            'carbs_g' => 15,
            'fat_g' => 0.2,
            'fiber_g' => 3.1,
            'sugar_g' => 12,
            'sodium_mg' => 0,
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/foods', $foodData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);

        $this->assertDatabaseHas('food_items', [
            'name' => 'Orange',
            'brand' => 'Fresh Produce',
            'created_by' => $this->user->id,
        ]);
    }

    public function test_user_cannot_create_food_item_with_invalid_data()
    {
        $invalidData = [
            'name' => '',
            'serving_size' => -10,
            'calories_per_serving' => 'not_a_number',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/foods', $invalidData);

        $response->assertStatus(400)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_food_endpoints_require_authentication()
    {
        $response = $this->getJson('/api/foods/search');
        $response->assertStatus(401);

        $response = $this->postJson('/api/foods', []);
        $response->assertStatus(401);
    }
}