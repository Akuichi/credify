<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SessionController extends Controller
{
    /**
     * Parse user agent to extract device/browser info
     */
    private function parseUserAgent(?string $userAgent): array
    {
        if (!$userAgent) {
            return ['name' => 'Unknown', 'type' => 'unknown'];
        }

        // Detect browser
        $browser = 'Unknown';
        if (preg_match('/Edge\/([\d.]+)/', $userAgent)) {
            $browser = 'Microsoft Edge';
        } elseif (preg_match('/Edg\/([\d.]+)/', $userAgent)) {
            $browser = 'Microsoft Edge';
        } elseif (preg_match('/Chrome\/([\d.]+)/', $userAgent) && !preg_match('/Edg/', $userAgent)) {
            $browser = 'Google Chrome';
        } elseif (preg_match('/Safari\/([\d.]+)/', $userAgent) && !preg_match('/Chrome/', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/Firefox\/([\d.]+)/', $userAgent)) {
            $browser = 'Mozilla Firefox';
        } elseif (preg_match('/MSIE|Trident/', $userAgent)) {
            $browser = 'Internet Explorer';
        }

        // Detect OS/Device
        $device = 'Unknown';
        if (preg_match('/Windows NT ([\d.]+)/', $userAgent)) {
            $device = 'Windows';
        } elseif (preg_match('/Mac OS X/', $userAgent)) {
            $device = 'macOS';
        } elseif (preg_match('/Linux/', $userAgent)) {
            $device = 'Linux';
        } elseif (preg_match('/iPhone/', $userAgent)) {
            $device = 'iPhone';
        } elseif (preg_match('/iPad/', $userAgent)) {
            $device = 'iPad';
        } elseif (preg_match('/Android/', $userAgent)) {
            $device = 'Android';
        }

        return [
            'name' => "{$browser} on {$device}",
            'browser' => $browser,
            'device' => $device,
            'type' => preg_match('/Mobile|Android|iPhone|iPad/', $userAgent) ? 'mobile' : 'desktop'
        ];
    }

    /**
     * Get all active sessions for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Force save the current session to database before querying
        $request->session()->save();
        
        $currentSessionId = $request->session()->getId();
        
        // Get all active sessions for this user from database
        $sessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderBy('last_activity', 'desc')
            ->get();
        
        // Format session data
        $formattedSessions = $sessions->map(function($session) use ($currentSessionId) {
            $isCurrent = $session->id === $currentSessionId;
            $deviceInfo = $this->parseUserAgent($session->user_agent);
            
            return [
                'id' => $session->id,
                'name' => $deviceInfo['name'],
                'browser' => $deviceInfo['browser'] ?? 'Unknown',
                'device' => $deviceInfo['device'] ?? 'Unknown',
                'type' => $deviceInfo['type'] ?? 'unknown',
                'ip_address' => $session->ip_address,
                'created_at' => date('Y-m-d H:i:s', $session->last_activity),
                'last_used_at' => date('Y-m-d H:i:s', $session->last_activity),
                'is_current' => $isCurrent,
            ];
        });

        return response()->json([
            'current_session' => $currentSessionId,
            'sessions' => $formattedSessions,
        ]);
    }

    /**
     * Terminate a specific session
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $currentSessionId = $request->session()->getId();
        
        // Prevent deleting current session
        if ($id === $currentSessionId) {
            return response()->json(['message' => 'Cannot terminate current session'], 400);
        }
        
        // Delete the session
        $deleted = DB::table('sessions')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->delete();
        
        if (!$deleted) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        return response()->json(['message' => 'Session terminated successfully']);
    }

    /**
     * Terminate all other sessions
     */
    public function destroyOthers(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentSessionId = $request->session()->getId();
        
        // Delete all sessions except the current one
        DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        return response()->json(['message' => 'All other sessions terminated']);
    }
}