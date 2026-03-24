<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Models\Setting;
use App\Services\MercadoPagoService;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use App\Mail\PaymentNotificationMail;
use Mockery;
use Tests\TestCase;

class PremiumUpgradeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
        Mail::fake();
    }

    public function test_user_can_register_and_starts_with_free_role()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/v1/auth/register', $userData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
        
        $user = User::where('email', 'test@example.com')->first();
        $this->assertTrue($user->hasRole('FREE'));
        $this->assertFalse($user->isPremium());
        
        Mail::assertQueued(OtpMail::class);
    }

    public function test_user_can_upgrade_to_premium_via_webhook()
    {
        // 1. Create a verified user
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $freeRole = Role::where('name', 'FREE')->first();
        $user->roles()->attach($freeRole->id);

        $this->assertFalse($user->isPremium());

        // 2. Mock MercadoPagoService
        $mockMp = Mockery::mock(MercadoPagoService::class);
        $this->app->instance(MercadoPagoService::class, $mockMp);

        // Mock getting payment details
        $paymentData = (object)[
            'id' => '123456789',
            'status' => 'approved',
            'transaction_amount' => 5000.00,
            'external_reference' => (string)$user->id,
        ];

        $mockMp->shouldReceive('getPayment')
            ->with('123456789')
            ->once()
            ->andReturn($paymentData);

        // 3. Simulate Webhook
        $webhookData = [
            'type' => 'payment',
            'data' => [
                'id' => '123456789'
            ]
        ];

        $response = $this->postJson('/api/v1/payments/webhook', $webhookData);

        $response->assertStatus(200);

        // 4. Assertions
        $user->refresh();
        $this->assertTrue($user->isPremium(), 'User should have Premium role after approved payment');
        
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'transaction_id' => '123456789',
            'status' => 'approved'
        ]);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'plan' => 'premium',
            'status' => 'active'
        ]);

        Mail::assertQueued(PaymentNotificationMail::class);
    }
}
