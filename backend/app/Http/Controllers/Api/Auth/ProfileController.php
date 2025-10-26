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
        
        // Force fresh data from database
        $user = $request->user()->fresh();
        
        return response()->json($user);
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

        // If email is changed, mark as unverified and send verification email
        $emailChanged = false;
        Log::info('Profile update', [
            'old_email' => $user->email,
            'new_email' => $validated['email'],
            'email_verified_at_before' => $user->email_verified_at,
        ]);
        
        if ($validated['email'] !== $user->email) {
            $emailChanged = true;
            Log::info('Email changed, marking as unverified');
        }

        // Update basic fields
        $user->update([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'mobile_number' => $validated['mobile_number'],
        ]);
        
        // If email changed, explicitly set email_verified_at to null
        if ($emailChanged) {
            $user->email_verified_at = null;
            $user->save();
        }
        
        Log::info('After update', [
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'fresh_email_verified_at' => $user->fresh()->email_verified_at,
        ]);

        // Send verification email if email was changed
        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
            Log::info('Verification email sent to new address');
        }

        $response = [
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ];

        if ($emailChanged) {
            $response['message'] = 'Profile updated successfully. Please check your email to verify your new address.';
            $response['email_changed'] = true;
        }

        return response()->json($response);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        // Support both field naming conventions
        $passwordField = $request->has('new_password') ? 'new_password' : 'password';
        $currentPasswordField = 'current_password';
        
        $rules = [
            'current_password' => ['required', 'string'],
            $passwordField => ['required', 'string', Password::min(8)->mixedCase()->numbers()->symbols()],
        ];
        
        // Add confirmation field validation based on which naming convention is used
        if ($passwordField === 'new_password') {
            $rules['new_password_confirmation'] = ['required', 'string'];
        } else {
            $rules['password_confirmation'] = ['required', 'string'];
        }

        $validated = $request->validate($rules);

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'The current password is incorrect.',
                'errors' => [
                    'current_password' => ['The current password is incorrect.']
                ]
            ], 422);
        }
        
        $newPassword = $validated[$passwordField];
        $confirmation = $passwordField === 'new_password' 
            ? $validated['new_password_confirmation'] 
            : $validated['password_confirmation'];
        
        // Check if passwords match
        if ($newPassword !== $confirmation) {
            $confirmationField = $passwordField === 'new_password' ? 'new_password_confirmation' : 'password_confirmation';
            return response()->json([
                'message' => 'The passwords do not match.',
                'errors' => [
                    $confirmationField => ['The passwords do not match.']
                ]
            ], 422);
        }
        
        // Check if new password is same as current password
        if (Hash::check($newPassword, $user->password)) {
            return response()->json([
                'message' => 'New password must be different from current password.',
                'errors' => [
                    $passwordField => ['New password must be different from current password.']
                ]
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($newPassword)
        ]);

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }
}
