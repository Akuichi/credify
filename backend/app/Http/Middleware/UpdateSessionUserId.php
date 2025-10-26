<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class UpdateSessionUserId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Update user_id BEFORE processing the request
        if ($request->user() && $request->session()->getId()) {
            $sessionId = $request->session()->getId();
            $userId = $request->user()->id;

            // Always update to ensure user_id is set
            DB::table('sessions')
                ->where('id', $sessionId)
                ->update(['user_id' => $userId]);
        }

        $response = $next($request);

        // Also update AFTER the request to catch any session changes
        if ($request->user() && $request->session()->getId()) {
            $sessionId = $request->session()->getId();
            $userId = $request->user()->id;

            DB::table('sessions')
                ->where('id', $sessionId)
                ->update(['user_id' => $userId]);
        }

        return $response;
    }
}
