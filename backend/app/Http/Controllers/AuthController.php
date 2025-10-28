<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $v = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'mobile_number' => 'nullable|string|max:20',
            'password' => ['required','string','min:8','regex:/[A-Z]/','regex:/[0-9]/','confirmed'],
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'mobile_number' => $request->mobile_number,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Registered'], 201);
    }

    public function login(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // If user has 2FA enabled, require TOTP verification as a second step.
        if ($user->two_factor_enabled) {
            $tempKey = 'login_2fa_' . Str::random(48);
            // store user id and client info for a short time (5 minutes)
            Cache::put($tempKey, [
                'user_id' => $user->id,
                'ip' => $request->ip(),
                'user_agent' => $request->header('User-Agent')
            ], now()->addMinutes(5));

            return response()->json([
                'two_factor' => true,
                'temp_token' => $tempKey,
                'message' => 'Two-factor authentication required'
            ], 200);
        }

        // No 2FA — create token and record login
        $token = $user->createToken('api-token')->plainTextToken;

        $user->last_login_at = now();
        $user->last_login_ip = $request->ip();
        $user->save();

        // record login log (optional table)
        try {
            DB::table('login_logs')->insert([
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            // swallow: migration may not exist yet in scaffolded repo
        }

        return response()->json(['token' => $token, 'user' => $user], 200);
    }

    public function logout(Request $request)
    {
        // Delete the current access token if using API tokens
        if ($request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        
        // Invalidate the session (important for cookie-based auth)
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    /**
     * Verify the TOTP code after initial password verification.
     * Expects: temp_token, code
     */
    public function verifyLogin(Request $request)
    {
        $v = Validator::make($request->all(), [
            'temp_token' => 'required|string',
            'code' => 'required|digits:6'
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $data = Cache::get($request->temp_token);

        if (! $data) {
            return response()->json(['message' => 'Temp token expired or invalid'], 400);
        }

        $user = User::find($data['user_id']);

        if (! $user || ! $user->two_factor_enabled || ! $user->two_factor_secret) {
            return response()->json(['message' => '2FA not configured for this user'], 400);
        }

        $google2fa = new \PragmaRX\Google2FA\Google2FA();
        $valid = $google2fa->verifyKey($user->two_factor_secret, $request->code);

        if (! $valid) {
            return response()->json(['message' => 'Invalid two-factor code'], 401);
        }

        // Create token
        $token = $user->createToken('api-token')->plainTextToken;

        $user->last_login_at = now();
        $user->last_login_ip = $data['ip'] ?? null;
        $user->save();

        // insert login log if table exists
        try {
            DB::table('login_logs')->insert([
                'user_id' => $user->id,
                'ip_address' => $data['ip'] ?? null,
                'user_agent' => $data['user_agent'] ?? null,
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
        }

        // remove temp token
        Cache::forget($request->temp_token);

        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function verifyPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password'], 401);
        }

        return response()->json(['message' => 'Password verified']);
    }
}
