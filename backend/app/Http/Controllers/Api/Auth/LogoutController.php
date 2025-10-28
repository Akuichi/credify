<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        // Support both session-based and token-based logout
        // If using personal access tokens (not TransientToken from session auth)
        $currentToken = $request->user()->currentAccessToken();
        if ($currentToken && !($currentToken instanceof \Laravel\Sanctum\TransientToken)) {
            $currentToken->delete();
        }

        // Logout from the web guard
        Auth::guard('web')->logout();

        // Invalidate session for SPA
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // Create response and clear ALL auth-related cookies
        $response = response()->json([
            'message' => 'Successfully logged out',
        ]);

        // Get cookie names from config
        $sessionCookie = config('session.cookie');
        $csrfCookie = 'XSRF-TOKEN';
        
        // Forget both session and CSRF cookies with proper domain and path
        return $response
            ->withCookie(cookie()->forget($sessionCookie, '/', config('session.domain')))
            ->withCookie(cookie()->forget($csrfCookie, '/', config('session.domain')));
    }
}
