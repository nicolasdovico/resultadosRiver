<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoGol extends Model
{
    protected $table = 'tipo_gol';
    protected $primaryKey = 'tipo_gol';
    public $timestamps = false;
    protected $guarded = [];
}
