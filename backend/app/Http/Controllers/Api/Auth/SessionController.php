<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    /**
     * Get all active sessions for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get all active tokens
        $sessions = $user->tokens()->get();
        
        // Format session data to exclude sensitive information
        $formattedSessions = $sessions->map(function($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'created_at' => $token->created_at,
                'last_used_at' => $token->last_used_at,
            ];
        });

        // Return also the current session ID
        return response()->json([
            'current_session' => $request->session()->getId(),
            'sessions' => $formattedSessions,
        ]);
    }

    /**
     * Terminate a specific session
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        // Find the token
        $token = $user->tokens()->find($id);
        
        if (!$token) {
            return response()->json(['message' => 'Session not found'], 404);
        }
        
        // Revoke the token
        $token->delete();

        return response()->json(['message' => 'Session terminated successfully']);
    }

    /**
     * Terminate all other sessions
     */
    public function destroyOthers(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentToken = $user->currentAccessToken();
        
        // Delete all tokens except the current one
        $user->tokens()
            ->where('id', '!=', $currentToken->id)
            ->delete();

        return response()->json(['message' => 'All other sessions terminated']);
    }
}