<?php

return [
    // Apply CORS to API routes and Sanctum CSRF endpoint
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Allow Vite dev server
    'allowed_origins' => ['http://localhost:3000'],

    'allowed_origins_patterns' => [],

    // Allow common headers and XSRF header
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Required for cookie-based auth
    'supports_credentials' => true,
];