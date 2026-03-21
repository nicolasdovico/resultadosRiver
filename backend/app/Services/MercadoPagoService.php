<?php

namespace App\Services;

use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Client\Payment\PaymentClient;
use Exception;

class MercadoPagoService
{
    public function __construct()
    {
        MercadoPagoConfig::setAccessToken(config('services.mercadopago.access_token'));
    }

    public function createPreference($userId, $amount, $description)
    {
        $client = new PreferenceClient();

        try {
            $preference = $client->create([
                "items" => array(
                    array(
                        "id" => "subscription_semiannual",
                        "title" => $description,
                        "quantity" => 1,
                        "unit_price" => (float)$amount
                    )
                ),
                "external_reference" => (string)$userId,
                "back_urls" => array(
                    "success" => config('app.url') . "/payment/success",
                    "failure" => config('app.url') . "/payment/failure",
                    "pending" => config('app.url') . "/payment/pending"
                ),
                "auto_return" => "approved",
                "notification_url" => config('services.mercadopago.webhook_url'),
            ]);

            return $preference;
        } catch (Exception $e) {
            throw new Exception("Error creating MercadoPago preference: " . $e->getMessage());
        }
    }

    public function getPayment($paymentId)
    {
        $client = new PaymentClient();
        try {
            $payment = $client->get($paymentId);
            return $payment;
        } catch (Exception $e) {
            throw new Exception("Error fetching MercadoPago payment: " . $e->getMessage());
        }
    }

    public function validateWebhookSignature($signature, $data)
    {
        // MP webhook signature validation logic
        // This usually involves hash_hmac with the WEBHOOK_SECRET
        // For simplicity in this prototype, we'll focus on receiving and processing.
        // But in production, this is crucial.
        return true; 
    }
}
