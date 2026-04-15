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
        new OA\Property(property: 'partidos_count', type: 'integer'),
        new OA\Property(property: 'is_premium_restricted', type: 'boolean'),
        new OA\Property(property: 'stats', type: 'object'),
        new OA\Property(property: 'goles_por_periodo', type: 'array', items: new OA\Items(type: 'object')),
        new OA\Property(property: 'goles_por_tipo', type: 'array', items: new OA\Items(type: 'object')),
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
        
        $stats = $this->stats;
        $partidosMeta = null;
        $isRestricted = false;
        $periodStats = [];
        $golesPorTipo = [];

        $partidosQuery = $this->getPartidosQuery()
            ->with(['rival', 'torneo_rel', 'fase_rel'])
            ->orderBy('fecha', 'desc');

        $isDetail = $request->routeIs('*.show') || $request->is('*/tecnicos/*');

        if ($isDetail) {
            $perPage = 10;
            $partidosPaginator = $partidosQuery->paginate($perPage);
            $partidosCollection = $partidosPaginator->getCollection();

            $partidosMeta = [
                "current_page" => $partidosPaginator->currentPage(),
                "last_page" => $partidosPaginator->lastPage(),
                "total" => $partidosPaginator->total(),
            ];

            if (!$isPremium) {
                $isRestricted = true;
                if ($partidosPaginator->currentPage() === 1) {
                    $partidosCollection = $partidosCollection->take(5);
                } else {
                    $partidosCollection = collect([]);
                }
            } else {
                // Analítica de Goles para Premium
                $partidosIds = $this->getPartidosQuery()->pluck('fecha')->toArray();
                
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
            'partidos_count' => $stats['pj'],
            'stats' => $stats,
            'is_premium_restricted' => $isRestricted,
            'goles_por_periodo' => $periodStats,
            'goles_por_tipo' => $golesPorTipo,
            'partidos' => $this->when($isDetail, $partidos ?? []),
            'partidos_meta' => $this->when($partidosMeta !== null, $partidosMeta),
        ];
    }
}
