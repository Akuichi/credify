<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_verify_email(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => null
        ]);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        Event::fake();

        $response = $this->get($verificationUrl);

        // Should redirect to frontend
        $response->assertRedirect(config('app.frontend_url') . '/email-verified');
        
        // User should be verified now
        $this->assertNotNull($user->fresh()->email_verified_at);
        
        // Verified event should have been dispatched
        Event::assertDispatched(Verified::class, function ($e) use ($user) {
            return $e->user->id === $user->id;
        });
    }

    public function test_user_cannot_verify_with_invalid_signature(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => null
        ]);

        // Create invalid verification URL (without signature)
        $invalidUrl = route('verification.verify', [
            'id' => $user->id,
            'hash' => sha1($user->email),
        ]);

        $response = $this->get($invalidUrl);

        $response->assertStatus(401);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_user_can_request_verification_email(): void
    {
        Notification::fake();
        
        $user = User::factory()->create([
            'email_verified_at' => null
        ]);

        $this->actingAs($user)
            ->postJson('/api/email/verify/send')
            ->assertOk();

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_user_can_check_verification_status(): void
    {
        // Create an unverified user
        $unverifiedUser = User::factory()->create([
            'email_verified_at' => null
        ]);

        // Check unverified status
        $this->actingAs($unverifiedUser)
            ->getJson('/api/email/verify')
            ->assertOk()
            ->assertJson([
                'verified' => false
            ]);

        // Create a verified user
        $verifiedUser = User::factory()->create([
            'email_verified_at' => now()
        ]);

        // Check verified status
        $this->actingAs($verifiedUser)
            ->getJson('/api/email/verify')
            ->assertOk()
            ->assertJson([
                'verified' => true
            ]);
    }
}