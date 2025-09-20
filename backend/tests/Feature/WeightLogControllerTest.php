<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WeightLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WeightLogControllerTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
    }

    public function test_user_can_get_weight_logs()
    {
        WeightLog::create([
            'user_id' => $this->user->id,
            'weight_kg' => 70.5,
            'logged_date' => now()->toDateString(),
            'logged_at' => now(),
        ]);

        WeightLog::create([
            'user_id' => $this->user->id,
            'weight_kg' => 69.8,
            'logged_date' => now()->subDays(1)->toDateString(),
            'logged_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/users/weight-logs');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);

        $data = $response->json('data');
        $this->assertCount(2, $data);
        $this->assertEquals(70.5, $data[0]['weight_kg']); // Ordered by date desc
    }

    public function test_user_can_get_weight_logs_with_custom_period()
    {
        WeightLog::create([
            'user_id' => $this->user->id,
            'weight_kg' => 70.5,
            'logged_date' => now()->toDateString(),
            'logged_at' => now(),
        ]);

        WeightLog::create([
            'user_id' => $this->user->id,
            'weight_kg' => 69.8,
            'logged_date' => now()->subDays(10)->toDateString(),
            'logged_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/users/weight-logs?period=7');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data); // Only the recent one
    }

    public function test_user_can_create_weight_log()
    {
        $logData = [
            'weight_kg' => 72.3,
            'logged_date' => now()->toDateString(),
            'notes' => 'Morning weigh-in',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/users/weight-logs', $logData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'message'
                 ]);

        $this->assertDatabaseHas('weight_logs', [
            'user_id' => $this->user->id,
            'weight_kg' => 72.3,
        ]);
    }

    public function test_user_cannot_create_duplicate_weight_log_for_same_date()
    {
        WeightLog::create([
            'user_id' => $this->user->id,
            'weight_kg' => 70.5,
            'logged_date' => now()->toDateString(),
            'logged_at' => now(),
        ]);

        $duplicateData = [
            'weight_kg' => 71.0,
            'logged_date' => now()->toDateString(),
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/users/weight-logs', $duplicateData);

        $response->assertStatus(409)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_user_cannot_create_weight_log_with_invalid_data()
    {
        $invalidData = [
            'weight_kg' => 600, // Exceeds max
            'logged_date' => 'invalid-date',
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/users/weight-logs', $invalidData);

        $response->assertStatus(400)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_weight_logs_with_invalid_period()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/users/weight-logs?period=400'); // Exceeds max

        $response->assertStatus(400)
                 ->assertJsonStructure([
                     'success',
                     'error'
                 ]);
    }

    public function test_weight_log_endpoints_require_authentication()
    {
        $response = $this->getJson('/api/users/weight-logs');
        $response->assertStatus(401);

        $response = $this->postJson('/api/users/weight-logs', []);
        $response->assertStatus(401);
    }
}