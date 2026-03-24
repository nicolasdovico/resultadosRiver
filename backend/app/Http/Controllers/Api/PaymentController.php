<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MercadoPagoService;
use App\Models\User;
use App\Models\Setting;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\PaymentNotificationMail;
use Carbon\Carbon;
use OpenApi\Attributes as OA;

class PaymentController extends Controller
{
    protected $mpService;

    public function __construct(MercadoPagoService $mpService)
    {
        $this->mpService = $mpService;
    }

    #[OA\Post(
        path: '/v1/payments/create-preference',
        summary: 'Create a MercadoPago preference for subscription',
        operationId: 'createPreference',
        tags: ['Payments'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Preference created successfully'),
            new OA\Response(response: 500, description: 'Error creating preference')
        ]
    )]
    public function createPreference(Request $request)
    {
        $user = $request->user();
        
        // Get subscription cost from settings
        $costSetting = Setting::where('key', 'subscription_cost')->first();
        $amount = $costSetting ? $costSetting->value : 5000; // Default 5000 if not set

        try {
            $preference = $this->mpService->createPreference(
                $user->id,
                $amount,
                "Suscripción Semestral - Resultados River"
            );

            return response()->json([
                'preference_id' => $preference->id,
                'init_point' => $preference->init_point,
                'sandbox_init_point' => $preference->sandbox_init_point,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    #[OA\Post(
        path: '/v1/payments/webhook',
        summary: 'Handle MercadoPago webhooks',
        operationId: 'handleWebhook',
        tags: ['Payments'],
        responses: [
            new OA\Response(response: 200, description: 'Webhook handled'),
            new OA\Response(response: 500, description: 'Error processing payment')
        ]
    )]
    public function webhook(Request $request)
    {
        Log::info('MercadoPago Webhook received: ', $request->all());

        $topic = $request->get('topic') ?? $request->get('type');
        
        // Extraction logic for ID
        $id = $request->get('id') ?? $request->get('data_id');
        if (!$id && $request->has('data')) {
            $data = $request->get('data');
            $id = $data['id'] ?? null;
        }

        if ($topic === 'payment' && $id) {
            try {
                $payment = $this->mpService->getPayment($id);
                
                if ($payment->status === 'approved') {
                    $userId = $payment->external_reference;
                    $user = User::find($userId);

                    if ($user) {
                        $this->processApprovedPayment($user, $payment);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Error processing MP Webhook: ' . $e->getMessage());
                return response()->json(['error' => 'Error processing payment'], 500);
            }
        }

        return response()->json(['status' => 'ok'], 200);
    }

    private function processApprovedPayment(User $user, $paymentData)
    {
        // Save payment record
        Payment::create([
            'user_id' => $user->id,
            'transaction_id' => (string)$paymentData->id,
            'amount' => $paymentData->transaction_amount,
            'status' => 'approved',
            'payment_date' => Carbon::now(),
        ]);

        // Create or update subscription
        Subscription::updateOrCreate(
            ['user_id' => $user->id],
            [
                'plan' => 'premium',
                'status' => 'active',
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonths(6),
            ]
        );

        // Elevate user to Premium role
        $premiumRole = Role::where('name', 'PREMIUM')->first();
        if ($premiumRole && !$user->hasRole('PREMIUM')) {
            $user->roles()->syncWithoutDetaching([$premiumRole->id]);
        }

        // Send Notification Mail
        Mail::to($user->email)->send(new PaymentNotificationMail('approved', $paymentData->transaction_amount));

        Log::info("User {$user->id} upgraded to Premium via Payment {$paymentData->id}");
    }
}
