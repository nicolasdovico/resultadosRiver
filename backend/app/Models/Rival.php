<?php

namespace App\Models;

use App\Traits\UpperCaseStrings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Rival extends Model
{
    use UpperCaseStrings;

    protected $table = 'rivales';

    protected $primaryKey = 'ri_id';

    public $timestamps = false;

    protected $guarded = [];

    protected $appends = ['escudo_url'];

    protected static function booted(): void
    {
        static::updating(function (Rival $rival) {
            if ($rival->isDirty('escudo')) {
                $previous = $rival->getOriginal('escudo');
                if ($previous && Storage::disk('public')->exists($previous)) {
                    Storage::disk('public')->delete($previous);
                }
            }
        });

        static::deleting(function (Rival $rival) {
            if ($rival->escudo && Storage::disk('public')->exists($rival->escudo)) {
                Storage::disk('public')->delete($rival->escudo);
            }
        });
    }

    public function getEscudoUrlAttribute(): ?string
    {
        if (! $this->escudo) {
            return null;
        }

        if (filter_var($this->escudo, FILTER_VALIDATE_URL)) {
            return $this->escudo;
        }

        // Use Storage::url() but force it to be absolute if it's not
        $url = Storage::disk('public')->url($this->escudo);

        if (!str_starts_with($url, 'http')) {
            $url = config('app.url') . $url;
        }

        // Handle localhost/127.0.0.1 for mobile devices by using the request host
        // But DON'T use the internal docker 'backend' host which is unreachable from outside
        if (str_contains($url, 'localhost') || str_contains($url, '127.0.0.1')) {
            $request = request();
            $host = $request ? $request->getHttpHost() : null;
            if ($host && !in_array($host, ['backend', 'localhost', '127.0.0.1', 'localhost:8000'])) {
                $protocol = $request->secure() ? 'https://' : 'http://';
                $url = $protocol . $host . '/storage/' . $this->escudo;
            }
        }

        return $url;
    }

    /**
     * Get aggregate statistics for the rival.
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
     * Get goals by period (10 min intervals) for this rival.
     */
    public function getGolesPorPeriodoAttribute(): array
    {
        $periodStats = [];
        $intervals = [
            ['label' => "0' - 10'", 'min' => 0, 'max' => 10],
            ['label' => "11' - 20'", 'min' => 11, 'max' => 20],
            ['label' => "21' - 30'", 'min' => 21, 'max' => 30],
            ['label' => "31' - 40'", 'min' => 31, 'max' => 40],
            ['label' => "41' +", 'min' => 41, 'max' => 150], 
        ];

        $activePeriods = Periodo::whereIn('id_periodo', function($q) {
            $q->select('periodo')
              ->from('goles')
              ->join('estadisticas', 'goles.gol_fecha', '=', 'estadisticas.fecha')
              ->where('estadisticas.adversario', $this->ri_id);
        })->orderBy('id_periodo')->get();

        foreach ($activePeriods as $period) {
            $intervalsData = [];
            foreach ($intervals as $interval) {
                // Goles River contra este rival
                $countRiver = \App\Models\Gol::join('estadisticas', 'goles.gol_fecha', '=', 'estadisticas.fecha')
                    ->where('estadisticas.adversario', $this->ri_id)
                    ->where("periodo", $period->id_periodo)
                    ->where("gol_parariver", 1)
                    ->whereBetween("minutos", [$interval['min'], $interval['max']])
                    ->count();
                
                // Goles de este rival contra River
                $countRival = \App\Models\Gol::join('estadisticas', 'goles.gol_fecha', '=', 'estadisticas.fecha')
                    ->where('estadisticas.adversario', $this->ri_id)
                    ->where("periodo", $period->id_periodo)
                    ->where("gol_parariver", 2)
                    ->whereBetween("minutos", [$interval['min'], $interval['max']])
                    ->count();
                
                $intervalsData[] = [
                    'label' => $interval['label'],
                    'count' => $countRiver,
                    'count_rival' => $countRival
                ];
            }

            $periodStats[] = [
                'period_name' => trim($period->periodo_desc),
                'intervals' => $intervalsData
            ];
        }

        return $periodStats;
    }

    /**
     * Get goals by type for this rival.
     */
    public function getGolesPorTipoAttribute(): array
    {
        return \DB::table('goles')
            ->join('estadisticas', 'goles.gol_fecha', '=', 'estadisticas.fecha')
            ->join('tipo_gol', 'goles.gol_penal', '=', 'tipo_gol.tipo_gol')
            ->where('estadisticas.adversario', $this->ri_id)
            ->select(
                'tipo_gol.tipo_gol_descripcion as label', 
                \DB::raw('SUM(CASE WHEN gol_parariver = 1 THEN 1 ELSE 0 END) as value'),
                \DB::raw('SUM(CASE WHEN gol_parariver = 2 THEN 1 ELSE 0 END) as value_rival')
            )
            ->groupBy('tipo_gol.tipo_gol_descripcion')
            ->get()
            ->toArray();
    }

    /**
     * Get the top 3 scorers against this rival.
     */
    public function getTopScorersAttribute(): array
    {
        return \App\Models\Gol::join('estadisticas', 'goles.gol_fecha', '=', 'estadisticas.fecha')
            ->join('players', 'goles.gol_juga', '=', 'players.pl_id')
            ->where('estadisticas.adversario', $this->ri_id)
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
     * Get winning and losing streaks for this rival.
     */
    public function getStreaksAttribute(): array
    {
        $partidos = $this->partidos()->orderBy('fecha', 'asc')->get();
        
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
     * Get the last won match against this rival.
     */
    public function getLastWonMatchAttribute(): ?array
    {
        $partido = $this->partidos()
            ->whereRaw('go_ri > go_ad')
            ->orderBy('fecha', 'desc')
            ->first();

        return $this->formatMatchHito($partido);
    }

    /**
     * Get the last lost match against this rival.
     */
    public function getLastLostMatchAttribute(): ?array
    {
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
        
        // Ensure relations are loaded to avoid property access on null or non-objects
        // Using the relation methods directly can be tricky in getters, so we use the relation properties
        $torneo = $partido->torneo_rel;
        $condicion = $partido->condicion_rel;
        
        return [
            'fecha' => $partido->fecha,
            'torneo' => $torneo ? trim($torneo->tor_desc) : 'Desconocido',
            'condicion' => $condicion ? trim($condicion->descripcion) : 'Desconocido',
            'resultado' => "{$partido->go_ri} - {$partido->go_ad}",
            'dias_transcurridos' => $fecha->diffInDays(now()),
        ];
    }

    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class, 'adversario', 'ri_id');
    }
}
