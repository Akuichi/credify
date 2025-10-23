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
        $currentToken = $user->currentAccessToken();
        $isCurrentTokenTransient = $currentToken instanceof \Laravel\Sanctum\TransientToken;
        
        // Get all active tokens
        $sessions = $user->tokens()->get();
        
        // Format session data to exclude sensitive information
        $formattedSessions = $sessions->map(function($token) use ($isCurrentTokenTransient, $request) {
            $isCurrent = false;
            
            // If using API tokens, mark current token
            if (!$isCurrentTokenTransient && $token->id === $request->user()->currentAccessToken()->id) {
                $isCurrent = true;
            }
            
            return [
                'id' => $token->id,
                'name' => $token->name,
                'created_at' => $token->created_at,
                'last_used_at' => $token->last_used_at,
                'is_current' => $isCurrent,
            ];
        });
        
        // Add browser session information if we're using a session
        if ($isCurrentTokenTransient) {
            $browserSession = [
                'id' => 'current-browser-session',
                'name' => 'Current browser session',
                'created_at' => now(),
                'last_used_at' => now(),
                'is_current' => true,
            ];
            
            $formattedSessions->prepend($browserSession);
        }

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
        
        // If we're using a session (TransientToken), just delete all tokens
        // If we're using a token, delete all other tokens
        if ($currentToken instanceof \Laravel\Sanctum\TransientToken) {
            // Using session authentication, delete all tokens
            $user->tokens()->delete();
        } else {
            // Using token authentication, delete all except current
            $user->tokens()
                ->where('id', '!=', $currentToken->id)
                ->delete();
        }

        return response()->json(['message' => 'All other sessions terminated']);
    }
}