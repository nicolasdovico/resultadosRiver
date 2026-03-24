<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EstadioResource;
use App\Models\Estadio;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class EstadioController extends Controller
{
    #[OA\Get(
        path: '/v1/estadios',
        summary: 'List all estadios',
        operationId: 'getEstadios',
        security: [['sanctum' => []]],
        tags: ['Estadios'],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Estadio::query();
        if ($request->has('q')) {
            $query->where('es_desc', 'ILIKE', "%{$request->q}%");
        }
        return EstadioResource::collection($query->paginate(50));
    }

    #[OA\Post(
        path: '/v1/estadios',
        summary: 'Create a new estadio',
        operationId: 'createEstadio',
        security: [['sanctum' => []]],
        tags: ['Estadios'],
        responses: [
            new OA\Response(response: 201, description: 'Created successfully')
        ]
    )]
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Estadio::create($request->all());
        return new EstadioResource($record);
    }

    #[OA\Get(
        path: '/v1/estadios/{id}',
        summary: 'Get estadio by ID',
        operationId: 'getEstadioById',
        security: [['sanctum' => []]],
        tags: ['Estadios'],
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
        $estadio = Estadio::with(['partidos.rival', 'partidos.torneo_rel'])->findOrFail($id);
        return new EstadioResource($estadio);
    }

    #[OA\Put(
        path: '/v1/estadios/{id}',
        summary: 'Update an estadio',
        operationId: 'updateEstadio',
        security: [['sanctum' => []]],
        tags: ['Estadios'],
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
        $record = Estadio::findOrFail($id);
        $record->update($request->all());
        return new EstadioResource($record);
    }

    #[OA\Delete(
        path: '/v1/estadios/{id}',
        summary: 'Delete an estadio',
        operationId: 'deleteEstadio',
        security: [['sanctum' => []]],
        tags: ['Estadios'],
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
        $record = Estadio::findOrFail($id);
        $record->delete();
        return response()->noContent();
    }
}
