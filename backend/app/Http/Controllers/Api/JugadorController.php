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
        path: "/v1/jugadores",
        summary: "List all jugadores",
        operationId: "getJugadores",
        security: [["sanctum" => []]],
        tags: ["Jugadores"],
        parameters: [
            new OA\Parameter(name: "q", in: "query", description: "Search by name", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "letter", in: "query", description: "Filter by initial letter", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "limit", in: "query", description: "Records per page", required: false, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Successful operation")
        ]
    )]
    public function index(Request $request)
    {
        $query = Jugador::query()->withCount("goles");

        if ($request->has("q")) {
            $query->where("pl_apno", "ILIKE", "%{$request->q}%");
        }

        if ($request->has("letter")) {
            $query->where("pl_apno", "ILIKE", "{$request->letter}%");
        }

        $limit = $request->query("limit", 50);
        if ($limit == -1) {
            return JugadorResource::collection($query->orderBy("pl_apno")->get());
        }

        return JugadorResource::collection($query->orderBy("pl_apno")->paginate($limit));
    }

    #[OA\Get(
        path: "/v1/jugadores/{id}",
        summary: "Get jugador by ID",
        operationId: "getJugadorById",
        security: [["sanctum" => []]],
        tags: ["Jugadores"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Successful operation")
        ]
    )]
    public function show(string $id)
    {
        $jugador = Jugador::with([
            "goles.tipo_gol_rel", 
            "goles.periodo_rel",
            "goles.partido.rival" // Importante para el historial detallado
        ])
        ->withCount("goles")
        ->findOrFail($id);

        return new JugadorResource($jugador);
    }

    #[OA\Post(
        path: "/v1/jugadores",
        summary: "Create a new jugador",
        operationId: "createJugador",
        security: [["sanctum" => []]],
        tags: ["Jugadores"],
        responses: [
            new OA\Response(response: 201, description: "Created successfully")
        ]
    )]
    public function store(Request $request)
    {
        $record = Jugador::create($request->all());
        return new JugadorResource($record);
    }

    #[OA\Put(
        path: "/v1/jugadores/{id}",
        summary: "Update a jugador",
        operationId: "updateJugador",
        security: [["sanctum" => []]],
        tags: ["Jugadores"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Updated successfully")
        ]
    )]
    public function update(Request $request, string $id)
    {
        $record = Jugador::findOrFail($id);
        $record->update($request->all());
        return new JugadorResource($record);
    }

    #[OA\Delete(
        path: "/v1/jugadores/{id}",
        summary: "Delete a jugador",
        operationId: "deleteJugador",
        security: [["sanctum" => []]],
        tags: ["Jugadores"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 204, description: "Deleted successfully")
        ]
    )]
    public function destroy(string $id)
    {
        $record = Jugador::findOrFail($id);
        $record->delete();
        return response()->noContent();
    }
}
