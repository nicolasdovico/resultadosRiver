<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TecnicoResource;
use App\Models\Tecnico;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

class TecnicoController extends Controller
{
    #[OA\Get(
        path: '/v1/tecnicos',
        summary: 'List all tecnicos',
        operationId: 'getTecnicos',
        security: [['sanctum' => []]],
        tags: ['Tecnicos'],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Tecnico::query();
        if ($request->has('q')) {
            $query->where('tec_ape_nom', 'ILIKE', "%{$request->q}%");
        }
        return TecnicoResource::collection($query->paginate(50));
    }

    #[OA\Post(
        path: '/v1/tecnicos',
        summary: 'Create a new tecnico',
        operationId: 'createTecnico',
        security: [['sanctum' => []]],
        tags: ['Tecnicos'],
        responses: [
            new OA\Response(response: 201, description: 'Created successfully')
        ]
    )]
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Tecnico::create($request->all());
        return new TecnicoResource($record);
    }

    #[OA\Get(
        path: '/v1/tecnicos/{id}',
        summary: 'Get tecnico by ID',
        operationId: 'getTecnicoById',
        security: [['sanctum' => []]],
        tags: ['Tecnicos'],
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
        return new TecnicoResource(Tecnico::findOrFail($id));
    }

    #[OA\Put(
        path: '/v1/tecnicos/{id}',
        summary: 'Update a tecnico',
        operationId: 'updateTecnico',
        security: [['sanctum' => []]],
        tags: ['Tecnicos'],
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
        $record = Tecnico::findOrFail($id);
        $record->update($request->all());
        return new TecnicoResource($record);
    }

    #[OA\Delete(
        path: '/v1/tecnicos/{id}',
        summary: 'Delete a tecnico',
        operationId: 'deleteTecnico',
        security: [['sanctum' => []]],
        tags: ['Tecnicos'],
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
        $record = Tecnico::findOrFail($id);
        $record->delete();
        return response()->noContent();
    }
}
