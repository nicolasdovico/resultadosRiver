<?php

namespace App\Http\Resources;

use App\Models\Gol;
use App\Models\Partido;
use App\Models\Periodo;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TecnicoResource',
    properties: [
        new OA\Property(property: 'id_tecnicos', type: 'integer'),
        new OA\Property(property: 'tec_ape_nom', type: 'string'),
        new OA\Property(property: 'te_desc', type: 'string'),
        new OA\Property(property: 'tec_foto', type: 'string', nullable: true),
        new OA\Property(property: 'desde', type: 'string', format: 'date', nullable: true),
        new OA\Property(property: 'hasta', type: 'string', format: 'date', nullable: true),
        new OA\Property(property: 'cargo', type: 'string', nullable: true),
        new OA\Property(property: 'total_ciclos', type: 'integer'),
        new OA\Property(property: 'active_ciclo_id', type: 'integer', nullable: true),
        new OA\Property(
            property: 'ciclos',
            type: 'array',
            items: new OA\Items(
                properties: [
                    new OA\Property(property: 'id', type: 'integer'),
                    new OA\Property(property: 'numero_ciclo', type: 'integer'),
                    new OA\Property(property: 'desde', type: 'string', format: 'date'),
                    new OA\Property(property: 'hasta', type: 'string', format: 'date', nullable: true),
                    new OA\Property(property: 'cargo', type: 'string'),
                    new OA\Property(property: 'observaciones', type: 'string', nullable: true),
                    new OA\Property(property: 'foto_ciclo', type: 'string', nullable: true),
                    new OA\Property(property: 'stats', type: 'object', nullable: true),
                ],
                type: 'object'
            )
        ),
        new OA\Property(property: 'partidos_count', type: 'integer'),
        new OA\Property(property: 'is_premium_restricted', type: 'boolean'),
        new OA\Property(property: 'stats', type: 'object'),
        new OA\Property(property: 'goles_por_periodo', type: 'array', items: new OA\Items(type: 'object')),
        new OA\Property(property: 'goles_por_tipo', type: 'array', items: new OA\Items(type: 'object')),
        new OA\Property(property: 'top_scorers', type: 'array', items: new OA\Items(type: 'object')),
        new OA\Property(property: 'partidos', type: 'array', items: new OA\Items(ref: '#/components/schemas/PartidoResource')),
        new OA\Property(property: 'partidos_meta', type: 'object')
    ]
)]
class TecnicoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = auth("sanctum")->user();
        $isPremium = $user && $user->isPremium();
        
        $isDetail = $request->routeIs('*.show') || $request->is('*/tecnicos/*');
        $cicloId = $request->filled('ciclo_id') ? (int) $request->input('ciclo_id') : null;

        $partidosMeta = null;
        $isRestricted = false;
        $periodStats = [];
        $golesPorTipo = [];
        $topScorers = [];

        // Scoped query for selected cycle or all cycles
        $partidosQuery = $this->getPartidosQuery($cicloId)
            ->with(['rival', 'torneo_rel', 'fase_rel'])
            ->orderBy('fecha', 'desc');

        // Scoped stats
        if ($cicloId !== null) {
            $selectedCiclo = $this->ciclos->firstWhere('id', $cicloId);
            $stats = $selectedCiclo ? $selectedCiclo->stats : $this->stats;
        } else {
            $stats = $this->stats;
        }

        // Map all cycles
        $ciclosData = $this->ciclos->map(function ($ciclo) use ($isDetail) {
            return [
                'id' => $ciclo->id,
                'numero_ciclo' => $ciclo->numero_ciclo,
                'desde' => $ciclo->desde,
                'hasta' => $ciclo->hasta,
                'cargo' => trim($ciclo->cargo),
                'observaciones' => $ciclo->observaciones,
                'foto_ciclo' => $ciclo->foto_ciclo ? Storage::disk('public')->url($ciclo->foto_ciclo) : null,
                'stats' => $isDetail ? $ciclo->stats : null,
            ];
        });

        if ($isDetail) {
            $allMatches = $partidosQuery->orderBy('fecha', 'desc')->get();
            $isRestricted = false;

            if (!$isPremium) {
                $totalPartidos = $allMatches->count();
                if ($totalPartidos > 3) {
                    $partidosCollection = $allMatches->take(3);
                    $isRestricted = true;
                } else {
                    $partidosCollection = $allMatches;
                }
            } else {
                $partidosCollection = $allMatches;

                // Analítica de Goles para Premium (scoped to selected cycle or all cycles)
                $partidosIds = $allMatches->pluck('fecha')->toArray();
                
                if (!empty($partidosIds)) {
                    $intervals = [
                        ['label' => "0' - 10'", 'min' => 0, 'max' => 10],
                        ['label' => "11' - 20'", 'min' => 11, 'max' => 20],
                        ['label' => "21' - 30'", 'min' => 21, 'max' => 30],
                        ['label' => "31' - 40'", 'min' => 31, 'max' => 40],
                        ['label' => "41' +", 'min' => 41, 'max' => 150], 
                    ];

                    $activePeriods = Periodo::whereIn('id_periodo', function($q) use ($partidosIds) {
                        $q->select('periodo')->from('goles')->whereIn('gol_fecha', $partidosIds);
                    })->orderBy('id_periodo')->get();

                    foreach ($activePeriods as $period) {
                        $intervalsData = [];
                        foreach ($intervals as $interval) {
                            $countRiver = Gol::whereIn('gol_fecha', $partidosIds)
                                ->where('periodo', $period->id_periodo)
                                ->where('gol_parariver', 1)
                                ->whereBetween('minutos', [$interval['min'], $interval['max']])
                                ->count();
                            
                            $countRival = Gol::whereIn('gol_fecha', $partidosIds)
                                ->where('periodo', $period->id_periodo)
                                ->where('gol_parariver', 2)
                                ->whereBetween('minutos', [$interval['min'], $interval['max']])
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

                    $golesPorTipo = DB::table('goles')
                        ->join('tipo_gol', 'goles.gol_penal', '=', 'tipo_gol.tipo_gol')
                        ->whereIn('goles.gol_fecha', $partidosIds)
                        ->select(
                            'tipo_gol.tipo_gol_descripcion as label', 
                            DB::raw('SUM(CASE WHEN gol_parariver = 1 THEN 1 ELSE 0 END) as value'),
                            DB::raw('SUM(CASE WHEN gol_parariver = 2 THEN 1 ELSE 0 END) as value_rival')
                        )
                        ->groupBy('tipo_gol.tipo_gol_descripcion')
                        ->get();

                    // Top 3 Goleadores del Ciclo / Período
                    $topScorersRaw = DB::table('goles')
                        ->whereIn('gol_fecha', $partidosIds)
                        ->where('gol_parariver', 1)
                        ->where('gol_penal', '!=', 6)
                        ->select('gol_juga', DB::raw('count(*) as total'))
                        ->groupBy('gol_juga')
                        ->orderBy('total', 'desc')
                        ->limit(3)
                        ->get();

                    $topScorers = $topScorersRaw->map(function ($item) {
                        $player = \App\Models\Jugador::find($item->gol_juga);
                        return [
                            'pl_id' => $player?->pl_id,
                            'name' => $player?->pl_apno ?? 'Desconocido',
                            'goals' => (int) $item->total,
                            'pl_foto' => ($player && $player->pl_foto) ? Storage::disk('public')->url($player->pl_foto) : null
                        ];
                    });
                }
            }
            
            $partidos = PartidoResource::collection($partidosCollection);
        } else {
            $partidos = null;
        }

        return [
            'id_tecnicos' => $this->id_tecnicos,
            'tec_ape_nom' => trim($this->tec_ape_nom),
            'te_desc' => trim($this->tec_ape_nom), // Compatibilidad
            'tec_foto' => $this->tec_foto ? Storage::disk('public')->url($this->tec_foto) : null,
            'desde' => $this->desde,
            'hasta' => $this->hasta,
            'cargo' => trim($this->cargo),
            'total_ciclos' => $this->ciclos->count(),
            'active_ciclo_id' => $cicloId,
            'ciclos' => $ciclosData,
            'partidos_count' => $stats['pj'],
            'stats' => $stats,
            'is_premium_restricted' => $isRestricted,
            'goles_por_periodo' => $periodStats,
            'goles_por_tipo' => $golesPorTipo,
            'top_scorers' => $topScorers,
            'partidos' => $this->when($isDetail, $partidos ?? []),
        ];
    }
}
