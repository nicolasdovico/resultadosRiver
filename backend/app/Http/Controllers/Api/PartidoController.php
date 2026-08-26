<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partido;
use App\Models\Rival;
use App\Models\Periodo;
use App\Http\Resources\PartidoResource;
use App\Services\GoalAnalysisService;
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
        // Cache::forget('general_stats'); 
        return Cache::remember('general_stats', 10, function () {
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

            // Último Doblete Global
            $latestBraceRaw = DB::table('goles')
                ->where('gol_parariver', 1)
                ->select('gol_juga', 'gol_fecha', DB::raw('count(*) as total'))
                ->groupBy('gol_juga', 'gol_fecha')
                ->havingRaw('count(*) = 2')
                ->orderBy('gol_fecha', 'desc')
                ->first();
            
            $latestBrace = null;
            if ($latestBraceRaw) {
                $player = \App\Models\Jugador::find($latestBraceRaw->gol_juga);
                $partido = Partido::with('rival')->find($latestBraceRaw->gol_fecha);
                if ($player && $partido) {
                    $latestBrace = [
                        'jugador' => $player->pl_apno,
                        'jugador_id' => $player->pl_id,
                        'fecha' => $partido->fecha,
                        'rival' => $partido->rival->ri_desc,
                        'rival_escudo' => $partido->rival->escudo_url,
                    ];
                }
            }

            // Último Hat-trick Global
            $latestHatTrickRaw = DB::table('goles')
                ->where('gol_parariver', 1)
                ->select('gol_juga', 'gol_fecha', DB::raw('count(*) as total'))
                ->groupBy('gol_juga', 'gol_fecha')
                ->havingRaw('count(*) >= 3')
                ->orderBy('gol_fecha', 'desc')
                ->first();
            
            $latestHatTrick = null;
            if ($latestHatTrickRaw) {
                $player = \App\Models\Jugador::find($latestHatTrickRaw->gol_juga);
                $partido = Partido::with('rival')->find($latestHatTrickRaw->gol_fecha);
                if ($player && $partido) {
                    $latestHatTrick = [
                        'jugador' => $player->pl_apno,
                        'jugador_id' => $player->pl_id,
                        'fecha' => $partido->fecha,
                        'rival' => $partido->rival->ri_desc,
                        'rival_escudo' => $partido->rival->escudo_url,
                        'goles_count' => (int)$latestHatTrickRaw->total
                    ];
                }
            }

            // Resultados más repetidos (Top 2)
            $topResultsRaw = DB::table('estadisticas')
                ->select('go_ri', 'go_ad', DB::raw('count(*) as total'))
                ->groupBy('go_ri', 'go_ad')
                ->orderBy('total', 'desc')
                ->limit(2)
                ->get();

            $topResults = $topResultsRaw->map(function ($item) use ($total) {
                $lastMatch = Partido::with(['rival', 'torneo_rel'])
                    ->where('go_ri', $item->go_ri)
                    ->where('go_ad', $item->go_ad)
                    ->orderBy('fecha', 'desc')
                    ->first();

                return [
                    'resultado' => "{$item->go_ri} - {$item->go_ad}",
                    'count' => (int)$item->total,
                    'percentage' => $total > 0 ? round(($item->total / $total) * 100, 2) : 0,
                    'last_occurrence' => $lastMatch ? [
                        'fecha' => $lastMatch->fecha,
                        'rival' => $lastMatch->rival->ri_desc,
                        'torneo' => $lastMatch->torneo_rel->tor_desc
                    ] : null
                ];
            });

            // Últimos 20 partidos para el semáforo
            $latestMatches = Partido::with('rival')
                ->orderBy('fecha', 'desc')
                ->limit(20)
                ->get()
                ->map(function($match) {
                    $outcome = 'E';
                    if ($match->go_ri > $match->go_ad) $outcome = 'G';
                    if ($match->go_ri < $match->go_ad) $outcome = 'P';

                    return [
                        'fecha' => $match->fecha,
                        'go_ri' => $match->go_ri,
                        'go_ad' => $match->go_ad,
                        'resultado' => $outcome,
                        'rival' => $match->rival->ri_desc,
                        'rival_escudo' => $match->rival->escudo_url
                    ];
                });

            // Últimas Remontadas (Dar vuelta el partido)
            $comebackHome = GoalAnalysisService::getLatestComeback(1); // Local
            $comebackAway = GoalAnalysisService::getLatestComeback(2); // Visitante

            $formatComeback = function($match) {
                if (!$match) return null;
                $date = \Carbon\Carbon::parse($match->fecha);
                return [
                    'fecha' => $match->fecha,
                    'resultado' => "{$match->go_ri} - {$match->go_ad}",
                    'rival' => $match->rival->ri_desc,
                    'rival_escudo' => $match->rival->escudo_url,
                    'torneo' => $match->torneo_rel?->tor_desc ?? 'Amistoso',
                    'dias_pasados' => (int) $date->diffInDays(now())
                ];
            };

            // Goleadores del año calendario (Top 3)
            $currentYear = date('Y');
            $topScorersYearRaw = DB::table('goles')
                ->join('estadisticas', 'goles.gol_fecha', '=', 'estadisticas.fecha')
                ->where('goles.gol_parariver', 1)
                ->where('goles.gol_penal', '!=', 6)
                ->whereRaw("EXTRACT(YEAR FROM CAST(estadisticas.fecha AS DATE)) = ?", [$currentYear])
                ->select('goles.gol_juga', DB::raw('count(*) as total'))
                ->groupBy('goles.gol_juga')
                ->orderBy('total', 'desc')
                ->limit(3)
                ->get();

            $topScorersYear = $topScorersYearRaw->map(function ($item) {
                $player = \App\Models\Jugador::find($item->gol_juga);
                return [
                    'pl_id' => $player->pl_id,
                    'name' => $player->pl_apno,
                    'goals' => (int) $item->total,
                    'pl_foto' => $player->pl_foto ? \Illuminate\Support\Facades\Storage::disk('public')->url($player->pl_foto) : null
                ];
            });

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
                    'total_torneos' => DB::table('torneos')->count(),
                    'latest_brace' => $latestBrace,
                    'latest_hat_trick' => $latestHatTrick,
                    'top_results' => $topResults,
                    'latest_matches' => $latestMatches,
                    'latest_comeback_home' => $formatComeback($comebackHome),
                    'latest_comeback_away' => $formatComeback($comebackAway),
                    'top_scorers_year' => $topScorersYear
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
        $this->applyCustomFilters($query, $request);

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
        $this->applyCustomFilters($query, $request);

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

        $this->applyCustomFilters($query, $request);

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

        if ($limit == -1) {
            $partidos = $query->get();
        } else {
            $partidos = $query->paginate($limit);
        }

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

    #[OA\Get(
        path: '/v1/stats/custom-query',
        summary: 'Get full aggregated statistics, top scorers, streaks and hitos for custom query filter',
        operationId: 'getCustomQueryStats',
        security: [['sanctum' => []]],
        tags: ['Stats'],
        parameters: [
            new OA\Parameter(name: 'adversario', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'torneo', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'torneo_nivel', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'fase', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'estadio', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'arbitro', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'tecnico', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'condicion', in: 'query', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'resultado', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'fecha_desde', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'fecha_hasta', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'q', in: 'query', schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Aggregated custom stats',
                content: new OA\JsonContent(type: 'object')
            )
        ]
    )]
    public function customQueryStats(Request $request)
    {
        $query = Partido::query();
        $this->applyCustomFilters($query, $request);

        $raw = (clone $query)->selectRaw("
            COUNT(*) as pj,
            COALESCE(SUM(go_ri), 0) as gf,
            COALESCE(SUM(go_ad), 0) as gc,
            COALESCE(SUM(CASE WHEN go_ri > go_ad THEN 1 ELSE 0 END), 0) as pg,
            COALESCE(SUM(CASE WHEN go_ri < go_ad THEN 1 ELSE 0 END), 0) as pp,
            COALESCE(SUM(CASE WHEN go_ri = go_ad THEN 1 ELSE 0 END), 0) as pe,
            COALESCE(SUM(CASE WHEN go_ad = 0 THEN 1 ELSE 0 END), 0) as vallas_invictas
        ")->first();

        $pj = (int) ($raw->pj ?? 0);
        $pg = (int) ($raw->pg ?? 0);
        $pe = (int) ($raw->pe ?? 0);
        $pp = (int) ($raw->pp ?? 0);
        $gf = (int) ($raw->gf ?? 0);
        $gc = (int) ($raw->gc ?? 0);
        $vallasInvictas = (int) ($raw->vallas_invictas ?? 0);

        $puntos = ($pg * 3) + $pe;
        $efectividad = $pj > 0 ? round(($puntos / ($pj * 3)) * 100, 2) : 0;

        $stats = [
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

        $matchDatesQuery = (clone $query)->select('fecha');

        // Top Scorers
        $topScorers = DB::table('goles')
            ->join('players', 'goles.gol_juga', '=', 'players.pl_id')
            ->whereIn('goles.gol_fecha', $matchDatesQuery)
            ->where('goles.gol_parariver', 1)
            ->where('goles.gol_penal', '!=', 6)
            ->select(
                'players.pl_id',
                'players.pl_apno',
                'players.pl_foto',
                DB::raw('count(*) as goals_count')
            )
            ->groupBy('players.pl_id', 'players.pl_apno', 'players.pl_foto')
            ->orderByDesc('goals_count')
            ->limit(3)
            ->get()
            ->map(function ($scorer) {
                return [
                    'pl_id' => $scorer->pl_id,
                    'pl_apno' => trim($scorer->pl_apno),
                    'pl_foto' => $scorer->pl_foto ? (str_starts_with($scorer->pl_foto, 'http') ? $scorer->pl_foto : config('app.url') . \Illuminate\Support\Facades\Storage::url($scorer->pl_foto)) : null,
                    'goals_count' => (int) $scorer->goals_count
                ];
            });

        // Streaks
        $matchesChronological = (clone $query)->orderBy('fecha', 'asc')->get(['fecha', 'go_ri', 'go_ad']);
        $streaks = $this->calculateStreaks($matchesChronological);

        // Hitos
        $lastWonMatch = (clone $query)->whereRaw('go_ri > go_ad')->with(['torneo_rel', 'condicion_rel', 'rival'])->orderBy('fecha', 'desc')->first();
        $lastLostMatch = (clone $query)->whereRaw('go_ri < go_ad')->with(['torneo_rel', 'condicion_rel', 'rival'])->orderBy('fecha', 'desc')->first();

        $formatHito = function($match) {
            if (!$match) return null;
            $date = \Carbon\Carbon::parse($match->fecha);
            return [
                'fecha' => $match->fecha,
                'torneo' => $match->torneo_rel ? trim($match->torneo_rel->tor_desc) : 'Desconocido',
                'condicion' => $match->condicion_rel ? trim($match->condicion_rel->descripcion) : 'Desconocido',
                'rival' => $match->rival ? trim($match->rival->ri_desc) : 'Desconocido',
                'escudo_url' => $match->rival ? $match->rival->escudo_url : null,
                'resultado' => "{$match->go_ri} - {$match->go_ad}",
                'dias_transcurridos' => $date->diffInDays(now()),
            ];
        };

        return response()->json([
            'data' => [
                'stats' => $stats,
                'top_scorers' => $topScorers,
                'streaks' => $streaks,
                'last_won_match' => $formatHito($lastWonMatch),
                'last_lost_match' => $formatHito($lastLostMatch),
            ]
        ]);
    }

    /**
     * Apply custom query filters to any match query.
     */
    protected function applyCustomFilters($query, Request $request)
    {
        $likeOperator = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';

        if ($request->filled('q')) {
            $searchTerm = $request->q;
            $query->where(function ($q) use ($searchTerm, $likeOperator) {
                $q->whereHas('rival', function ($r) use ($searchTerm, $likeOperator) {
                    $r->where('ri_desc', $likeOperator, "%{$searchTerm}%");
                })->orWhereHas('torneo_rel', function ($t) use ($searchTerm, $likeOperator) {
                    $t->where('tor_desc', $likeOperator, "%{$searchTerm}%");
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

        if ($request->filled('torneo_nivel')) {
            $query->whereHas('torneo_rel', function ($q) use ($request) {
                $q->where('tor_nivel', $request->torneo_nivel);
            });
        }

        if ($request->filled('tecnico')) {
            $tecnico = \App\Models\Tecnico::find($request->tecnico);
            if ($tecnico) {
                $query->where('fecha', '>=', $tecnico->desde);
                if ($tecnico->hasta) {
                    $query->where('fecha', '<=', $tecnico->hasta);
                }
            }
        }

        if ($request->filled('resultado')) {
            $res = strtoupper($request->resultado);
            if ($res === 'G') {
                $query->whereRaw('go_ri > go_ad');
            } elseif ($res === 'E') {
                $query->whereRaw('go_ri = go_ad');
            } elseif ($res === 'P') {
                $query->whereRaw('go_ri < go_ad');
            }
        }

        return $query;
    }

    /**
     * Calculate streaks (invincibility and drought) from chronological matches.
     */
    protected function calculateStreaks($partidos)
    {
        if ($partidos->isEmpty()) {
            return [
                'invincibility' => null,
                'drought' => null
            ];
        }

        $maxInv = ['count' => 0, 'start' => null, 'end' => null];
        $maxDro = ['count' => 0, 'start' => null, 'end' => null];
        $curInv = ['count' => 0, 'start' => null, 'end' => null];
        $curDro = ['count' => 0, 'start' => null, 'end' => null];

        foreach ($partidos as $p) {
            $res = $p->resultado;
            if ($res === 'G' || $res === 'E') {
                if ($curInv['count'] === 0) $curInv['start'] = $p->fecha;
                $curInv['count']++;
                $curInv['end'] = $p->fecha;
            } else {
                if ($curInv['count'] > $maxInv['count']) $maxInv = $curInv;
                $curInv = ['count' => 0, 'start' => null, 'end' => null];
            }

            if ($res === 'P' || $res === 'E') {
                if ($curDro['count'] === 0) $curDro['start'] = $p->fecha;
                $curDro['count']++;
                $curDro['end'] = $p->fecha;
            } else {
                if ($curDro['count'] > $maxDro['count']) $maxDro = $curDro;
                $curDro = ['count' => 0, 'start' => null, 'end' => null];
            }
        }

        if ($curInv['count'] > $maxInv['count']) $maxInv = $curInv;
        if ($curDro['count'] > $maxDro['count']) $maxDro = $curDro;

        $lastMatchDate = $partidos->last()->fecha;

        $process = function($streak) use ($lastMatchDate) {
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
            'invincibility' => $process($maxInv),
            'drought' => $process($maxDro)
        ];
    }
}
