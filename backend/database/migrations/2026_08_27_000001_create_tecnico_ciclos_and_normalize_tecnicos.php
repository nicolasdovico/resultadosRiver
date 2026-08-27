<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create tecnico_ciclos table
        Schema::create('tecnico_ciclos', function (Blueprint $table) {
            $table->id();
            $table->integer('tecnico_id');
            $table->integer('numero_ciclo')->default(1);
            $table->date('desde');
            $table->date('hasta')->nullable();
            $table->string('cargo', 50)->default('TITULAR');
            $table->text('observaciones')->nullable();
            $table->string('foto_ciclo', 255)->nullable();
            $table->timestamps();

            $table->foreign('tecnico_id')
                ->references('id_tecnicos')
                ->on('tecnicos')
                ->onDelete('cascade');

            $table->index('tecnico_id');
            $table->index(['desde', 'hasta']);
        });

        // 2. Read all existing tecnicos
        $all = DB::table('tecnicos')->get();
        $grouped = [];

        foreach ($all as $t) {
            $raw = trim($t->tec_ape_nom);
            $clean = preg_replace('/\s*\([^)]*\)/', '', $raw);
            $clean = str_replace(' TRANSFERMARKET', '', $clean);
            $clean = trim($clean);
            $grouped[$clean][] = $t;
        }

        // For each group, determine the master record and create ciclos
        foreach ($grouped as $cleanName => $records) {
            // Sort records by `desde` ASC
            usort($records, function ($a, $b) {
                return strcmp($a->desde, $b->desde);
            });

            // Master record: prefer the record with photo or lowest ID
            $photoRecord = collect($records)->first(fn($r) => !empty($r->tec_foto));
            $masterRecord = $photoRecord ?? $records[0];
            $masterId = $masterRecord->id_tecnicos;
            $bestPhoto = $photoRecord ? $photoRecord->tec_foto : null;

            // Ensure the master record is updated with clean name & best photo
            DB::table('tecnicos')
                ->where('id_tecnicos', $masterId)
                ->update([
                    'tec_ape_nom' => $cleanName,
                    'tec_foto' => $bestPhoto,
                ]);

            // Create tecnico_ciclos for all records in the group
            $cicloNum = 1;
            foreach ($records as $record) {
                DB::table('tecnico_ciclos')->insert([
                    'tecnico_id' => $masterId,
                    'numero_ciclo' => $cicloNum++,
                    'desde' => $record->desde,
                    'hasta' => $record->hasta,
                    'cargo' => trim($record->cargo ?? 'TITULAR'),
                    'observaciones' => null,
                    'foto_ciclo' => $record->tec_foto ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Delete duplicate tecnico rows (all except masterId)
            $otherIds = array_filter(
                array_map(fn($r) => $r->id_tecnicos, $records),
                fn($id) => $id !== $masterId
            );

            if (!empty($otherIds)) {
                DB::table('tecnicos')->whereIn('id_tecnicos', $otherIds)->delete();
            }
        }

        // 3. Drop legacy columns from tecnicos table
        Schema::table('tecnicos', function (Blueprint $table) {
            $table->dropColumn(['desde', 'hasta', 'cargo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-add legacy columns to tecnicos
        Schema::table('tecnicos', function (Blueprint $table) {
            $table->date('desde')->nullable();
            $table->date('hasta')->nullable();
            $table->char('cargo', 30)->nullable();
        });

        // Restore legacy data from tecnico_ciclos
        $ciclos = DB::table('tecnico_ciclos')->orderBy('id', 'asc')->get();
        foreach ($ciclos as $c) {
            DB::table('tecnicos')->where('id_tecnicos', $c->tecnico_id)->update([
                'desde' => $c->desde,
                'hasta' => $c->hasta,
                'cargo' => $c->cargo,
            ]);
        }

        Schema::dropIfExists('tecnico_ciclos');
    }
};
