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
        Schema::table('fases', function (Blueprint $table) {
            $table->renameColumn('fase_desc', 'fase');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fases', function (Blueprint $table) {
            $table->renameColumn('fase', 'fase_desc');
        });
    }
};
