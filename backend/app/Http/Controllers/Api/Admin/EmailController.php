<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailController extends Controller
{
    /**
     * Test email configuration
     */
    public function testEmailConfig(Request $request): JsonResponse
    {
        try {
            $userEmail = $request->user()->email;
            
            // Send a test email to the currently logged-in user
            Mail::raw('This is a test email from Credify to verify the email configuration is working correctly.', function ($message) use ($userEmail) {
                $message->to($userEmail)
                    ->subject('Credify Email Configuration Test');
            });
            
            return response()->json([
                'message' => 'Test email sent successfully. Check your inbox or email service dashboard.',
                'config' => [
                    'driver' => config('mail.default'),
                    'host' => config('mail.mailers.smtp.host'),
                    'port' => config('mail.mailers.smtp.port'),
                    'from_address' => config('mail.from.address'),
                    'from_name' => config('mail.from.name')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send test email',
                'error' => $e->getMessage(),
                'config' => [
                    'driver' => config('mail.default'),
                    'host' => config('mail.mailers.smtp.host'),
                    'port' => config('mail.mailers.smtp.port'),
                    'from_address' => config('mail.from.address'),
                    'from_name' => config('mail.from.name')
                ]
            ], 500);
        }
    }
    
    /**
     * Send a test verification email to a specific user
     */
    public function sendTestVerificationEmail(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);
        
        try {
            $user = User::findOrFail($request->input('user_id'));
            
            // Send the verification email
            $user->sendEmailVerificationNotification();
            
            return response()->json([
                'message' => 'Verification email sent successfully to ' . $user->email,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send verification email',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}