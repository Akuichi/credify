<?php

use Illuminate\Support\Facades\Route;

// Sanctum CSRF cookie endpoint for SPA authentication
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Return 404 for non-API routes
Route::fallback(function () {
    return response()->json(['message' => 'Not Found'], 404);
});
