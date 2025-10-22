<?php

return [
    // Master toggle
    'enabled' => env('PROCTORING_ENABLED', true),

    // Client-side features
    'fullscreen_required' => env('PROCTORING_FULLSCREEN', true),
    'block_contextmenu' => env('PROCTORING_BLOCK_CONTEXTMENU', true),
    'block_clipboard' => env('PROCTORING_BLOCK_CLIPBOARD', true),
    'block_shortcuts' => env('PROCTORING_BLOCK_SHORTCUTS', true),
    'warn_on_violation' => env('PROCTORING_WARN_ON_VIOLATION', true),

    // Auto-submit after N violations (0 to disable)
    'violation_threshold' => (int) env('PROCTORING_VIOLATION_THRESHOLD', 2),

    // Which violation event types count toward the threshold
    // Example values emitted by the client: exited_fullscreen, tab_hidden, window_blur, devtool_open
    'counting_types' => explode(',', env('PROCTORING_COUNTING_TYPES', 'exited_fullscreen,tab_hidden')),

    // Optional integrations
    'disable_devtool' => env('PROCTORING_DISABLE_DEVTOOL', true),
    'nosleep' => env('PROCTORING_NOSLEEP', true),
];
