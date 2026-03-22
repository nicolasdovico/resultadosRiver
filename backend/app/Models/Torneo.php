<?php

namespace App\Models;

use App\Traits\UpperCaseStrings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Torneo extends Model
{
    use UpperCaseStrings;

    protected $table = 'torneos';
    protected $primaryKey = 'tor_id';
    public $timestamps = false;
    protected $guarded = [];

    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class, 'torneo', 'tor_id');
    }
}
