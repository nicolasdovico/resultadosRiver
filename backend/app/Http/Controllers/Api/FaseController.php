<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaseResource;
use App\Models\Fase;
use Illuminate\Http\Request;

class FaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return FaseResource::collection(Fase::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Fase::create($request->all());
        return new FaseResource($record);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return new FaseResource(Fase::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $record = Fase::findOrFail($id);
        $record->update($request->all());
        return new FaseResource($record);
    }

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
