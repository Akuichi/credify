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

// Public routes
Route::post('/register', RegisterController::class)->middleware('throttle:6,1');
Route::post('/login', LoginController::class)->middleware('throttle:6,1');

// 2FA verification during login (requires temp token)
Route::middleware('auth:sanctum')->post('/login/verify', [TwoFactorAuthController::class, 'verifyLogin']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
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
