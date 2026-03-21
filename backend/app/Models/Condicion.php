<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Condicion extends Model
{
    protected $table = 'condicion';
    protected $primaryKey = 'id_condicion';
    public $timestamps = false;
    protected $guarded = [];
}
