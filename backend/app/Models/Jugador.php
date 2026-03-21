<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jugador extends Model
{
    protected $table = 'players';
    protected $primaryKey = 'pl_id';
    public $timestamps = false;
    protected $guarded = [];

    public function goles(): HasMany
    {
        return $this->hasMany(Gol::class, 'gol_juga', 'pl_id');
    }
}
