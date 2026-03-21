<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\JugadorResource;
use App\Models\Jugador;
use Illuminate\Http\Request;

class JugadorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return JugadorResource::collection(Jugador::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Jugador::create($request->all());
        return new JugadorResource($record);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return new JugadorResource(Jugador::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $record = Jugador::findOrFail($id);
        $record->update($request->all());
        return new JugadorResource($record);
    }

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
