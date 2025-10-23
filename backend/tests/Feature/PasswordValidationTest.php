<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class PasswordValidationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test if the password validation rules reject a weak password
     */
    public function test_password_validation_rules_reject_weak_password()
    {
        // Create instance of RegisterRequest validation rules
        $rules = [
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->letters()->numbers()->symbols()],
        ];

        // Create validator instance with a weak password
        $validator = app('validator')->make([
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ], $rules);

        // The validation should fail
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('password', $validator->errors()->toArray());
    }

    /**
     * Test if the password validation rules accept a strong password
     */
    public function test_password_validation_rules_accept_strong_password()
    {
        // Create instance of RegisterRequest validation rules
        $rules = [
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->letters()->numbers()->symbols()],
        ];

        // Create validator instance with a strong password
        $validator = app('validator')->make([
            'password' => 'StrongP@ssword123',
            'password_confirmation' => 'StrongP@ssword123',
        ], $rules);

        // The validation should pass
        $this->assertTrue($validator->passes());
        $this->assertFalse($validator->fails());
    }
}