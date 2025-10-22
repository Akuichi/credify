<?php

namespace Tests\Feature\Api\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'mobile_number' => '+1234567890',
        ]);
    }

    public function test_user_can_view_profile(): void
    {
        $token = $this->user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/user');

        $response->assertOk()
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'full_name',
                    'email',
                    'mobile_number',
                    'created_at',
                    'updated_at',
                ],
            ])
            ->assertJsonPath('user.email', $this->user->email);
    }

    public function test_user_can_update_profile(): void
    {
        $token = $this->user->createToken('auth_token')->plainTextToken;

        $updatedData = [
            'full_name' => 'Updated Name',
            'mobile_number' => '+9876543210',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson('/api/user', $updatedData);

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'full_name',
                    'email',
                    'mobile_number',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'full_name' => $updatedData['full_name'],
            'mobile_number' => $updatedData['mobile_number'],
        ]);
    }

    public function test_unauthorized_user_cannot_view_profile(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertUnauthorized();
    }

    public function test_unauthorized_user_cannot_update_profile(): void
    {
        $response = $this->patchJson('/api/user', [
            'full_name' => 'Updated Name',
        ]);

        $response->assertUnauthorized();
    }

    public function test_user_can_update_partial_profile_data(): void
    {
        $token = $this->user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson('/api/user', [
                'full_name' => 'New Name',
                // mobile_number not included
            ]);

        $response->assertOk();

        $this->user->refresh();
        $this->assertEquals('New Name', $this->user->full_name);
        $this->assertEquals('+1234567890', $this->user->mobile_number); // Original number preserved
    }
}
