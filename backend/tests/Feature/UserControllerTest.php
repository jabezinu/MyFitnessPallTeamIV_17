<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'height_cm' => 175,
            'activity_level' => 'moderately_active',
        ]);
    }

    public function test_user_can_get_profile()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/users/profile');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);

        $data = $response->json('data');
        $this->assertEquals('John', $data['first_name']);
        $this->assertEquals('Doe', $data['last_name']);
    }

    public function test_user_can_update_profile()
    {
        $updateData = [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'height_cm' => 165,
            'activity_level' => 'very_active',
            'timezone' => 'America/New_York',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->putJson('/api/users/profile', $updateData);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'height_cm' => 165,
            'activity_level' => 'very_active',
            'timezone' => 'America/New_York',
        ]);
    }

    public function test_user_cannot_update_profile_with_invalid_data()
    {
        $invalidData = [
            'height_cm' => 350, // Exceeds max
            'activity_level' => 'invalid_level',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->putJson('/api/users/profile', $invalidData);

        $response->assertStatus(400)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_profile_endpoints_require_authentication()
    {
        $response = $this->getJson('/api/users/profile');
        $response->assertStatus(401);

        $response = $this->putJson('/api/users/profile', []);
        $response->assertStatus(401);
    }
}