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

    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class, 'tecnico', 'id_tecnicos');
    }
}
