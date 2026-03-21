<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RivalResource;
use App\Models\Rival;
use Illuminate\Http\Request;

class RivalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return RivalResource::collection(Rival::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $record = Rival::create($request->all());
        return new RivalResource($record);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return new RivalResource(Rival::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $record = Rival::findOrFail($id);
        $record->update($request->all());
        return new RivalResource($record);
    }

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
