<?php

namespace App\Http\Resources;

use App\Models\Partido;
use App\Models\Periodo;
use App\Models\Setting;
use App\Services\GoalAnalysisService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "JugadorResource",
    properties: [
        new OA\Property(property: "pl_id", type: "integer"),
        new OA\Property(property: "pl_apno", type: "string"),
        new OA\Property(property: "pl_foto", type: "string", nullable: true),
        new OA\Property(property: "river_shield", type: "string", nullable: true),
        new OA\Property(property: "goles_count", type: "integer"),
        new OA\Property(property: "goles_river_count", type: "integer"),
        new OA\Property(property: "goles_rival_count", type: "integer"),
        new OA\Property(property: "goles_victoria_count", type: "integer", nullable: true),
        new OA\Property(property: "dias_desde_ultimo_gol", type: "integer", nullable: true),
        new OA\Property(property: "partidos_desde_ultimo_gol", type: "integer", nullable: true),
        new OA\Property(property: "goles_por_periodo", type: "array", items: new OA\Items(type: "object")),
        new OA\Property(property: "goles_por_tipo", type: "array", items: new OA\Items(type: "object")),
        new OA\Property(property: "dobletes_count", type: "integer"),
        new OA\Property(property: "hat_tricks_count", type: "integer"),
        new OA\Property(property: "dobletes", type: "array", items: new OA\Items(type: "object")),
        new OA\Property(property: "hat_tricks", type: "array", items: new OA\Items(type: "object")),
        new OA\Property(
            property: "goles",
            type: "array",
            items: new OA\Items(ref: "#/components/schemas/GolResource")
        ),
        new OA\Property(property: "goles_meta", type: "object", properties: [
            new OA\Property(property: "current_page", type: "integer"),
            new OA\Property(property: "last_page", type: "integer"),
            new OA\Property(property: "total", type: "integer"),
            new OA\Property(property: "river_goals_offset", type: "integer")
        ]),
        new OA\Property(property: "is_premium_restricted", type: "boolean")
    ]
)]
class JugadorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = auth("sanctum")->user();
        $isPremium = $user && $user->isPremium();
        
        $golesPaginator = $this->whenLoaded("goles");
        $golesCollection = $golesPaginator;
        $isRestricted = false;
        $golesMeta = null;
        
        $periodStats = [];
        $golesPorTipo = [];
        $diasDesdeUltimoGol = null;
        $partidosDesdeUltimoGol = null;
        $golesVictoriaCount = null;

        $dobletes = [];
        $hatTricks = [];
        $dobletesCount = 0;
        $hatTricksCount = 0;

        // Solo procesamos datos pesados si la relación 'goles' está cargada (Vista de Detalle)
        if ($this->relationLoaded("goles")) {
            
            // Hitos Goleadores (Solo goles PARA RIVER para los hitos positivos)
            $golesAgrupados = DB::table('goles')
                ->where('gol_juga', $this->pl_id)
                ->where('gol_parariver', 1) // Solo hitos con River
                ->select('gol_fecha', DB::raw('count(*) as total'))
                ->groupBy('gol_fecha')
                ->havingRaw('count(*) >= 2')
                ->orderBy('gol_fecha', 'desc')
                ->get();

            foreach ($golesAgrupados as $grupo) {
                $partido = Partido::with('rival')->find($grupo->gol_fecha);
                if ($partido) {
                    $item = [
                        'fecha' => $grupo->gol_fecha,
                        'goles_count' => (int)$grupo->total,
                        'rival' => $partido->rival->ri_desc ?? 'Desconocido',
                        'rival_escudo' => $partido->rival->ri_escudo ? Storage::disk('public')->url($partido->rival->ri_escudo) : null,
                    ];

                    if ($grupo->total == 2) {
                        $dobletes[] = $item;
                        $dobletesCount++;
                    } else {
                        $hatTricks[] = $item;
                        $hatTricksCount++;
                    }
                }
            }

            if ($golesPaginator instanceof \Illuminate\Pagination\LengthAwarePaginator) {
                $golesCollection = $golesPaginator->getCollection();
                
                // Calcular cuántos goles "para River" hay en las páginas anteriores para el offset
                $currentPage = $golesPaginator->currentPage();
                $perPage = $golesPaginator->perPage();
                
                $riverGoalsOffset = 0;
                if ($currentPage > 1) {
                    $limit = ($currentPage - 1) * $perPage;
                    $riverGoalsOffset = DB::table('goles')
                        ->where('gol_juga', $this->pl_id)
                        ->orderBy('gol_fecha', 'desc')
                        ->limit($limit)
                        ->get()
                        ->filter(function($g) {
                            return $g->gol_parariver == 1 && $g->gol_penal != 6;
                        })
                        ->count();
                }

                $golesMeta = [
                    "current_page" => $currentPage,
                    "last_page" => $golesPaginator->lastPage(),
                    "total" => $golesPaginator->total(),
                    "river_goals_offset" => $riverGoalsOffset
                ];

                if (!$isPremium && $golesPaginator->currentPage() === 1) {
                    $totalGoles = $golesPaginator->total();
                    $limit = max(1, floor($totalGoles / 2));
                    if ($totalGoles > $limit) {
                        $isRestricted = true;
                        if ($golesCollection->count() > $limit) {
                            $golesCollection = $golesCollection->take($limit);
                        }
                    }
                } elseif (!$isPremium && $golesPaginator->currentPage() > 1) {
                    $golesCollection = collect([]);
                    $isRestricted = true;
                }
            }

            // Estadísticas de análisis (Solo en detalle y para Premium)
            if ($isPremium) {
                $golesVictoriaCount = GoalAnalysisService::countWinningGoalsForPlayer($this->pl_id);

                $intervals = [
                    ['label' => "0' - 10'", 'min' => 0, 'max' => 10],
                    ['label' => "11' - 20'", 'min' => 11, 'max' => 20],
                    ['label' => "21' - 30'", 'min' => 21, 'max' => 30],
                    ['label' => "31' - 40'", 'min' => 31, 'max' => 40],
                    ['label' => "41' +", 'min' => 41, 'max' => 150], 
                ];

                $activePeriods = Periodo::whereIn('id_periodo', function($q) {
                    $q->select('periodo')->from('goles')->where('gol_juga', $this->pl_id);
                })->orderBy('id_periodo')->get();

                foreach ($activePeriods as $period) {
                    $intervalsData = [];
                    foreach ($intervals as $interval) {
                        // Goles River
                        $countRiver = \App\Models\Gol::where("gol_juga", $this->pl_id)
                            ->where("periodo", $period->id_periodo)
                            ->where("gol_parariver", 1)
                            ->whereBetween("minutos", [$interval['min'], $interval['max']])
                            ->count();
                        
                        // Goles Rival (Contra River) - El valor en DB es 2
                        $countRival = \App\Models\Gol::where("gol_juga", $this->pl_id)
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

                $golesPorTipo = DB::table('goles')
                    ->join('tipo_gol', 'goles.gol_penal', '=', 'tipo_gol.tipo_gol')
                    ->where('goles.gol_juga', $this->pl_id)
                    ->select(
                        'tipo_gol.tipo_gol_descripcion as label', 
                        DB::raw('SUM(CASE WHEN gol_parariver = 1 THEN 1 ELSE 0 END) as value'),
                        DB::raw('SUM(CASE WHEN gol_parariver = 2 THEN 1 ELSE 0 END) as value_rival')
                    )
                    ->groupBy('tipo_gol.tipo_gol_descripcion')
                    ->get();
            }

            // Cálculos de racha (Solo goles PARA RIVER para la vigencia del jugador como goleador del club)
            $ultimoGolRiver = \App\Models\Gol::where("gol_juga", $this->pl_id)
                ->where('gol_parariver', 1)
                ->orderBy("gol_fecha", "desc")
                ->first();
                
            if ($ultimoGolRiver && $ultimoGolRiver->gol_fecha) {
                $fechaUltimo = Carbon::parse($ultimoGolRiver->gol_fecha);
                $diasDesdeUltimoGol = (int) $fechaUltimo->diffInDays(now());
                $partidosDesdeUltimoGol = Partido::where("fecha", ">", $ultimoGolRiver->gol_fecha)->count();
            }
        }

        return [
            "pl_id" => $this->pl_id,
            "pl_apno" => $this->pl_apno,
            "pl_foto" => $this->pl_foto ? Storage::disk("public")->url($this->pl_foto) : null,
            "river_shield" => Setting::getUrl("river_shield"),
            "goles_count" => $this->goles_count,
            "goles_river_count" => $this->goles_river_count,
            "goles_rival_count" => $this->goles_rival_count,
            "goles_victoria_count" => $golesVictoriaCount,
            "dias_desde_ultimo_gol" => $diasDesdeUltimoGol,
            "partidos_desde_ultimo_gol" => $partidosDesdeUltimoGol,
            "goles_por_periodo" => $periodStats,
            "goles_por_tipo" => $golesPorTipo,
            "dobletes_count" => $dobletesCount,
            "hat_tricks_count" => $hatTricksCount,
            "dobletes" => $dobletes,
            "hat_tricks" => $hatTricks,
            "goles" => GolResource::collection($golesCollection),
            "goles_meta" => $golesMeta,
            "is_premium_restricted" => $isRestricted
        ];
    }
}
