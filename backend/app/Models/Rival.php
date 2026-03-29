<?php

namespace App\Models;

use App\Traits\UpperCaseStrings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Rival extends Model
{
    use UpperCaseStrings;

    protected $table = 'rivales';

    protected $primaryKey = 'ri_id';

    public $timestamps = false;

    protected $guarded = [];

    protected $appends = ['escudo_url'];

    protected static function booted(): void
    {
        static::updating(function (Rival $rival) {
            if ($rival->isDirty('escudo')) {
                $previous = $rival->getOriginal('escudo');
                if ($previous && Storage::disk('public')->exists($previous)) {
                    Storage::disk('public')->delete($previous);
                }
            }
        });

        static::deleting(function (Rival $rival) {
            if ($rival->escudo && Storage::disk('public')->exists($rival->escudo)) {
                Storage::disk('public')->delete($rival->escudo);
            }
        });
    }

    public function getEscudoUrlAttribute(): ?string
    {
        if (! $this->escudo) {
            return null;
        }

        if (filter_var($this->escudo, FILTER_VALIDATE_URL)) {
            return $this->escudo;
        }

        // Use Storage::url() but force it to be absolute if it's not
        $url = Storage::disk('public')->url($this->escudo);

        if (!str_starts_with($url, 'http')) {
            $url = config('app.url') . $url;
        }

        // Handle localhost/127.0.0.1 for mobile devices by using the request host
        // But DON'T use the internal docker 'backend' host which is unreachable from outside
        if (str_contains($url, 'localhost') || str_contains($url, '127.0.0.1')) {
            $request = request();
            $host = $request ? $request->getHttpHost() : null;
            if ($host && !in_array($host, ['backend', 'localhost', '127.0.0.1', 'localhost:8000'])) {
                $protocol = $request->secure() ? 'https://' : 'http://';
                $url = $protocol . $host . '/storage/' . $this->escudo;
            }
        }

        return $url;
    }

    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class, 'adversario', 'ri_id');
    }
}
