<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RivalResource;
use App\Models\Rival;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

class RivalController extends Controller
{
    #[OA\Get(
        path: '/v1/rivales',
        summary: 'List all rivales',
        operationId: 'getRivales',
        security: [['sanctum' => []]],
        tags: ['Rivales'],
        parameters: [
            new OA\Parameter(name: 'q', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'letter', in: 'query', schema: new OA\Schema(type: 'string')),
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
                            items: new OA\Items(ref: '#/components/schemas/RivalResource')
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
        $query = Rival::query();
        if ($request->has('q')) {
            $query->where('ri_desc', 'ILIKE', "%{$request->q}%");
        }

        if ($request->has('letter')) {
            $query->where('ri_desc', 'ILIKE', "{$request->letter}%");
        }

        $limit = $request->query('limit', 50);
        if ($limit == -1) {
            return RivalResource::collection($query->orderBy('ri_desc')->get());
        }

        return RivalResource::collection($query->orderBy('ri_desc')->paginate($limit));
    }

    #[OA\Post(
        path: '/v1/rivales',
        summary: 'Create a new rival',
        operationId: 'createRival',
        security: [['sanctum' => []]],
        tags: ['Rivales'],
        responses: [
            new OA\Response(response: 201, description: 'Created successfully')
        ]
    )]
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Rival::create($request->all());
        return new RivalResource($record);
    }

    #[OA\Get(
        path: '/v1/rivales/classics',
        summary: 'Get stats for classic rivals (Big 5)',
        operationId: 'getClassicStats',
        security: [['sanctum' => []]],
        tags: ['Rivales'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(ref: '#/components/schemas/RivalResource')
                )
            )
        ]
    )]
    public function classics()
    {
        // IDs: 10 (Independiente), 15 (Boca), 16 (San Lorenzo), 20 (Racing)
        $classicIds = [10, 15, 16, 20];
        $rivales = Rival::whereIn('ri_id', $classicIds)->get();
        
        return RivalResource::collection($rivales);
    }

    #[OA\Get(
        path: '/v1/rivales/{id}',
        summary: 'Get rival by ID',
        operationId: 'getRivalById',
        security: [['sanctum' => []]],
        tags: ['Rivales'],
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
        $rival = Rival::with(['partidos' => function($query) {
            $query->orderBy('fecha', 'desc');
        }, 'partidos.torneo_rel'])->findOrFail($id);
        return new RivalResource($rival);
    }

    #[OA\Put(
        path: '/v1/rivales/{id}',
        summary: 'Update a rival',
        operationId: 'updateRival',
        security: [['sanctum' => []]],
        tags: ['Rivales'],
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
        $record = Rival::findOrFail($id);
        $record->update($request->all());
        return new RivalResource($record);
    }

    #[OA\Delete(
        path: '/v1/rivales/{id}',
        summary: 'Delete a rival',
        operationId: 'deleteRival',
        security: [['sanctum' => []]],
        tags: ['Rivales'],
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
        $record = Rival::findOrFail($id);
        $record->delete();
        return response()->noContent();
    }
}
