<?php

namespace App\Models;

use App\Traits\UpperCaseStrings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tecnico extends Model
{
    use UpperCaseStrings;

    protected $table = 'tecnicos';
    protected $primaryKey = 'id_tecnicos';
    public $timestamps = false;
    protected $guarded = [];
    protected $fillable = ['id_tecnicos', 'tec_ape_nom', 'tec_foto'];

    public function ciclos(): HasMany
    {
        return $this->hasMany(TecnicoCiclo::class, 'tecnico_id', 'id_tecnicos')->orderBy('desde', 'asc');
    }

    public function getDesdeAttribute(): ?string
    {
        return $this->ciclos->min('desde');
    }

    public function getHastaAttribute(): ?string
    {
        $hasActive = $this->ciclos->contains(fn($c) => is_null($c->hasta));
        if ($hasActive) {
            return null;
        }
        return $this->ciclos->max('hasta');
    }

    public function getCargoAttribute(): string
    {
        $latestCiclo = $this->ciclos->sortByDesc('desde')->first();
        return $latestCiclo ? trim($latestCiclo->cargo) : 'TITULAR';
    }

    /**
     * Get partidos query for a specific cycle or all cycles combined.
     */
    public function getPartidosQuery(?int $cicloId = null)
    {
        if ($cicloId !== null) {
            $ciclo = $this->ciclos->firstWhere('id', $cicloId) ?? TecnicoCiclo::find($cicloId);
            if ($ciclo) {
                return $ciclo->getPartidosQuery();
            }
        }

        $ciclos = $this->ciclos;
        if ($ciclos->isEmpty()) {
            return Partido::query()->whereRaw('1 = 0');
        }

        return Partido::query()->where(function ($q) use ($ciclos) {
            foreach ($ciclos as $c) {
                $q->orWhere(function ($sub) use ($c) {
                    $sub->where('fecha', '>=', $c->desde);
                    if ($c->hasta) {
                        $sub->where('fecha', '<=', $c->hasta);
                    }
                });
            }
        });
    }

    /**
     * Get aggregate statistics for all cycles of the technical director.
     */
    public function getStatsAttribute(): array
    {
        $partidos = $this->getPartidosQuery()->get();
        
        $pj = $partidos->count();
        $pg = 0;
        $pe = 0;
        $pp = 0;
        $gf = 0;
        $gc = 0;

        foreach ($partidos as $partido) {
            $golesRiver = $partido->go_ri;
            $golesRival = $partido->go_ad;

            $gf += $golesRiver;
            $gc += $golesRival;

            if ($golesRiver > $golesRival) {
                $pg++;
            } elseif ($golesRiver < $golesRival) {
                $pp++;
            } else {
                $pe++;
            }
        }

        $puntos = ($pg * 3) + $pe;
        $efectividad = $pj > 0 ? round(($puntos / ($pj * 3)) * 100, 2) : 0;

        return [
            'pj' => $pj,
            'pg' => $pg,
            'pe' => $pe,
            'pp' => $pp,
            'gf' => $gf,
            'gc' => $gc,
            'dg' => $gf - $gc,
            'puntos' => $puntos,
            'efectividad' => $efectividad,
        ];
    }

    public static function getForFecha($fecha)
    {
        return TecnicoCiclo::getForFecha($fecha)?->tecnico;
    }
}
