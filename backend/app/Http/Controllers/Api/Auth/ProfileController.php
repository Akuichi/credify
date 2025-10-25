<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        // Add debug logging
        Log::info('User request', [
            'user' => $request->user(),
            'auth' => auth()->check(),
            'session_id' => $request->session()->getId(),
            'session_has_data' => $request->session()->all(),
        ]);
        
        return response()->json($request->user());
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:255'],
            'mobile_number' => ['sometimes', 'nullable', 'string', 'max:20'],
        ]);

        $request->user()->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $request->user()->fresh(),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'mobile_number' => ['nullable', 'string', 'max:20'],
        ]);

        // If email is changed, mark as unverified
        $emailChanged = false;
        if ($validated['email'] !== $user->email) {
            $validated['email_verified_at'] = null;
            $emailChanged = true;
        }

        $user->update($validated);

        $response = [
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ];

        if ($emailChanged) {
            $response['message'] = 'Profile updated successfully. Please verify your new email address.';
        }

        return response()->json($response);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', Password::min(8)->mixedCase()->numbers()->symbols(), 'confirmed'],
        ]);

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'The current password is incorrect.',
                'errors' => [
                    'current_password' => ['The current password is incorrect.']
                ]
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }
}
