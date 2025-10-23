<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\PasswordReset;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Send a password reset link to the user.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->validated('email');
        
        // Generate a random token
        $token = Str::random(60);
        
        // Delete any existing tokens for this email
        PasswordReset::where('email', $email)->delete();
        
        // Create a new token
        $passwordReset = PasswordReset::create([
            'email' => $email,
            'token' => $token,
            'created_at' => now(),
        ]);
        
        // Find the user and send the notification
        $user = User::where('email', $email)->first();
        $user->sendPasswordResetNotification($token);
        
        // For development, return the token
        if (app()->environment('local', 'development', 'testing')) {
            return response()->json([
                'message' => 'Password reset link has been sent to your email',
                'reset_token' => $token, // Only include in non-production environments
                'email' => $email
            ]);
        }
        
        return response()->json([
            'message' => 'Password reset link has been sent to your email',
        ]);
    }
    
    /**
     * Reset the user's password using the token.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        $passwordReset = PasswordReset::where('email', $validated['email'])
            ->where('token', $validated['token'])
            ->first();
        
        if (!$passwordReset) {
            return response()->json([
                'message' => 'Invalid or expired token',
            ], 400);
        }
        
        // Check if token is expired (1 hour validity)
        $tokenCreatedAt = \Carbon\Carbon::parse($passwordReset->created_at);
        if ($tokenCreatedAt->diffInHours(now()) > 1) {
            // Delete expired token
            $passwordReset->delete();
            
            return response()->json([
                'message' => 'Password reset token has expired',
            ], 400);
        }
        
        // Get the user
        $user = User::where('email', $validated['email'])->first();
        
        // Check if the new password is the same as the old one
        if (Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Your new password cannot be the same as your old password',
            ], 422);
        }
        
        // Update the user's password
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);
        
        // Delete the token after successful reset
        $passwordReset->delete();
        
        return response()->json([
            'message' => 'Password has been reset successfully',
        ]);
    }
}
