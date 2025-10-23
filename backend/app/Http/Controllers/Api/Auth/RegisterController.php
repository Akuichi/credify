<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'mobile_number' => $validated['mobile_number'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        // Send email verification
        $user->sendEmailVerificationNotification();
        
        // Log the user in for SPA and regenerate session
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'User registered successfully. Please check your email for verification link.',
            'user' => $user,
        ], 201);
    }
}
