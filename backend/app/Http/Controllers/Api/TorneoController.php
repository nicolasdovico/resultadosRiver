<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TorneoResource;
use App\Models\Torneo;
use App\Models\Partido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use OpenApi\Attributes as OA;

class TorneoController extends Controller
{
    #[OA\Get(
        path: '/v1/torneos',
        summary: 'List all torneos',
        operationId: 'getTorneos',
        security: [['sanctum' => []]],
        tags: ['Torneos'],
        parameters: [
            new OA\Parameter(name: 'q', in: 'query', description: 'Search by description', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'año', in: 'query', description: 'Filter by year', schema: new OA\Schema(type: 'integer'))
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
        $user = $request->user('sanctum');
        $isPremium = $user && $user->isPremium();
        
        $query = Torneo::query();

        // Subquery to get the latest match year for each tournament
        $query->addSelect([
            'ultimo_anio' => Partido::selectRaw('EXTRACT(YEAR FROM MAX(fecha))')
                ->whereColumn('torneo', 'torneos.tor_id')
        ]);

        if ($request->has('q')) {
            $query->where('tor_desc', 'like', '%' . mb_strtoupper($request->q, 'UTF-8') . '%');
        }

        if ($request->has('año')) {
            $query->whereHas('partidos', function($q) use ($request) {
                $q->whereYear('fecha', $request->año);
            });
        }

        $query->orderBy('ultimo_anio', 'desc')->orderBy('tor_desc', 'asc');

        // Pagination logic
        $perPage = $request->query('limit', 15);
        $paginator = $query->paginate($perPage);

        return TorneoResource::collection($paginator->items())->additional([
            'meta' => [
                'total' => $paginator->total(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
            ]
        ]);
    }

    #[OA\Post(
        path: '/v1/torneos',
        summary: 'Create a new torneo',
        operationId: 'createTorneo',
        security: [['sanctum' => []]],
        tags: ['Torneos'],
        responses: [
            new OA\Response(response: 201, description: 'Created successfully')
        ]
    )]
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Torneo::create($request->all());
        return new TorneoResource($record);
    }

    #[OA\Get(
        path: '/v1/torneos/{id}',
        summary: 'Get torneo by ID',
        operationId: 'getTorneoById',
        security: [['sanctum' => []]],
        tags: ['Torneos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $torneo = Torneo::with(['partidos.rival', 'partidos.fase_rel', 'partidos.condicion_rel'])->findOrFail($id);
        return new TorneoResource($torneo);
    }

    #[OA\Put(
        path: '/v1/torneos/{id}',
        summary: 'Update a torneo',
        operationId: 'updateTorneo',
        security: [['sanctum' => []]],
        tags: ['Torneos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Updated successfully')
        ]
    )]
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $record = Torneo::findOrFail($id);
        $record->update($request->all());
        return new TorneoResource($record);
    }

    #[OA\Delete(
        path: '/v1/torneos/{id}',
        summary: 'Delete a torneo',
        operationId: 'deleteTorneo',
        security: [['sanctum' => []]],
        tags: ['Torneos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 204, description: 'Deleted successfully')
        ]
    )]
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $record = Torneo::findOrFail($id);
        $record->delete();
        return response()->noContent();
    }
}
