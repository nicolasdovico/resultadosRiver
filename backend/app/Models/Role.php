<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Traits\UpperCaseStrings;

class Role extends Model
{
    use UpperCaseStrings;

    protected $table = 'roles';
    protected $primaryKey = 'id';
    public $timestamps = true;
    protected $guarded = [];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_role');
    }
}
