<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaseResource;
use App\Models\Fase;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class FaseController extends Controller
{
    #[OA\Get(
        path: '/v1/fases',
        summary: 'List all fases',
        operationId: 'getFases',
        security: [['sanctum' => []]],
        tags: ['Fases'],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return FaseResource::collection(Fase::all());
    }

    #[OA\Post(
        path: '/v1/fases',
        summary: 'Create a new fase',
        operationId: 'createFase',
        security: [['sanctum' => []]],
        tags: ['Fases'],
        responses: [
            new OA\Response(response: 201, description: 'Created successfully')
        ]
    )]
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Fase::create($request->all());
        return new FaseResource($record);
    }

    #[OA\Get(
        path: '/v1/fases/{id}',
        summary: 'Get fase by ID',
        operationId: 'getFaseById',
        security: [['sanctum' => []]],
        tags: ['Fases'],
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
        return new FaseResource(Fase::findOrFail($id));
    }

    #[OA\Put(
        path: '/v1/fases/{id}',
        summary: 'Update a fase',
        operationId: 'updateFase',
        security: [['sanctum' => []]],
        tags: ['Fases'],
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
        $record = Fase::findOrFail($id);
        $record->update($request->all());
        return new FaseResource($record);
    }

    #[OA\Delete(
        path: '/v1/fases/{id}',
        summary: 'Delete a fase',
        operationId: 'deleteFase',
        security: [['sanctum' => []]],
        tags: ['Fases'],
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
        $record = Fase::findOrFail($id);
        $record->delete();
        return response()->noContent();
    }
}
