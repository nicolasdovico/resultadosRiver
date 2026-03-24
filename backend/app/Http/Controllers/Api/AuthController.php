<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Models\OtpVerification;
use App\Mail\OtpMail;
use Carbon\Carbon;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
        path: '/v1/auth/register',
        summary: 'Register a new user',
        operationId: 'register',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Juan Perez'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'juan@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'password123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'password123')
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'User registered successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'User registered successfully. Please verify your email with the OTP sent.'),
                        new OA\Property(property: 'user', type: 'object')
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error')
        ]
    )]
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign 'FREE' role by default (assuming it exists or will be created)
        $freeRole = Role::where('name', 'FREE')->first();
        if ($freeRole) {
            $user->roles()->attach($freeRole->id);
        }

        // Generate and send OTP
        $this->generateAndSendOtp($user);

        return response()->json([
            'message' => 'User registered successfully. Please verify your email with the OTP sent.',
            'user' => $user
        ], 201);
    }

    #[OA\Post(
        path: '/v1/auth/login',
        summary: 'Login a user',
        operationId: 'login',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'juan@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'password123')
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Login successful',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'access_token', type: 'string', example: '1|asdf...'),
                        new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
                        new OA\Property(property: 'user', type: 'object')
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Invalid credentials')
        ]
    )]
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid login details'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        // Check if email is verified (OTP flow)
        if (!$user->email_verified_at) {
            return response()->json(['message' => 'Email not verified.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('roles')
        ]);
    }

    #[OA\Post(
        path: '/v1/auth/verify-otp',
        summary: 'Verify OTP code',
        operationId: 'verifyOtp',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'code'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'juan@example.com'),
                    new OA\Property(property: 'code', type: 'string', example: '123456')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'OTP verified successfully'),
            new OA\Response(response: 400, description: 'Invalid or expired OTP')
        ]
    )]
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $otp = OtpVerification::where('user_id', $user->id)
            ->where('code', $request->code)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otp) {
            // Check for failed attempts
            $lastOtp = OtpVerification::where('user_id', $user->id)
                ->where('is_used', false)
                ->latest()
                ->first();
            
            if ($lastOtp) {
                $lastOtp->increment('attempts');
                if ($lastOtp->attempts >= 3) {
                    $lastOtp->update(['is_used' => true]); // Block this OTP
                    return response()->json(['message' => 'Too many failed attempts. Please request a new code.'], 400);
                }
            }

            return response()->json(['message' => 'Invalid or expired OTP code'], 400);
        }

        $otp->update(['is_used' => true]);
        $user->update(['email_verified_at' => Carbon::now()]);

        return response()->json(['message' => 'OTP verified successfully. You can now login.']);
    }

    #[OA\Post(
        path: '/v1/auth/resend-otp',
        summary: 'Resend OTP code',
        operationId: 'resendOtp',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'juan@example.com')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'OTP sent successfully')
        ]
    )]
    public function resendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified'], 400);
        }

        $this->generateAndSendOtp($user);

        return response()->json(['message' => 'A new OTP code has been sent to your email.']);
    }

    #[OA\Post(
        path: '/v1/auth/forgot-password',
        summary: 'Request a password reset OTP',
        operationId: 'forgotPassword',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'juan@example.com')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'OTP sent successfully')
        ]
    )]
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $this->generateAndSendOtp($user);

        return response()->json(['message' => 'A password reset OTP has been sent to your email.']);
    }

    #[OA\Post(
        path: '/v1/auth/reset-password',
        summary: 'Reset password using OTP',
        operationId: 'resetPassword',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'code', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'juan@example.com'),
                    new OA\Property(property: 'code', type: 'string', example: '123456'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'newpassword123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'newpassword123')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Password reset successfully'),
            new OA\Response(response: 400, description: 'Invalid or expired OTP')
        ]
    )]
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $otp = OtpVerification::where('user_id', $user->id)
            ->where('code', $request->code)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otp) {
            return response()->json(['message' => 'Invalid or expired OTP code'], 400);
        }

        $otp->update(['is_used' => true]);
        $user->update([
            'password' => Hash::make($request->password),
            'email_verified_at' => $user->email_verified_at ?? Carbon::now()
        ]);

        return response()->json(['message' => 'Password reset successfully.']);
    }

    private function generateAndSendOtp(User $user)
    {
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        OtpVerification::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(5),
        ]);

        Mail::to($user->email)->send(new OtpMail($code));
    }
}
