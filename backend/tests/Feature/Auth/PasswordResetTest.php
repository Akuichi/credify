<?php

namespace Tests\Feature\Auth;

use App\Models\PasswordReset;
use App\Models\User;
use App\Notifications\Auth\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Set up the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Start a new session for CSRF protection
        $this->withSession(['_token' => 'test-token']);
        $this->withCookie('XSRF-TOKEN', 'test-token');
    }
    
    /**
     * Test that a password reset token can be generated.
     */
    public function test_password_reset_token_can_be_generated(): void
    {
        Notification::fake();
        
        $user = User::factory()->create();

        $response = $this->withHeaders(['X-CSRF-TOKEN' => 'test-token'])
            ->postJson('/api/forgot-password', [
                'email' => $user->email,
            ]);

        $response->assertStatus(200);
        
        // Check that a token was created in the database
        $this->assertDatabaseHas('password_resets', [
            'email' => $user->email
        ]);
        
        // Check that a notification was sent to the user
        Notification::assertSentTo(
            [$user], ResetPasswordNotification::class
        );
    }

    /**
     * Test that an invalid email returns an error.
     */
    public function test_password_reset_with_invalid_email(): void
    {
        $response = $this->withHeaders(['X-CSRF-TOKEN' => 'test-token'])
            ->postJson('/api/forgot-password', [
                'email' => 'nonexistent@example.com',
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test password can be reset with a valid token.
     */
    public function test_password_can_be_reset_with_valid_token(): void
    {
        $user = User::factory()->create([
            'password' => \Illuminate\Support\Facades\Hash::make('OldPassword123!')
        ]);
        
        // Create a password reset token
        $token = \Illuminate\Support\Str::random(60);
        PasswordReset::create([
            'email' => $user->email,
            'token' => $token,
            'created_at' => now(),
        ]);

        $response = $this->withHeaders(['X-CSRF-TOKEN' => 'test-token'])
            ->postJson('/api/reset-password', [
                'email' => $user->email,
                'token' => $token,
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ]);

        $response->assertStatus(200);
        
        // Check that the token was deleted
        $this->assertDatabaseMissing('password_resets', [
            'email' => $user->email,
        ]);
        
        // Verify that the user can login with the new password
        $response = $this->withHeaders(['X-CSRF-TOKEN' => 'test-token'])
            ->postJson('/api/login', [
                'email' => $user->email,
                'password' => 'NewPassword123!',
            ]);

        $response->assertStatus(200);
    }
    
    /**
     * Test password reset with invalid token.
     */
    public function test_password_reset_with_invalid_token(): void
    {
        $user = User::factory()->create();
        
        $response = $this->withHeaders(['X-CSRF-TOKEN' => 'test-token'])
            ->postJson('/api/reset-password', [
                'email' => $user->email,
                'token' => 'invalid-token',
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ]);

        $response->assertStatus(400);
    }

    /**
     * Test password reset token expires after 1 hour.
     */
    public function test_password_reset_token_expires(): void
    {
        $user = User::factory()->create();
        
        // Create an expired password reset token
        $token = \Illuminate\Support\Str::random(60);
        $passwordReset = PasswordReset::create([
            'email' => $user->email,
            'token' => $token,
            'created_at' => now()->subHours(2), // 2 hours ago
        ]);

        $response = $this->withHeaders(['X-CSRF-TOKEN' => 'test-token'])
            ->postJson('/api/reset-password', [
                'email' => $user->email,
                'token' => $token,
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ]);

        $response->assertStatus(400)
            ->assertJsonFragment(['message' => 'Password reset token has expired']);
    }
}