<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting value.
     */
    public static function set(string $key, ?string $value)
    {
        return static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /**
     * Helper to get the absolute URL if the setting is a file.
     */
    public static function getUrl(string $key, $default = null): ?string
    {
        $value = static::get($key);
        if (!$value) {
            return $default;
        }

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        $url = Storage::disk('public')->url($value);

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
                $url = $protocol . $host . '/storage/' . $value;
            }
        }

        return $url;
    }
}
