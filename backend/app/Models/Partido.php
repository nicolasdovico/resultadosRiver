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
        'fecha' => 'string',
    ];

    protected $appends = ['resultado'];

    public function getResultadoAttribute(): string
    {
        if (!isset($this->go_ri) || !isset($this->go_ad)) {
            return '';
        }
        if ($this->go_ri > $this->go_ad) return 'G';
        if ($this->go_ri < $this->go_ad) return 'P';
        return 'E';
    }

    public function torneo_rel(): BelongsTo
    {
        return $this->belongsTo(Torneo::class, 'torneo', 'tor_id');
    }

    public function torneo(): BelongsTo
    {
        return $this->torneo_rel();
    }

    public function rival(): BelongsTo
    {
        return $this->belongsTo(Rival::class, 'adversario', 'ri_id');
    }

    public function arbitro_rel(): BelongsTo
    {
        return $this->belongsTo(Arbitro::class, 'arbitro', 'ar_id');
    }

    public function arbitro(): BelongsTo
    {
        return $this->arbitro_rel();
    }

    public function estadio_rel(): BelongsTo
    {
        return $this->belongsTo(Estadio::class, 'estadio', 'es_id');
    }

    public function estadio(): BelongsTo
    {
        return $this->estadio_rel();
    }

    public function condicion_rel(): BelongsTo
    {
        return $this->belongsTo(Condicion::class, 'condicion', 'id_condicion');
    }

    public function condicion(): BelongsTo
    {
        return $this->condicion_rel();
    }

    public function fase_rel(): BelongsTo
    {
        return $this->belongsTo(Fase::class, 'fase', 'id_fase');
    }

    public function fase(): BelongsTo
    {
        return $this->fase_rel();
    }

    public function getTecnicoAttribute()
    {
        return Tecnico::getForFecha($this->fecha);
    }

    public function getCicloAttribute()
    {
        return TecnicoCiclo::getForFecha($this->fecha);
    }

    public function goles(): HasMany
    {
        return $this->hasMany(Gol::class, 'gol_fecha', 'fecha')->orderBy('periodo')->orderBy('minutos');
    }
}
