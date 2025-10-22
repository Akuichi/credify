<?php

namespace Tests\Feature\Api\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class TwoFactorAuthTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Google2FA $google2fa;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('Password123!'),
            'two_factor_enabled' => false,
        ]);

        $this->google2fa = new Google2FA();
    }

    public function test_user_can_initialize_2fa_setup(): void
    {
        $token = $this->user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/2fa/setup');

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'secret',
                'qr_code',
            ]);

        $this->user->refresh();
        $this->assertNotNull($this->user->two_factor_secret);
        $this->assertFalse($this->user->two_factor_enabled);
    }

    public function test_user_can_verify_and_enable_2fa(): void
    {
        $token = $this->user->createToken('auth_token')->plainTextToken;
        
        // Setup 2FA first
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/2fa/setup');

        $this->user->refresh();
        $secret = $this->user->two_factor_secret;
        
        // Generate a valid code using the secret
        $validCode = $this->google2fa->getCurrentOtp($secret);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/2fa/verify', [
                'code' => $validCode,
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => '2FA has been enabled successfully',
            ]);

        $this->user->refresh();
        $this->assertTrue($this->user->two_factor_enabled);
    }

    public function test_user_cannot_verify_with_invalid_code(): void
    {
        $token = $this->user->createToken('auth_token')->plainTextToken;
        
        // Setup 2FA first
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/2fa/setup');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/2fa/verify', [
                'code' => '000000',
            ]);

        $response->assertStatus(422);

        $this->user->refresh();
        $this->assertFalse($this->user->two_factor_enabled);
    }

    public function test_user_can_verify_login_with_2fa(): void
    {
        // Enable 2FA for the user
        $secret = $this->google2fa->generateSecretKey();
        $this->user->update([
            'two_factor_secret' => $secret,
            'two_factor_enabled' => true,
        ]);

        // Login to get temp token
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $tempToken = $loginResponse['temp_token'];
        $validCode = $this->google2fa->getCurrentOtp($secret);

        // Verify 2FA code
        $response = $this->withHeader('Authorization', 'Bearer ' . $tempToken)
            ->postJson('/api/login/verify', [
                'code' => $validCode,
            ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'token',
                'user',
            ]);
    }

    public function test_user_can_disable_2fa(): void
    {
        // Enable 2FA for the user
        $secret = $this->google2fa->generateSecretKey();
        $this->user->update([
            'two_factor_secret' => $secret,
            'two_factor_enabled' => true,
        ]);

        $token = $this->user->createToken('auth_token')->plainTextToken;
        $validCode = $this->google2fa->getCurrentOtp($secret);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/2fa/disable', [
                'code' => $validCode,
            ]);

        $response->assertOk();

        $this->user->refresh();
        $this->assertFalse($this->user->two_factor_enabled);
        $this->assertNull($this->user->two_factor_secret);
    }

    public function test_cannot_setup_2fa_if_already_enabled(): void
    {
        $this->user->update([
            'two_factor_secret' => 'test-secret',
            'two_factor_enabled' => true,
        ]);

        $token = $this->user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/2fa/setup');

        $response->assertStatus(400)
            ->assertJson([
                'message' => '2FA is already enabled for this account',
            ]);
    }
}
