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
        Schema::create('estadisticas', function (Blueprint $table) {
            $table->date('fecha')->primary();
            $table->integer('torneo')->nullable();
            $table->integer('adversario')->nullable();
            $table->integer('arbitro')->nullable();
            $table->integer('go_ri')->nullable();
            $table->integer('go_ad')->nullable();
            $table->integer('estadio')->nullable();
            $table->integer('condicion')->nullable();
            $table->text('observaciones')->nullable();
            $table->integer('fase')->nullable();
            $table->integer('fecha_nro')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estadisticas');
    }
};
