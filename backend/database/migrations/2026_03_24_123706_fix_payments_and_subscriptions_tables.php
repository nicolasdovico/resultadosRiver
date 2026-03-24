<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->renameColumn('payment_id', 'transaction_id');
            $table->timestamp('payment_date')->nullable();
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->renameColumn('ends_at', 'expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->renameColumn('transaction_id', 'payment_id');
            if (Schema::hasColumn('payments', 'payment_date')) {
                $table->dropColumn('payment_date');
            }
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->renameColumn('expires_at', 'ends_at');
        });
    }
};
