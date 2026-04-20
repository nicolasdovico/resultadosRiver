<?php

namespace App\Models;

use App\Traits\UpperCaseStrings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class Torneo extends Model
{
    use UpperCaseStrings;

    protected $table = 'torneos';
    protected $primaryKey = 'tor_id';
    public $timestamps = false;
    protected $guarded = [];

    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class, 'torneo', 'tor_id');
    }

    /**
     * Get the year of the tournament based on its matches.
     */
    public function getAnioAttribute(): int
    {
        $latestPartido = $this->partidos()->orderBy('fecha', 'desc')->first();
        return $latestPartido ? (int) date('Y', strtotime($latestPartido->fecha)) : 0;
    }

    /**
     * Get aggregate statistics for the tournament.
     */
    public function getStatsAttribute(): array
    {
        $partidos = $this->partidos;
        
        $pj = $partidos->count();
        $pg = 0;
        $pe = 0;
        $pp = 0;
        $gf = 0;
        $gc = 0;
        $vallasInvictas = 0;

        foreach ($partidos as $partido) {
            $golesRiver = $partido->go_ri;
            $golesRival = $partido->go_ad;

            $gf += $golesRiver;
            $gc += $golesRival;

            if ($golesRival === 0) {
                $vallasInvictas++;
            }

            if ($golesRiver > $golesRival) {
                $pg++;
            } elseif ($golesRiver < $golesRival) {
                $pp++;
            } else {
                $pe++;
            }
        }

        $puntos = ($pg * 3) + $pe;
        $efectividad = $pj > 0 ? round(($puntos / ($pj * 3)) * 100, 2) : 0;

        return [
            'pj' => $pj,
            'pg' => $pg,
            'pe' => $pe,
            'pp' => $pp,
            'gf' => $gf,
            'gc' => $gc,
            'dg' => $gf - $gc,
            'puntos' => $puntos,
            'vallas_invictas' => $vallasInvictas,
            'efectividad' => $efectividad,
        ];
    }

    /**
     * Get the top 3 scorers for River Plate in this tournament.
     */
    public function getTopScorersAttribute(): array
    {
        return DB::table('goles')
            ->join('estadisticas', 'goles.gol_fecha', '=', 'estadisticas.fecha')
            ->join('players', 'goles.gol_juga', '=', 'players.pl_id')
            ->where('estadisticas.torneo', $this->tor_id)
            ->where('goles.gol_parariver', 1)
            ->where('goles.gol_penal', '!=', 6) // Excluir autogoles
            ->select('players.pl_id', 'players.pl_apno', 'players.pl_foto', DB::raw('count(*) as goals_count'))
            ->groupBy('players.pl_id', 'players.pl_apno', 'players.pl_foto')
            ->orderBy('goals_count', 'desc')
            ->orderBy('players.pl_apno', 'asc')
            ->limit(3)
            ->get()
            ->map(function ($scorer) {
                return [
                    'pl_id' => $scorer->pl_id,
                    'pl_apno' => $scorer->pl_apno,
                    'pl_foto' => $scorer->pl_foto ? Storage::disk('public')->url($scorer->pl_foto) : null,
                    'goals_count' => (int) $scorer->goals_count,
                ];
            })
            ->toArray();
    }
}
