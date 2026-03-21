<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Gol extends Model
{
    protected $table = 'goles';
    protected $primaryKey = 'gol_id';
    public $timestamps = false;
    protected $guarded = [];

    public function jugador(): BelongsTo
    {
        return $this->belongsTo(Jugador::class, 'gol_juga', 'pl_id');
    }

    public function partido(): BelongsTo
    {
        return $this->belongsTo(Partido::class, 'gol_fecha', 'fecha');
    }
}
