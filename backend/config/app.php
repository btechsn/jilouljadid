<?php

return [
    'name' => env('APP_NAME', 'Jiloul Jadid'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'https://jilouljadid.com'),
    'frontend_url' => env('FRONTEND_URL', 'https://jilouljadid.com'),
    'timezone' => 'Africa/Dakar',
    'locale' => env('APP_LOCALE', 'fr'),
    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'fr'),
    'faker_locale' => 'fr_FR',
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY'),
    'previous_keys' => [
        ...array_filter(explode(',', env('APP_PREVIOUS_KEYS', ''))),
    ],
    'maintenance' => [
        'driver' => 'file',
    ],
];
