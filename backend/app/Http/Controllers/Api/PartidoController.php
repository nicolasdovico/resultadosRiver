<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partido;
use App\Http\Resources\PartidoResource;
use Illuminate\Http\Request;

class PartidoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/v1/partidos",
     *     tags={"Partidos"},
     *     summary="List and filter partidos",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="torneo",
     *         in="query",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="fecha_desde",
     *         in="query",
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Partido::with(['torneo', 'rival', 'arbitro', 'estadio', 'condicion', 'fase', 'goles.jugador']);

        if ($request->has('torneo')) {
            $query->where('torneo', $request->torneo);
        }

        if ($request->has('adversario')) {
            $query->where('adversario', $request->adversario);
        }

        if ($request->has('arbitro')) {
            $query->where('arbitro', $request->arbitro);
        }

        if ($request->has('estadio')) {
            $query->where('estadio', $request->estadio);
        }

        if ($request->has('fase')) {
            $query->where('fase', $request->fase);
        }

        if ($request->has('fecha_desde')) {
            $query->where('fecha', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta')) {
            $query->where('fecha', '<=', $request->fecha_hasta);
        }

        // Filter by Torneo Nivel (requires join or whereHas)
        if ($request->has('torneo_nivel')) {
            $query->whereHas('torneo', function ($q) use ($request) {
                $q->where('tor_nivel', $request->torneo_nivel);
            });
        }

        $partidos = $query->paginate(20);

        return PartidoResource::collection($partidos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $partido = Partido::create($request->all());
        return new PartidoResource($partido->load(['torneo', 'rival', 'arbitro', 'estadio', 'condicion', 'fase', 'goles.jugador']));
    }

    /**
     * @OA\Get(
     *     path="/v1/partidos/{fecha}",
     *     tags={"Partidos"},
     *     summary="Get partido by fecha",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="fecha",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     * Display the specified resource.
     */
    public function show(string $fecha)
    {
        $partido = Partido::with(['torneo', 'rival', 'arbitro', 'estadio', 'condicion', 'fase', 'goles.jugador'])->findOrFail($fecha);
        return new PartidoResource($partido);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $fecha)
    {
        $partido = Partido::findOrFail($fecha);
        $partido->update($request->all());
        return new PartidoResource($partido->load(['torneo', 'rival', 'arbitro', 'estadio', 'condicion', 'fase', 'goles.jugador']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $fecha)
    {
        $partido = Partido::findOrFail($fecha);
        $partido->delete();
        return response()->noContent();
    }
}
