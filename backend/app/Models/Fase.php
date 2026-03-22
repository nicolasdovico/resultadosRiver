<?php

namespace App\Models;

use App\Traits\UpperCaseStrings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fase extends Model
{
    use UpperCaseStrings;

    protected $table = 'fases';
    protected $primaryKey = 'id_fase';
    public $timestamps = false;
    protected $guarded = [];

    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class, 'fase', 'id_fase');
    }
}
