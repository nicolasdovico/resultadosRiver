<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partido;
use App\Http\Resources\PartidoResource;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class PartidoController extends Controller
{
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
            new OA\Parameter(name: 'fecha_desde', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'fecha_hasta', in: 'query', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'torneo_nivel', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'hoy', in: 'query', schema: new OA\Schema(type: 'boolean')),
            new OA\Parameter(name: 'limit', in: 'query', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Partido::with(['torneo_rel', 'rival', 'arbitro_rel', 'estadio_rel', 'condicion_rel', 'fase_rel', 'tecnico_rel', 'goles.jugador']);
        $title = 'Resultados';

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

        if ($request->has('arbitro')) {
            $query->where('arbitro', $request->arbitro);
        }

        if ($request->has('estadio')) {
            $query->where('estadio', $request->estadio);
        }

        if ($request->has('fase')) {
            $query->where('fase', $request->fase);
        }

        if ($request->has('fecha_desde')) {
            $query->where('fecha', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
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
        if ($request->has('torneo_nivel')) {
            $query->whereHas('torneo_rel', function ($q) use ($request) {
                $q->where('tor_nivel', $request->torneo_nivel);
            });
        }

        $limit = $request->input('limit', 20);
        
        // Always order by date descending if not specifically searching (or as a tie-breaker)
        $query->orderBy('fecha', 'desc');

        $partidos = $query->paginate($limit);

        return PartidoResource::collection($partidos)->additional([
            'meta' => [
                'title' => $title
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
        return new PartidoResource($partido->load(['torneo_rel', 'rival', 'arbitro_rel', 'estadio_rel', 'condicion_rel', 'fase_rel', 'tecnico_rel', 'goles.jugador']));
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
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    /**
     * Display the specified resource.
     */
    public function show(string $fecha)
    {
        $partido = Partido::with(['torneo_rel', 'rival', 'arbitro_rel', 'estadio_rel', 'condicion_rel', 'fase_rel', 'tecnico_rel', 'goles.jugador'])->findOrFail($fecha);
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
        return new PartidoResource($partido->load(['torneo_rel', 'rival', 'arbitro_rel', 'estadio_rel', 'condicion_rel', 'fase_rel', 'tecnico_rel', 'goles.jugador']));
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
