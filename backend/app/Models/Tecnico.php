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
    protected $fillable = ['tec_ape_nom', 'desde', 'hasta', 'cargo', 'tec_foto'];

    public function getPartidosQuery()
    {
        $query = Partido::query()
            ->where('fecha', '>=', $this->desde);

        if ($this->hasta) {
            $query->where('fecha', '<=', $this->hasta);
        }

        return $query;
    }

    /**
     * Get aggregate statistics for the technical director's cycle.
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
        static $tecnicos = null;

        if ($tecnicos === null) {
            $tecnicos = self::all();
        }

        return $tecnicos->first(function ($tecnico) use ($fecha) {
            $desde = $tecnico->desde;
            $hasta = $tecnico->hasta ?? '9999-12-31';

            return $fecha >= $desde && $fecha <= $hasta;
        });
    }
}
