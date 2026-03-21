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
        security: [['sanctum' => []]],
        tags: ['Arbitros'],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function index()
    {
        return ArbitroResource::collection(Arbitro::all());
    }

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
        security: [['sanctum' => []]],
        tags: ['Arbitros'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    public function show(string $id)
    {
        return new ArbitroResource(Arbitro::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $record = Arbitro::findOrFail($id);
        $record->update($request->all());
        return new ArbitroResource($record);
    }

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
