<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Config;

class VerificationController extends Controller
{
    // We'll define middleware in routes instead of controller constructor

    /**
     * Send email verification notification.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendVerificationEmail(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified'
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification link sent'
        ]);
    }

    /**
     * Verify email.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @param  string  $hash
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        // Check if URL is valid
        if (!URL::hasValidSignature($request)) {
            return response()->json([
                'message' => 'Invalid verification link or link has expired'
            ], 401);
        }

        // Check if user has already verified email
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified'
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // Redirect to frontend verification success page
        return redirect(config('app.frontend_url') . '/email-verified');
    }

    /**
     * Check verification status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function status(Request $request)
    {
        return response()->json([
            'verified' => $request->user() ? $request->user()->hasVerifiedEmail() : false
        ]);
    }
}