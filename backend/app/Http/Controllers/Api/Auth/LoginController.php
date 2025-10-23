<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Log the login attempt
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        // Create login log entry
        $user->loginLogs()->create([
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Check if 2FA is enabled
        if ($user->two_factor_enabled) {
            $tempToken = $user->createToken('temp_token', ['*'], now()->addMinutes(5))->plainTextToken;
            return response()->json([
                'message' => '2FA verification required',
                'two_factor_required' => true,
                'temp_token' => $tempToken,
            ]);
        }

        // If 2FA is not enabled, authenticate the session for SPA
        // Use web guard + regenerate session to prevent fixation
        // We've already verified the password above, just log the user in directly
        Auth::login($user, $data['remember'] ?? false);

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful',
        ]);
    }
}
