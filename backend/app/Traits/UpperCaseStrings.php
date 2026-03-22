<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;

trait UpperCaseStrings
{
    /**
     * Boot the UpperCaseStrings trait.
     */
    protected static function bootUpperCaseStrings(): void
    {
        static::saving(function (Model $model) {
            foreach ($model->getAttributes() as $key => $value) {
                // If it's a string and should be upper cased, do it
                if (is_string($value) && $model->shouldBeUpperCased($key, $value)) {
                    $model->{$key} = mb_strtoupper($value, 'UTF-8');
                }
            }
        });
    }

    /**
     * Determine if an attribute should be upper cased.
     */
    protected function shouldBeUpperCased(string $key, mixed $value): bool
    {
        $dontUpperCaseKeys = [
            'email',
            'password',
            'remember_token',
            'token',
            'secret',
            'api_token',
            'id',
            'ar_id', 'es_id', 'pl_id', 'ri_id', 'tor_id', 'id_condicion', 'id_fase',
            'fecha',
            'created_at',
            'updated_at',
            'deleted_at',
            'email_verified_at',
        ];

        // Skip if in the skip list or hidden
        if (in_array($key, $dontUpperCaseKeys) || in_array($key, $this->getHidden())) {
            return false;
        }

        // Skip if it's a numeric string (like an ID or a goal count)
        if (is_numeric($value)) {
            return false;
        }

        return true;
    }
}
