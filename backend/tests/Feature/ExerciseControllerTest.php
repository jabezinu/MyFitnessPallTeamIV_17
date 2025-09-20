<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExerciseControllerTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        // Create some exercises
        Exercise::create([
            'name' => 'Running',
            'category' => 'cardio',
            'calories_per_hour' => 600,
            'description' => 'Running exercise',
        ]);

        Exercise::create([
            'name' => 'Push-ups',
            'category' => 'strength',
            'calories_per_hour' => 300,
            'description' => 'Upper body strength',
        ]);

        Exercise::create([
            'name' => 'Yoga',
            'category' => 'flexibility',
            'calories_per_hour' => 200,
            'description' => 'Flexibility exercise',
        ]);
    }

    public function test_user_can_search_exercises()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/exercises/search?q=run');

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
        $this->assertEquals('Running', $data['results'][0]['name']);
    }

    public function test_user_can_search_exercises_by_category()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/exercises/search?category=strength');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertEquals(1, $data['total']);
        $this->assertEquals('strength', $data['results'][0]['category']);
    }

    public function test_exercise_search_with_pagination()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/exercises/search?limit=2&offset=2');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertEquals(2, $data['per_page']);
        $this->assertEquals(2, $data['page']);
    }

    public function test_exercise_search_with_invalid_parameters()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/exercises/search?limit=200'); // Exceeds max

        $response->assertStatus(400)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_user_can_get_exercise_categories()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/exercises/categories');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'data' => ['cardio', 'strength', 'flexibility', 'sports'],
                     'message' => 'Exercise categories retrieved successfully'
                 ]);
    }

    public function test_exercise_endpoints_require_authentication()
    {
        $response = $this->getJson('/api/exercises/search');
        $response->assertStatus(401);

        $response = $this->getJson('/api/exercises/categories');
        $response->assertStatus(401);
    }
}