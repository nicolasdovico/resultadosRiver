<?php

namespace App\Models;

use App\Traits\UpperCaseStrings;
use Illuminate\Database\Eloquent\Model;

class Condicion extends Model
{
    use UpperCaseStrings;

    protected $table = 'condicion';
    protected $primaryKey = 'id_condicion';
    public $timestamps = false;
    protected $guarded = [];
}
