<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EstadioResource;
use App\Models\Estadio;
use Illuminate\Http\Request;

class EstadioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return EstadioResource::collection(Estadio::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Estadio::create($request->all());
        return new EstadioResource($record);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return new EstadioResource(Estadio::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $record = Estadio::findOrFail($id);
        $record->update($request->all());
        return new EstadioResource($record);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $record = Estadio::findOrFail($id);
        $record->delete();
        return response()->noContent();
    }
}
