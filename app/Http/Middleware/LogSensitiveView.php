<?php

namespace App\Http\Middleware;

use App\Services\AuditLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogSensitiveView
{
    public function __construct(private AuditLogger $logger)
    {
    }

    public function handle(Request $request, Closure $next, string $action = 'view'): Response
    {
        $response = $next($request);

        // Build target from route params if available
        $route = $request->route();
        $params = $route?->parameters() ?? [];
        $targetType = null; $targetId = null;
        foreach ($params as $key => $value) {
            if (is_object($value) && method_exists($value, 'getKey')) {
                $targetType = get_class($value);
                $targetId = (string)$value->getKey();
                break;
            }
            if (is_scalar($value)) {
                $targetType = $key;
                $targetId = (string)$value;
                break;
            }
        }

        $this->logger->log($action, 'Viewed sensitive resource', [
            'target_type' => $targetType,
            'target_id' => $targetId,
            'status' => method_exists($response, 'isSuccessful') && $response->isSuccessful() ? 'success' : 'failed',
        ], $request);

        return $response;
    }
}
