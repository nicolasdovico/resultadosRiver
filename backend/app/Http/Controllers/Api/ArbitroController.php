<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArbitroResource;
use App\Models\Arbitro;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ArbitroController extends Controller
{
    #[OA\Get(
        path: '/v1/arbitros',
        summary: 'List all arbitros',
        operationId: 'getArbitros',
        security: [['sanctum' => []]],
        tags: ['Arbitros'],
        parameters: [
            new OA\Parameter(name: 'q', in: 'query', schema: new OA\Schema(type: 'string')),
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
                            items: new OA\Items(ref: '#/components/schemas/ArbitroResource')
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
        $query = Arbitro::query();
        if ($request->has('q')) {
            $query->where('ar_apno', 'ILIKE', "%{$request->q}%");
        }

        $limit = $request->query('limit', 50);
        if ($limit == -1) {
            return ArbitroResource::collection($query->orderBy('ar_apno')->get());
        }

        return ArbitroResource::collection($query->orderBy('ar_apno')->paginate($limit));
    }

    #[OA\Post(
        path: '/v1/arbitros',
        summary: 'Create a new arbitro',
        operationId: 'createArbitro',
        security: [['sanctum' => []]],
        tags: ['Arbitros'],
        responses: [
            new OA\Response(response: 201, description: 'Created successfully')
        ]
    )]
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Arbitro::create($request->all());
        return new ArbitroResource($record);
    }

    #[OA\Get(
        path: '/v1/arbitros/{id}',
        summary: 'Get arbitro by ID',
        operationId: 'getArbitroById',
        security: [['sanctum' => []]],
        tags: ['Arbitros'],
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
        $arbitro = Arbitro::with(['partidos.rival', 'partidos.torneo_rel'])->findOrFail($id);
        return new ArbitroResource($arbitro);
    }

    #[OA\Put(
        path: '/v1/arbitros/{id}',
        summary: 'Update an arbitro',
        operationId: 'updateArbitro',
        security: [['sanctum' => []]],
        tags: ['Arbitros'],
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
        $record = Arbitro::findOrFail($id);
        $record->update($request->all());
        return new ArbitroResource($record);
    }

    #[OA\Delete(
        path: '/v1/arbitros/{id}',
        summary: 'Delete an arbitro',
        operationId: 'deleteArbitro',
        security: [['sanctum' => []]],
        tags: ['Arbitros'],
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
        $record = Arbitro::findOrFail($id);
        $record->delete();
        return response()->noContent();
    }
}
