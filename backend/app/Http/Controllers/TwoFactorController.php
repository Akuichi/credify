<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PragmaRX\Google2FA\Google2FA;
use Illuminate\Support\Facades\Validator;
use Bacon\QrCode\Renderer\ImageRenderer;
use Bacon\QrCode\Renderer\RendererStyle\RendererStyle;
use Bacon\QrCode\Renderer\Image\SvgImageBackEnd;
use Bacon\QrCode\Writer;

class TwoFactorController extends Controller
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    public function setup(Request $request)
    {
        $user = $request->user();
        $secret = $this->google2fa->generateSecretKey();

        $user->two_factor_secret = $secret;
        $user->save();

        // Generate QR code URL
        $inlineUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        // Try to generate a QR code data URI for frontend display
        $qrDataUri = null;
        try {
            $renderer = new ImageRenderer(
                new RendererStyle(200),
                new SvgImageBackEnd()
            );
            $writer = new Writer($renderer);
            $svg = $writer->writeString($inlineUrl);
            $qrDataUri = 'data:image/svg+xml;utf8,' . rawurlencode($svg);
        } catch (\Exception $e) {
            // if BaconQrCode not installed, just return otpauth URL
            $qrDataUri = null;
        }

        return response()->json(['secret' => $secret, 'otp_auth_url' => $inlineUrl, 'qr_data_uri' => $qrDataUri]);
    }

    public function verify(Request $request)
    {
        $v = Validator::make($request->all(), [
            'code' => 'required|digits:6'
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $user = $request->user();
        $secret = $user->two_factor_secret;

        if (! $secret) {
            return response()->json(['message' => 'No 2FA setup found'], 400);
        }

        $valid = $this->google2fa->verifyKey($secret, $request->code);

        if ($valid) {
            $user->two_factor_enabled = true;
            $user->save();
            return response()->json(['message' => '2FA enabled']);
        }

        return response()->json(['message' => 'Invalid code'], 400);
    }

    public function disable(Request $request)
    {
        $v = Validator::make($request->all(), [
            'password' => 'required|string'
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $user = $request->user();

        if (! \Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Wrong password'], 401);
        }

        $user->two_factor_secret = null;
        $user->two_factor_enabled = false;
        $user->save();

        return response()->json(['message' => '2FA disabled']);
    }
}
