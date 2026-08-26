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
        Schema::table('estadisticas', function (Blueprint $table) {
            $table->index('torneo', 'idx_estadisticas_torneo');
            $table->index('adversario', 'idx_estadisticas_adversario');
            $table->index('estadio', 'idx_estadisticas_estadio');
            $table->index('arbitro', 'idx_estadisticas_arbitro');
            $table->index('condicion', 'idx_estadisticas_condicion');
            $table->index('fase', 'idx_estadisticas_fase');
        });

        Schema::table('torneos', function (Blueprint $table) {
            $table->index('tor_nivel', 'idx_torneos_tor_nivel');
            $table->index('tor_desc', 'idx_torneos_tor_desc');
        });

        Schema::table('rivales', function (Blueprint $table) {
            $table->index('ri_desc', 'idx_rivales_ri_desc');
        });

        Schema::table('goles', function (Blueprint $table) {
            $table->index('gol_fecha', 'idx_goles_gol_fecha');
            $table->index('gol_juga', 'idx_goles_gol_juga');
            $table->index('gol_parariver', 'idx_goles_gol_parariver');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('estadisticas', function (Blueprint $table) {
            $table->dropIndex('idx_estadisticas_torneo');
            $table->dropIndex('idx_estadisticas_adversario');
            $table->dropIndex('idx_estadisticas_estadio');
            $table->dropIndex('idx_estadisticas_arbitro');
            $table->dropIndex('idx_estadisticas_condicion');
            $table->dropIndex('idx_estadisticas_fase');
        });

        Schema::table('torneos', function (Blueprint $table) {
            $table->dropIndex('idx_torneos_tor_nivel');
            $table->dropIndex('idx_torneos_tor_desc');
        });

        Schema::table('rivales', function (Blueprint $table) {
            $table->dropIndex('idx_rivales_ri_desc');
        });

        Schema::table('goles', function (Blueprint $table) {
            $table->dropIndex('idx_goles_gol_fecha');
            $table->dropIndex('idx_goles_gol_juga');
            $table->dropIndex('idx_goles_gol_parariver');
        });
    }
};
