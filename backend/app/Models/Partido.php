<?php

namespace App\Models;

use App\Traits\UpperCaseStrings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Partido extends Model
{
    use UpperCaseStrings;

    protected $table = 'estadisticas';
    protected $primaryKey = 'fecha';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function torneo_rel(): BelongsTo
    {
        return $this->belongsTo(Torneo::class, 'torneo', 'tor_id');
    }

    public function rival(): BelongsTo
    {
        return $this->belongsTo(Rival::class, 'adversario', 'ri_id');
    }

    public function arbitro_rel(): BelongsTo
    {
        return $this->belongsTo(Arbitro::class, 'arbitro', 'ar_id');
    }

    public function estadio_rel(): BelongsTo
    {
        return $this->belongsTo(Estadio::class, 'estadio', 'es_id');
    }

    public function condicion_rel(): BelongsTo
    {
        return $this->belongsTo(Condicion::class, 'condicion', 'id_condicion');
    }

    public function fase_rel(): BelongsTo
    {
        return $this->belongsTo(Fase::class, 'fase', 'id_fase');
    }

    public function goles(): HasMany
    {
        return $this->hasMany(Gol::class, 'gol_fecha', 'fecha')->orderBy('periodo')->orderBy('minutos');
    }
}
