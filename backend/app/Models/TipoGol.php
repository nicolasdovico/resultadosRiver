<?php

namespace App\Models;

use App\Traits\UpperCaseStrings;
use Illuminate\Database\Eloquent\Model;

class TipoGol extends Model
{
    use UpperCaseStrings;

    protected $table = 'tipo_gol';
    protected $primaryKey = 'tipo_gol';
    public $timestamps = false;
    protected $guarded = [];
}
