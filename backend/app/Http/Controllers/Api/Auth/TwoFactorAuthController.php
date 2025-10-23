<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\TwoFactorVerifyRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class TwoFactorAuthController extends Controller
{
    public function __construct(
        private readonly Google2FA $google2fa
    ) {}

    /**
     * Generate 2FA secret and QR code for setup
     */
    public function setup(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if 2FA is already enabled
        if ($user->two_factor_enabled) {
            return response()->json([
                'message' => '2FA is already enabled for this account',
            ], 400);
        }

        // Generate secret key
        $secretKey = $this->google2fa->generateSecretKey();

        // Store the secret key temporarily (not enabled yet)
        $user->update([
            'two_factor_secret' => $secretKey,
            'two_factor_enabled' => false,
        ]);

        // Generate QR code URL
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secretKey
        );

        // Generate QR code as SVG (doesn't require Imagick extension)
        $renderer = new ImageRenderer(
            new RendererStyle(300),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);
        $qrCodeImage = base64_encode($writer->writeString($qrCodeUrl));

        return response()->json([
            'message' => '2FA setup initiated',
            'secret' => $secretKey,
            'qr_code' => 'data:image/svg+xml;base64,' . $qrCodeImage,
        ]);
    }

    /**
     * Verify and enable 2FA
     */
    public function verify(TwoFactorVerifyRequest $request): JsonResponse
    {
        $user = $request->user();
        $code = $request->validated()['code'];

        // Verify the code
        $valid = $this->google2fa->verifyKey(
            $user->two_factor_secret,
            $code
        );

        if (!$valid) {
            return response()->json([
                'message' => 'Invalid verification code',
            ], 422);
        }

        // Enable 2FA
        $user->update([
            'two_factor_enabled' => true,
        ]);

        return response()->json([
            'message' => '2FA has been enabled successfully',
        ]);
    }

    /**
     * Verify 2FA code during login
     */
    public function verifyLogin(TwoFactorVerifyRequest $request): JsonResponse
    {
        // Check if token is a temporary token
        $token = $request->user()->currentAccessToken();
        if (!$token || !$token->can('2fa-verify')) {
            return response()->json([
                'message' => 'Invalid or expired token',
            ], 403);
        }

        $user = $request->user();
        $code = $request->validated()['code'];

        // Verify the code
        $valid = $this->google2fa->verifyKey(
            $user->two_factor_secret,
            $code
        );

        if (!$valid) {
            return response()->json([
                'message' => 'Invalid verification code',
            ], 422);
        }

        // Create a new token with full access
        $token = $user->createToken('auth_token')->plainTextToken;

        // Only delete the token if it's not a transient token
        $currentToken = $request->user()->currentAccessToken();
        if (!($currentToken instanceof \Laravel\Sanctum\TransientToken)) {
            $currentToken->delete();
        }

        // Record the login
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        // Create login log entry
        $user->loginLogs()->create([
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Two-factor authentication successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Disable 2FA
     */
    public function disable(TwoFactorVerifyRequest $request): JsonResponse
    {
        $user = $request->user();
        $code = $request->validated()['code'];

        // Verify the code first
        $valid = $this->google2fa->verifyKey(
            $user->two_factor_secret,
            $code
        );

        if (!$valid) {
            return response()->json([
                'message' => 'Invalid verification code',
            ], 422);
        }

        // Disable 2FA
        $user->update([
            'two_factor_secret' => null,
            'two_factor_enabled' => false,
        ]);

        return response()->json([
            'message' => '2FA has been disabled successfully',
        ]);
    }
}
