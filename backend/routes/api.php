<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\ProfileController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\TwoFactorAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes - move to regular web middleware for proper session handling
Route::post('/register', RegisterController::class)->middleware(['web', 'throttle:6,1']);
Route::post('/login', LoginController::class)->middleware(['web', 'throttle:6,1']);

// CSRF cookie route for SPA authentication 
Route::get('/csrf-cookie', function() {
    return response()->json(['message' => 'CSRF cookie set']);
})->middleware('web');

// 2FA verification during login (requires temp token)
Route::middleware(['web', 'auth:sanctum'])->post('/login/verify', [TwoFactorAuthController::class, 'verifyLogin']);

// Debug endpoint to test session and auth state
Route::middleware('web')->get('/debug', function(\Illuminate\Http\Request $request) {
    return response()->json([
        'authenticated' => auth()->check(),
        'user' => auth()->user(),
        'session_id' => $request->session()->getId(),
        'has_session' => $request->hasSession(),
        'csrf_token' => csrf_token(),
    ]);
});

// Protected routes - ensure web middleware is applied first for session access
Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::post('/logout', LogoutController::class);
    
    // Profile routes
    Route::get('/user', [ProfileController::class, 'show']);
    Route::patch('/user', [ProfileController::class, 'update']);
    
    // 2FA management routes
    Route::prefix('2fa')->group(function () {
        Route::post('/setup', [TwoFactorAuthController::class, 'setup']);
        Route::post('/verify', [TwoFactorAuthController::class, 'verify']);
        Route::post('/disable', [TwoFactorAuthController::class, 'disable']);
    });
});
