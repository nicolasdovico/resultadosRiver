<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ArbitroController;
use App\Http\Controllers\Api\EstadioController;
use App\Http\Controllers\Api\JugadorController;
use App\Http\Controllers\Api\RivalController;
use App\Http\Controllers\Api\TorneoController;
use App\Http\Controllers\Api\TecnicoController;
use App\Http\Controllers\Api\FaseController;
use App\Http\Controllers\Api\PartidoController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    // Public/Free access (might be restricted by middleware inside controllers if needed, 
    // but here we define the general access)
    Route::middleware(['auth:sanctum'])->group(function () {
        
        // Administrative routes (CRUD)
        Route::middleware(['subscription:Admin'])->group(function () {
            Route::post('arbitros', [ArbitroController::class, 'store']);
            Route::put('arbitros/{id}', [ArbitroController::class, 'update']);
            Route::delete('arbitros/{id}', [ArbitroController::class, 'destroy']);
            
            Route::post('estadios', [EstadioController::class, 'store']);
            Route::put('estadios/{id}', [EstadioController::class, 'update']);
            Route::delete('estadios/{id}', [EstadioController::class, 'destroy']);
            
            Route::post('jugadores', [JugadorController::class, 'store']);
            Route::put('jugadores/{id}', [JugadorController::class, 'update']);
            Route::delete('jugadores/{id}', [JugadorController::class, 'destroy']);
            
            Route::post('rivales', [RivalController::class, 'store']);
            Route::put('rivales/{id}', [RivalController::class, 'update']);
            Route::delete('rivales/{id}', [RivalController::class, 'destroy']);
            
            Route::post('torneos', [TorneoController::class, 'store']);
            Route::put('torneos/{id}', [TorneoController::class, 'update']);
            Route::delete('torneos/{id}', [TorneoController::class, 'destroy']);
            
            Route::post('tecnicos', [TecnicoController::class, 'store']);
            Route::put('tecnicos/{id}', [TecnicoController::class, 'update']);
            Route::delete('tecnicos/{id}', [TecnicoController::class, 'destroy']);
            
            Route::post('fases', [FaseController::class, 'store']);
            Route::put('fases/{id}', [FaseController::class, 'update']);
            Route::delete('fases/{id}', [FaseController::class, 'destroy']);
            
            Route::post('partidos', [PartidoController::class, 'store']);
            Route::put('partidos/{id}', [PartidoController::class, 'update']);
            Route::delete('partidos/{id}', [PartidoController::class, 'destroy']);
        });

        // Read routes (available for all authenticated users)
        Route::get('arbitros', [ArbitroController::class, 'index']);
        Route::get('arbitros/{id}', [ArbitroController::class, 'show']);
        
        Route::get('estadios', [EstadioController::class, 'index']);
        Route::get('estadios/{id}', [EstadioController::class, 'show']);
        
        Route::get('jugadores', [JugadorController::class, 'index']);
        Route::get('jugadores/{id}', [JugadorController::class, 'show']);
        
        Route::get('rivales', [RivalController::class, 'index']);
        Route::get('rivales/{id}', [RivalController::class, 'show']);
        
        Route::get('torneos', [TorneoController::class, 'index']);
        Route::get('torneos/{id}', [TorneoController::class, 'show']);
        
        Route::get('tecnicos', [TecnicoController::class, 'index']);
        Route::get('tecnicos/{id}', [TecnicoController::class, 'show']);
        
        Route::get('fases', [FaseController::class, 'index']);
        Route::get('fases/{id}', [FaseController::class, 'show']);
        
        Route::get('partidos', [PartidoController::class, 'index']);
        Route::get('partidos/{id}', [PartidoController::class, 'show']);
    });
});
