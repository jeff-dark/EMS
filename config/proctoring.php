<?php

return [
    // Master toggle
    'enabled' => env('PROCTORING_ENABLED', true),

    // Client-side features
    'fullscreen_required' => env('PROCTORING_FULLSCREEN', true),
    'block_contextmenu' => env('PROCTORING_BLOCK_CONTEXTMENU', true),
    'block_clipboard' => env('PROCTORING_BLOCK_CLIPBOARD', true),
    'block_shortcuts' => env('PROCTORING_BLOCK_SHORTCUTS', true),
    // Show UI warnings to students on violations (disabled to auto-submit silently)
    'warn_on_violation' => env('PROCTORING_WARN_ON_VIOLATION', false),

    // Auto-submit after N violations (0 to disable)
    // Auto-submit after N violations (1 = immediate submit on first violation)
    'violation_threshold' => (int) env('PROCTORING_VIOLATION_THRESHOLD', 1),

    // Which violation event types count toward the threshold
    // Example values emitted by the client: exited_fullscreen, tab_hidden, window_blur, devtool_open
    // If empty, all violation types will count toward the threshold
    'counting_types' => array_values(array_filter(array_map('trim', explode(',', (string) env('PROCTORING_COUNTING_TYPES', ''))))),

    // Optional integrations
    'disable_devtool' => env('PROCTORING_DISABLE_DEVTOOL', true),
    'nosleep' => env('PROCTORING_NOSLEEP', true),
];
