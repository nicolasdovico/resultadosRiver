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
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return RivalResource::collection(Rival::all());
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
        return new RivalResource(Rival::findOrFail($id));
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
