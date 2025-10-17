<?php

return [
    // How long to keep logs (in days).
    'retention_days' => 365,
    // Write logs synchronously by default so they work without a queue worker.
    // Set to false when you enable a queue worker for better latency.
    'force_sync' => true,
];
