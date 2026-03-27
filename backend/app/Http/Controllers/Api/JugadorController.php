<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\JugadorResource;
use App\Models\Jugador;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class JugadorController extends Controller
{
    #[OA\Get(
        path: '/v1/jugadores',
        summary: 'List all jugadores',
        operationId: 'getJugadores',
        security: [['sanctum' => []]],
        tags: ['Jugadores'],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation')
        ]
    )]
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Jugador::query();
        if ($request->has('q')) {
            $query->where('pl_apno', 'ILIKE', "%{$request->q}%");
        }
        return JugadorResource::collection($query->paginate(50));
    }

    #[OA\Post(
        path: '/v1/jugadores',
        summary: 'Create a new jugador',
        operationId: 'createJugador',
        security: [['sanctum' => []]],
        tags: ['Jugadores'],
        responses: [
            new OA\Response(response: 201, description: 'Created successfully')
        ]
    )]
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Jugador::create($request->all());
        return new JugadorResource($record);
    }

    #[OA\Get(
        path: '/v1/jugadores/{id}',
        summary: 'Get jugador by ID',
        operationId: 'getJugadorById',
        security: [['sanctum' => []]],
        tags: ['Jugadores'],
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
        $jugador = Jugador::with(['goles.tipo_gol_rel', 'goles.periodo_rel'])->findOrFail($id);
        return new JugadorResource($jugador);
    }

    #[OA\Put(
        path: '/v1/jugadores/{id}',
        summary: 'Update a jugador',
        operationId: 'updateJugador',
        security: [['sanctum' => []]],
        tags: ['Jugadores'],
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
        $record = Jugador::findOrFail($id);
        $record->update($request->all());
        return new JugadorResource($record);
    }

    #[OA\Delete(
        path: '/v1/jugadores/{id}',
        summary: 'Delete a jugador',
        operationId: 'deleteJugador',
        security: [['sanctum' => []]],
        tags: ['Jugadores'],
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
        $record = Jugador::findOrFail($id);
        $record->delete();
        return response()->noContent();
    }
}
