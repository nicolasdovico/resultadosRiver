<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Traits\UpperCaseStrings;

class Permission extends Model
{
    use UpperCaseStrings;

    protected $table = 'permissions';
    protected $primaryKey = 'id';
    public $timestamps = true;
    protected $guarded = [];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permission');
    }
}
