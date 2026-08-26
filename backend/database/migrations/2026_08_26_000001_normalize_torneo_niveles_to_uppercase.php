<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('torneos')
            ->whereRaw("UPPER(TRIM(tor_nivel)) LIKE 'NAC%'")
            ->update(['tor_nivel' => 'NACIONAL']);

        DB::table('torneos')
            ->whereRaw("UPPER(TRIM(tor_nivel)) LIKE 'INTER%'")
            ->update(['tor_nivel' => 'INTERNACIONAL']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Data normalization is irreversible
    }
};
