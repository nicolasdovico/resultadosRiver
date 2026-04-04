<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partido;
use App\Models\Rival;
use App\Models\Periodo;
use App\Http\Resources\PartidoResource;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PartidoController extends Controller
{
    #[OA\Get(
        path: '/v1/stats/general',
        summary: 'Get general match statistics',
        operationId: 'getGeneralStats',
        tags: ['Stats'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'General statistics',
                content: new OA\JsonContent(
                    type: 'object'
                )
            )
        ]
    )]
    public function generalStats()
    {
        return Cache::remember('general_stats', 86400, function () {
            $total = Partido::count();
            
            if ($total === 0) {
                return [
                    'summary' => [
                        'pj' => 0,
                        'g' => 0,
                        'e' => 0,
                        'p' => 0,
                        'gf' => 0,
                        'gc' => 0,
                        'dg' => 0,
                        'promedio_gol' => 0,
                        'efectividad' => 0,
                    ],
                    'curiosities' => [
                        'biggest_win' => null,
                        'most_frequent_rival' => null,
                        'most_active_year' => null,
                        'total_rivales' => 0,
                        'total_torneos' => 0
                    ]
                ];
            }

            $wins = Partido::whereRaw('go_ri > go_ad')->count();
            $draws = Partido::whereRaw('go_ri = go_ad')->count();
            $losses = Partido::whereRaw('go_ri < go_ad')->count();
            
            $goalsFor = Partido::sum('go_ri');
            $goalsAgainst = Partido::sum('go_ad');
            
            $puntosObtenidos = ($wins * 3) + $draws;
            $puntosPosibles = $total * 3;
            $effectiveness = ($puntosObtenidos / $puntosPosibles) * 100;

            // Curious facts
            $biggestWin = Partido::with(['rival', 'torneo_rel'])
                ->orderByRaw('(go_ri - go_ad) DESC')
                ->first();

            $mostFrequentRival = DB::table('estadisticas')
                ->select('adversario', DB::raw('count(*) as total'))
                ->groupBy('adversario')
                ->orderBy('total', 'desc')
                ->first();
            
            $rivalInfo = $mostFrequentRival ? Rival::find($mostFrequentRival->adversario) : null;

            $mostActiveYear = DB::table('estadisticas')
                ->select(DB::raw('EXTRACT(YEAR FROM CAST(fecha AS DATE)) as year'), DB::raw('count(*) as total'))
                ->groupBy('year')
                ->orderBy('total', 'desc')
                ->first();

            $totalRivales = DB::table('rivales')
                ->whereExists(function ($query) {
                    $query->select(DB::raw(1))
                          ->from('estadisticas')
                          ->whereRaw('estadisticas.adversario = rivales.ri_id');
                })
                ->count();

            return [
                'summary' => [
                    'pj' => $total,
                    'g' => $wins,
                    'e' => $draws,
                    'p' => $losses,
                    'gf' => (int) $goalsFor,
                    'gc' => (int) $goalsAgainst,
                    'dg' => $goalsFor - $goalsAgainst,
                    'promedio_gol' => round($goalsFor / $total, 2),
                    'efectividad' => round($effectiveness, 2),
                ],
                'curiosities' => [
                    'biggest_win' => $biggestWin ? [
                        'fecha' => $biggestWin->fecha,
                        'resultado' => "{$biggestWin->go_ri} - {$biggestWin->go_ad}",
                        'rival' => $biggestWin->rival->ri_desc,
                        'torneo' => $biggestWin->torneo_rel->tor_desc
                    ] : null,
                    'most_frequent_rival' => $rivalInfo ? [
                        'nombre' => $rivalInfo->ri_desc,
                        'partidos' => $mostFrequentRival->total,
                        'escudo' => $rivalInfo->escudo_url
                    ] : null,
                    'most_active_year' => $mostActiveYear ? [
                        'year' => (int) $mostActiveYear->year,
                        'partidos' => $mostActiveYear->total
                    ] : null,
                    'total_rivales' => $totalRivales,
                    'total_torneos' => DB::table('torneos')->count()
                ]
            ];
        });
    }

    #[OA\Get(
        path: '/v1/stats/goals-by-period',
        summary: 'Get goals distribution by time period with filters',
        operationId: 'getGoalsByPeriod',
        tags: ['Stats'],
        parameters: [
            new OA\Parameter(name: 'q', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'torneo', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'adversario', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'fecha_desde', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'fecha_hasta', in: 'query', schema: new OA\Schema(type: 'string', format: 'date'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Goals distribution grouped by Period and 10-minute intervals',
                content: new OA\JsonContent(type: 'object')
            )
        ]
    )]
    public function goalsByPeriod(Request $request)
    {
        $query = Partido::query();

        // Apply filters
        if ($request->has('q')) {
            $searchTerm = $request->q;
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('rival', function ($r) use ($searchTerm) {
                    $r->where('ri_desc', 'ILIKE', "%{$searchTerm}%");
                })->orWhereHas('torneo_rel', function ($t) use ($searchTerm) {
                    $t->where('tor_desc', 'ILIKE', "%{$searchTerm}%");
                });
            });
        }

        if ($request->has('torneo')) {
            $query->where('torneo', $request->torneo);
        }

        if ($request->has('adversario')) {
            $query->where('adversario', $request->adversario);
        }

        if ($request->has('fecha_desde')) {
            $query->where('fecha', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->where('fecha', '<=', $request->fecha_hasta);
        }

        $matchDates = $query->pluck('fecha');

        // Total goals for River and Opponents
        $totalRiverGoals = DB::table('goles')
            ->whereIn('gol_fecha', $matchDates)
            ->where('gol_parariver', 1)
            ->count();
        
        $totalOpponentGoals = DB::table('goles')
            ->whereIn('gol_fecha', $matchDates)
            ->where('gol_parariver', 2)
            ->count();

        // Get all periods present in the results
        $activePeriods = Periodo::whereIn('id_periodo', function($q) use ($matchDates) {
            $q->select('periodo')->from('goles')->whereIn('gol_fecha', $matchDates);
        })->orderBy('id_periodo')->get();

        $intervals = [
            ['label' => "0' - 10'", 'min' => 0, 'max' => 10],
            ['label' => "11' - 20'", 'min' => 11, 'max' => 20],
            ['label' => "21' - 30'", 'min' => 21, 'max' => 30],
            ['label' => "31' - 40'", 'min' => 31, 'max' => 40],
            ['label' => "41' +", 'min' => 41, 'max' => 150], 
        ];

        $periodStats = [];

        foreach ($activePeriods as $period) {
            $periodData = [];
            
            $periodTotalRiver = DB::table('goles')
                ->whereIn('gol_fecha', $matchDates)
                ->where('gol_parariver', 1)
                ->where('periodo', $period->id_periodo)
                ->count();
            
            $periodTotalOpponent = DB::table('goles')
                ->whereIn('gol_fecha', $matchDates)
                ->where('gol_parariver', 2)
                ->where('periodo', $period->id_periodo)
                ->count();

            foreach ($intervals as $interval) {
                $countRiver = DB::table('goles')
                    ->whereIn('gol_fecha', $matchDates)
                    ->where('gol_parariver', 1)
                    ->where('periodo', $period->id_periodo)
                    ->where('minutos', '>=', $interval['min'])
                    ->where('minutos', '<=', $interval['max'])
                    ->count();
                
                $countOpponent = DB::table('goles')
                    ->whereIn('gol_fecha', $matchDates)
                    ->where('gol_parariver', 2)
                    ->where('periodo', $period->id_periodo)
                    ->where('minutos', '>=', $interval['min'])
                    ->where('minutos', '<=', $interval['max'])
                    ->count();

                $periodData[] = [
                    'label' => $interval['label'],
                    'river' => [
                        'count' => $countRiver,
                        'percentage' => $totalRiverGoals > 0 ? round(($countRiver / $totalRiverGoals) * 100, 1) : 0
                    ],
                    'opponent' => [
                        'count' => $countOpponent,
                        'percentage' => $totalOpponentGoals > 0 ? round(($countOpponent / $totalOpponentGoals) * 100, 1) : 0
                    ]
                ];
            }

            $periodStats[] = [
                'period_id' => $period->id_periodo,
                'period_name' => trim($period->periodo_desc),
                'river_total' => $periodTotalRiver,
                'opponent_total' => $periodTotalOpponent,
                'intervals' => $periodData
            ];
        }

        return response()->json([
            'periods' => $periodStats,
            'total_river' => $totalRiverGoals,
            'total_opponent' => $totalOpponentGoals
        ]);
    }

    #[OA\Get(
        path: '/v1/stats/goals-by-type',
        summary: 'Get goals distribution by type (method) with filters',
        operationId: 'getGoalsByType',
        tags: ['Stats'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Goals distribution by type',
                content: new OA\JsonContent(type: 'object')
            )
        ]
    )]
    public function goalsByType(Request $request)
    {
        $query = Partido::query();

        // Apply filters
        if ($request->has('q')) {
            $searchTerm = $request->q;
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('rival', function ($r) use ($searchTerm) {
                    $r->where('ri_desc', 'ILIKE', "%{$searchTerm}%");
                })->orWhereHas('torneo_rel', function ($t) use ($searchTerm) {
                    $t->where('tor_desc', 'ILIKE', "%{$searchTerm}%");
                });
            });
        }

        if ($request->has('torneo')) {
            $query->where('torneo', $request->torneo);
        }

        if ($request->has('adversario')) {
            $query->where('adversario', $request->adversario);
        }

        if ($request->has('fecha_desde')) {
            $query->where('fecha', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->where('fecha', '<=', $request->fecha_hasta);
        }

        $matchDates = $query->pluck('fecha');

        // Find the earliest match date that has cataloged goals (gol_penal > 0)
        $sinceDate = \App\Models\Setting::get('goals_cataloged_since');
        
        if (!$sinceDate) {
            $sinceDate = DB::table('goles')
                ->whereIn('gol_fecha', $matchDates)
                ->where('gol_penal', '>', 0)
                ->min('gol_fecha');
        }

        // Distribution for River
        $riverStats = DB::table('goles')
            ->leftJoin('tipo_gol', 'goles.gol_penal', '=', 'tipo_gol.tipo_gol')
            ->whereIn('gol_fecha', $matchDates)
            ->where('gol_parariver', 1)
            ->select(DB::raw('COALESCE(tipo_gol.tipo_gol_descripcion, \'Sin catalogar\') as label'), DB::raw('count(*) as count'))
            ->groupBy('label')
            ->get()
            ->map(function($item) {
                $item->label = trim($item->label);
                return $item;
            });

        // Distribution for Opponents
        $opponentStats = DB::table('goles')
            ->leftJoin('tipo_gol', 'goles.gol_penal', '=', 'tipo_gol.tipo_gol')
            ->whereIn('gol_fecha', $matchDates)
            ->where('gol_parariver', 2)
            ->select(DB::raw('COALESCE(tipo_gol.tipo_gol_descripcion, \'Sin catalogar\') as label'), DB::raw('count(*) as count'))
            ->groupBy('label')
            ->get()
            ->map(function($item) {
                $item->label = trim($item->label);
                return $item;
            });

        return response()->json([
            'river' => $riverStats,
            'opponent' => $opponentStats,
            'since' => $sinceDate ? \Carbon\Carbon::parse($sinceDate)->format('d/m/Y') : null,
            'total_cataloged' => [
                'river' => $riverStats->sum('count'),
                'opponent' => $opponentStats->sum('count')
            ]
        ]);
    }

    #[OA\Get(
        path: '/v1/partidos',
        summary: 'List and filter partidos',
        operationId: 'getPartidos',
        security: [['sanctum' => []]],
        tags: ['Partidos'],
        parameters: [
            new OA\Parameter(name: 'torneo', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'adversario', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'arbitro', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'estadio', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'fase', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'condicion', in: 'query', schema: new OA\Schema(type: 'integer', enum: [1, 2, 3])),
            new OA\Parameter(name: 'fecha_desde', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'fecha_hasta', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'torneo_nivel', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'hoy', in: 'query', schema: new OA\Schema(type: 'boolean')),
            new OA\Parameter(name: 'limit', in: 'query', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(ref: '#/components/schemas/PartidoResource')
                        )
                    ]
                )
            )
        ]
    )]
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Partido::with(['torneo_rel', 'rival', 'arbitro_rel', 'estadio_rel', 'condicion_rel', 'fase_rel', 'goles.jugador', 'goles.tipo_gol_rel', 'goles.periodo_rel']);
        $title = 'Resultados';

        if ($request->filled('q')) {
            $searchTerm = $request->q;
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('rival', function ($r) use ($searchTerm) {
                    $r->where('ri_desc', 'ILIKE', "%{$searchTerm}%");
                })->orWhereHas('torneo_rel', function ($t) use ($searchTerm) {
                    $t->where('tor_desc', 'ILIKE', "%{$searchTerm}%");
                });
            });
        }

        if ($request->filled('torneo')) {
            $query->where('torneo', $request->torneo);
        }

        if ($request->filled('adversario')) {
            $query->where('adversario', $request->adversario);
        }

        if ($request->filled('arbitro')) {
            $query->where('arbitro', $request->arbitro);
        }

        if ($request->filled('estadio')) {
            $query->where('estadio', $request->estadio);
        }

        if ($request->filled('fase')) {
            $query->where('fase', $request->fase);
        }

        if ($request->filled('condicion')) {
            $query->where('condicion', $request->condicion);
        }

        if ($request->filled('fecha_desde')) {
            $query->where('fecha', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->where('fecha', '<=', $request->fecha_hasta);
        }

        if ($request->boolean('hoy')) {
            $queryHoy = clone $query;
            $queryHoy->whereMonth('fecha', now()->month)
                     ->whereDay('fecha', now()->day);
            
            if ($queryHoy->count() > 0) {
                $query = $queryHoy;
                $title = 'Un día como hoy...';
            } else {
                // Fallback to latest matches overall if nothing for today
                $title = 'Resultados Recientes';
            }
        }

        // Filter by Torneo Nivel (requires join or whereHas)
        if ($request->filled('torneo_nivel')) {
            $query->whereHas('torneo_rel', function ($q) use ($request) {
                $q->where('tor_nivel', $request->torneo_nivel);
            });
        }

        // Calculate summary stats for ALL results matching the current filters
        $stats = (clone $query)->selectRaw('
            COUNT(*) as pj,
            COUNT(CASE WHEN go_ri > go_ad THEN 1 END) as pg,
            COUNT(CASE WHEN go_ri = go_ad THEN 1 END) as pe,
            COUNT(CASE WHEN go_ri < go_ad THEN 1 END) as pp,
            SUM(go_ri) as gf,
            SUM(go_ad) as gc
        ')->first();

        // Calculate breakdown by condition
        $breakdown = (clone $query)->selectRaw('
            condicion,
            COUNT(*) as pj,
            COUNT(CASE WHEN go_ri > go_ad THEN 1 END) as pg,
            COUNT(CASE WHEN go_ri = go_ad THEN 1 END) as pe,
            COUNT(CASE WHEN go_ri < go_ad THEN 1 END) as pp,
            SUM(go_ri) as gf,
            SUM(go_ad) as gc
        ')->groupBy('condicion')->get()->keyBy('condicion');

        $formatBreakdown = function($data) {
            if (!$data) return ['pj' => 0, 'pg' => 0, 'pe' => 0, 'pp' => 0, 'gf' => 0, 'gc' => 0, 'dg' => 0];
            return [
                'pj' => (int) $data->pj,
                'pg' => (int) $data->pg,
                'pe' => (int) $data->pe,
                'pp' => (int) $data->pp,
                'gf' => (int) $data->gf,
                'gc' => (int) $data->gc,
                'dg' => (int) ($data->gf - $data->gc),
            ];
        };

        $limit = $request->input('limit', 20);
        
        // Always order by date descending if not specifically searching (or as a tie-breaker)
        $query->orderBy('fecha', 'desc');

        $partidos = $query->paginate($limit);

        return PartidoResource::collection($partidos)->additional([
            'meta' => [
                'title' => $title,
                'summary' => [
                    'pj' => (int) $stats->pj,
                    'pg' => (int) $stats->pg,
                    'pe' => (int) $stats->pe,
                    'pp' => (int) $stats->pp,
                    'gf' => (int) $stats->gf,
                    'gc' => (int) $stats->gc,
                    'dg' => (int) ($stats->gf - $stats->gc),
                    'breakdown' => [
                        'local' => $formatBreakdown($breakdown->get(1)),
                        'visitante' => $formatBreakdown($breakdown->get(2)),
                        'neutral' => $formatBreakdown($breakdown->get(3)),
                    ]
                ]
            ]
        ]);
    }

    #[OA\Post(
        path: '/v1/partidos',
        summary: 'Create a new partido',
        operationId: 'createPartido',
        security: [['sanctum' => []]],
        tags: ['Partidos'],
        responses: [
            new OA\Response(response: 201, description: 'Created successfully')
        ]
    )]
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $partido = Partido::create($request->all());
        return new PartidoResource($partido->load(['torneo_rel', 'rival', 'arbitro_rel', 'estadio_rel', 'condicion_rel', 'fase_rel', 'goles.jugador', 'goles.tipo_gol_rel', 'goles.periodo_rel']));
    }

    #[OA\Get(
        path: '/v1/partidos/{fecha}',
        summary: 'Get partido by fecha',
        operationId: 'getPartidoByFecha',
        security: [['sanctum' => []]],
        tags: ['Partidos'],
        parameters: [
            new OA\Parameter(name: 'fecha', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'date'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'data', ref: '#/components/schemas/PartidoResource')
                    ]
                )
            )
        ]
    )]
    /**
     * Display the specified resource.
     */
    public function show(string $fecha)
    {
        $partido = Partido::with(['torneo_rel', 'rival', 'arbitro_rel', 'estadio_rel', 'condicion_rel', 'fase_rel', 'goles.jugador', 'goles.tipo_gol_rel', 'goles.periodo_rel'])->findOrFail($fecha);
        return new PartidoResource($partido);
    }

    #[OA\Put(
        path: '/v1/partidos/{fecha}',
        summary: 'Update a partido',
        operationId: 'updatePartido',
        security: [['sanctum' => []]],
        tags: ['Partidos'],
        parameters: [
            new OA\Parameter(name: 'fecha', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'date'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Updated successfully')
        ]
    )]
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $fecha)
    {
        $partido = Partido::findOrFail($fecha);
        $partido->update($request->all());
        return new PartidoResource($partido->load(['torneo_rel', 'rival', 'arbitro_rel', 'estadio_rel', 'condicion_rel', 'fase_rel', 'goles.jugador', 'goles.tipo_gol_rel', 'goles.periodo_rel']));
    }

    #[OA\Delete(
        path: '/v1/partidos/{fecha}',
        summary: 'Delete a partido',
        operationId: 'deletePartido',
        security: [['sanctum' => []]],
        tags: ['Partidos'],
        parameters: [
            new OA\Parameter(name: 'fecha', in: 'path', required: true, schema: new OA\Schema(type: 'string', format: 'date'))
        ],
        responses: [
            new OA\Response(response: 204, description: 'Deleted successfully')
        ]
    )]
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $fecha)
    {
        $partido = Partido::findOrFail($fecha);
        $partido->delete();
        return response()->noContent();
    }
}
