<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TecnicoResource;
use App\Models\Tecnico;
use Illuminate\Http\Request;

class TecnicoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return TecnicoResource::collection(Tecnico::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Tecnico::create($request->all());
        return new TecnicoResource($record);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return new TecnicoResource(Tecnico::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $record = Tecnico::findOrFail($id);
        $record->update($request->all());
        return new TecnicoResource($record);
    }

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
