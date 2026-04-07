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
        if (!Schema::hasColumn("rivales", "escudo")) {
            Schema::table("rivales", function (Blueprint $table) {
                $table->string("escudo")->nullable()->after("ri_desc");
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn("rivales", "escudo")) {
            Schema::table("rivales", function (Blueprint $table) {
                $table->dropColumn("escudo");
            });
        }
    }
};
