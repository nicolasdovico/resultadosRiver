<?php

namespace App\Models;

use App\Traits\UpperCaseStrings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Estadio extends Model
{
    use UpperCaseStrings;

    protected $table = 'estadios';
    protected $primaryKey = 'es_id';
    public $timestamps = false;
    protected $guarded = [];

    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class, 'estadio', 'es_id');
    }

    /**
     * Get aggregate statistics for the estadio.
     */
    public function getStatsAttribute(): array
    {
        $raw = \DB::table('estadisticas')
            ->where('estadio', $this->es_id)
            ->selectRaw("
                count(*) as pj,
                COALESCE(SUM(go_ri), 0) as gf,
                COALESCE(SUM(go_ad), 0) as gc,
                COALESCE(SUM(CASE WHEN go_ri > go_ad THEN 1 ELSE 0 END), 0) as pg,
                COALESCE(SUM(CASE WHEN go_ri < go_ad THEN 1 ELSE 0 END), 0) as pp,
                COALESCE(SUM(CASE WHEN go_ri = go_ad THEN 1 ELSE 0 END), 0) as pe,
                COALESCE(SUM(CASE WHEN go_ad = 0 THEN 1 ELSE 0 END), 0) as vallas_invictas
            ")
            ->first();

        $pj = (int) ($raw->pj ?? 0);
        $pg = (int) ($raw->pg ?? 0);
        $pe = (int) ($raw->pe ?? 0);
        $pp = (int) ($raw->pp ?? 0);
        $gf = (int) ($raw->gf ?? 0);
        $gc = (int) ($raw->gc ?? 0);
        $vallasInvictas = (int) ($raw->vallas_invictas ?? 0);

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
     * Get the top 3 scorers in this estadio.
     */
    public function getTopScorersAttribute(): array
    {
        return \App\Models\Gol::join('estadisticas', 'goles.gol_fecha', '=', 'estadisticas.fecha')
            ->join('players', 'goles.gol_juga', '=', 'players.pl_id')
            ->where('estadisticas.estadio', $this->es_id)
            ->where('goles.gol_parariver', 1)
            ->where('goles.gol_penal', '!=', 6) // Exclude autogoals
            ->select(
                'players.pl_id',
                'players.pl_apno',
                'players.pl_foto',
                \DB::raw('count(*) as goals_count')
            )
            ->groupBy('players.pl_id', 'players.pl_apno', 'players.pl_foto')
            ->orderByDesc('goals_count')
            ->limit(3)
            ->get()
            ->map(function ($scorer) {
                return [
                    'pl_id' => $scorer->pl_id,
                    'pl_apno' => trim($scorer->pl_apno),
                    'pl_foto' => $scorer->pl_foto ? (str_starts_with($scorer->pl_foto, 'http') ? $scorer->pl_foto : config('app.url') . Storage::url($scorer->pl_foto)) : null,
                    'goals_count' => $scorer->goals_count
                ];
            })
            ->toArray();
    }

    /**
     * Get winning and losing streaks for this estadio.
     */
    public function getStreaksAttribute(): array
    {
        $partidos = $this->relationLoaded('partidos') 
            ? $this->partidos->sortBy('fecha')->values() 
            : $this->partidos()->orderBy('fecha', 'asc')->get();
        
        if ($partidos->isEmpty()) {
            return [
                'invincibility' => null,
                'drought' => null
            ];
        }

        $maxInvincibility = ['count' => 0, 'start' => null, 'end' => null];
        $maxDrought = ['count' => 0, 'start' => null, 'end' => null];
        
        $currentInv = ['count' => 0, 'start' => null, 'end' => null];
        $currentDro = ['count' => 0, 'start' => null, 'end' => null];

        foreach ($partidos as $partido) {
            $res = $partido->resultado;

            // Invincibility (G or E)
            if ($res === 'G' || $res === 'E') {
                if ($currentInv['count'] === 0) $currentInv['start'] = $partido->fecha;
                $currentInv['count']++;
                $currentInv['end'] = $partido->fecha;
            } else {
                if ($currentInv['count'] > $maxInvincibility['count']) {
                    $maxInvincibility = $currentInv;
                }
                $currentInv = ['count' => 0, 'start' => null, 'end' => null];
            }

            // Drought (P or E)
            if ($res === 'P' || $res === 'E') {
                if ($currentDro['count'] === 0) $currentDro['start'] = $partido->fecha;
                $currentDro['count']++;
                $currentDro['end'] = $partido->fecha;
            } else {
                if ($currentDro['count'] > $maxDrought['count']) {
                    $maxDrought = $currentDro;
                }
                $currentDro = ['count' => 0, 'start' => null, 'end' => null];
            }
        }

        // Check last ones
        if ($currentInv['count'] > $maxInvincibility['count']) $maxInvincibility = $currentInv;
        if ($currentDro['count'] > $maxDrought['count']) $maxDrought = $currentDro;

        $lastMatchDate = $partidos->last()->fecha;

        $processStreak = function($streak) use ($lastMatchDate) {
            if ($streak['count'] === 0) return null;
            
            $start = \Carbon\Carbon::parse($streak['start']);
            $end = \Carbon\Carbon::parse($streak['end']);
            $isVigente = ($streak['end'] === $lastMatchDate);
            
            return [
                'count' => $streak['count'],
                'start_date' => $streak['start'],
                'end_date' => $streak['end'],
                'duration_days' => $start->diffInDays($end),
                'is_vigente' => $isVigente,
                'days_since_end' => $isVigente ? 0 : \Carbon\Carbon::parse($streak['end'])->diffInDays(now())
            ];
        };

        return [
            'invincibility' => $processStreak($maxInvincibility),
            'drought' => $processStreak($maxDrought)
        ];
    }

    /**
     * Get the last won match in this estadio.
     */
    public function getLastWonMatchAttribute(): ?array
    {
        if ($this->relationLoaded('partidos')) {
            $partido = $this->partidos
                ->sortByDesc('fecha')
                ->first(fn($p) => $p->go_ri > $p->go_ad);
            return $this->formatMatchHito($partido);
        }

        $partido = $this->partidos()
            ->whereRaw('go_ri > go_ad')
            ->orderBy('fecha', 'desc')
            ->first();

        return $this->formatMatchHito($partido);
    }

    /**
     * Get the last lost match in this estadio.
     */
    public function getLastLostMatchAttribute(): ?array
    {
        if ($this->relationLoaded('partidos')) {
            $partido = $this->partidos
                ->sortByDesc('fecha')
                ->first(fn($p) => $p->go_ri < $p->go_ad);
            return $this->formatMatchHito($partido);
        }

        $partido = $this->partidos()
            ->whereRaw('go_ri < go_ad')
            ->orderBy('fecha', 'desc')
            ->first();

        return $this->formatMatchHito($partido);
    }

    /**
     * Format match data for hito visualization.
     */
    private function formatMatchHito($partido): ?array
    {
        if (!$partido) return null;

        $fecha = \Carbon\Carbon::parse($partido->fecha);
        $torneo = $partido->torneo_rel;
        $condicion = $partido->condicion_rel;
        $rival = $partido->rival;
        
        return [
            'fecha' => $partido->fecha,
            'torneo' => $torneo ? trim($torneo->tor_desc) : 'Desconocido',
            'condicion' => $condicion ? trim($condicion->descripcion) : 'Desconocido',
            'rival' => $rival ? trim($rival->ri_desc) : 'Desconocido',
            'escudo_url' => $rival ? $rival->escudo_url : null,
            'resultado' => "{$partido->go_ri} - {$partido->go_ad}",
            'dias_transcurridos' => $fecha->diffInDays(now()),
        ];
    }

    /**
     * Get goals by period (10 min intervals) in this estadio.
     */
    public function getGolesPorPeriodoAttribute(): array
    {
        $raw = \DB::table('goles')
            ->join('estadisticas', 'goles.gol_fecha', '=', 'estadisticas.fecha')
            ->join('periodo', 'goles.periodo', '=', 'periodo.id_periodo')
            ->where('estadisticas.estadio', $this->es_id)
            ->selectRaw("
                periodo.id_periodo,
                periodo.periodo_desc,
                SUM(CASE WHEN gol_parariver = 1 AND minutos BETWEEN 0 AND 10 THEN 1 ELSE 0 END) as river_0_10,
                SUM(CASE WHEN gol_parariver = 2 AND minutos BETWEEN 0 AND 10 THEN 1 ELSE 0 END) as opponent_0_10,
                SUM(CASE WHEN gol_parariver = 1 AND minutos BETWEEN 11 AND 20 THEN 1 ELSE 0 END) as river_11_20,
                SUM(CASE WHEN gol_parariver = 2 AND minutos BETWEEN 11 AND 20 THEN 1 ELSE 0 END) as opponent_11_20,
                SUM(CASE WHEN gol_parariver = 1 AND minutos BETWEEN 21 AND 30 THEN 1 ELSE 0 END) as river_21_30,
                SUM(CASE WHEN gol_parariver = 2 AND minutos BETWEEN 21 AND 30 THEN 1 ELSE 0 END) as opponent_21_30,
                SUM(CASE WHEN gol_parariver = 1 AND minutos BETWEEN 31 AND 40 THEN 1 ELSE 0 END) as river_31_40,
                SUM(CASE WHEN gol_parariver = 2 AND minutos BETWEEN 31 AND 40 THEN 1 ELSE 0 END) as opponent_31_40,
                SUM(CASE WHEN gol_parariver = 1 AND minutos >= 41 THEN 1 ELSE 0 END) as river_41_plus,
                SUM(CASE WHEN gol_parariver = 2 AND minutos >= 41 THEN 1 ELSE 0 END) as opponent_41_plus
            ")
            ->groupBy('periodo.id_periodo', 'periodo.periodo_desc')
            ->orderBy('periodo.id_periodo')
            ->get();

        $periodStats = [];
        foreach ($raw as $row) {
            $periodStats[] = [
                'period_name' => trim($row->periodo_desc),
                'intervals' => [
                    ['label' => "0' - 10'", 'count' => (int)$row->river_0_10, 'count_rival' => (int)$row->opponent_0_10],
                    ['label' => "11' - 20'", 'count' => (int)$row->river_11_20, 'count_rival' => (int)$row->opponent_11_20],
                    ['label' => "21' - 30'", 'count' => (int)$row->river_21_30, 'count_rival' => (int)$row->opponent_21_30],
                    ['label' => "31' - 40'", 'count' => (int)$row->river_31_40, 'count_rival' => (int)$row->opponent_31_40],
                    ['label' => "41' +", 'count' => (int)$row->river_41_plus, 'count_rival' => (int)$row->opponent_41_plus],
                ]
            ];
        }

        return $periodStats;
    }

    /**
     * Get goals by type in this estadio.
     */
    public function getGolesPorTipoAttribute(): array
    {
        return \DB::table('goles')
            ->join('estadisticas', 'goles.gol_fecha', '=', 'estadisticas.fecha')
            ->join('tipo_gol', 'goles.gol_penal', '=', 'tipo_gol.tipo_gol')
            ->where('estadisticas.estadio', $this->es_id)
            ->select(
                'tipo_gol.tipo_gol_descripcion as label', 
                \DB::raw('SUM(CASE WHEN gol_parariver = 1 THEN 1 ELSE 0 END) as value'),
                \DB::raw('SUM(CASE WHEN gol_parariver = 2 THEN 1 ELSE 0 END) as value_rival')
            )
            ->groupBy('tipo_gol.tipo_gol_descripcion')
            ->get()
            ->toArray();
    }
}
