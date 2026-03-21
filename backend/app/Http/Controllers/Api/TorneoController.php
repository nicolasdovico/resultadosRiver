<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TorneoResource;
use App\Models\Torneo;
use Illuminate\Http\Request;

class TorneoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return TorneoResource::collection(Torneo::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Torneo::create($request->all());
        return new TorneoResource($record);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return new TorneoResource(Torneo::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $record = Torneo::findOrFail($id);
        $record->update($request->all());
        return new TorneoResource($record);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $record = Torneo::findOrFail($id);
        $record->delete();
        return response()->noContent();
    }
}
