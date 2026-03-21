<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Arbitro extends Model
{
    protected $table = 'arbitros';
    protected $primaryKey = 'ar_id';
    public $timestamps = false;
    protected $guarded = [];

    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class, 'arbitro', 'ar_id');
    }
}
