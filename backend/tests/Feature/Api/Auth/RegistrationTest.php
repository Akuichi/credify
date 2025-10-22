<?php

namespace Tests\Feature\Api\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    public function test_user_can_register_with_valid_data(): void
    {
        $userData = [
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'mobile_number' => '+1234567890',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'full_name',
                    'email',
                    'mobile_number',
                    'created_at',
                    'updated_at',
                ],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'full_name' => $userData['full_name'],
            'mobile_number' => $userData['mobile_number'],
        ]);
    }

    public function test_user_cannot_register_with_existing_email(): void
    {
        // Create a user first
        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $userData = [
            'full_name' => 'Another User',
            'email' => 'existing@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_cannot_register_with_invalid_data(): void
    {
        $userData = [
            'full_name' => '', // Empty name
            'email' => 'invalid-email', // Invalid email
            'password' => 'short', // Too short password
            'password_confirmation' => 'different', // Doesn't match
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'full_name',
                'email',
                'password',
            ]);
    }

    public function test_mobile_number_is_optional(): void
    {
        $userData = [
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'mobile_number' => null,
        ]);
    }
}
