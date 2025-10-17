<?php

namespace App\Services;

use App\Jobs\WriteAuditLog;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditLogger
{
    /**
     * Queue a log write for an action.
     *
     * @param string $actionType e.g. authentication|create|update|delete|view|config|import|export
     * @param string $action Human readable message
     * @param array<string,mixed> $context Additional context like target_type, target_id, status, before, after, metadata
     * @param Request|null $request Optional request to derive ip/method/url/ua
     */
    public function log(string $actionType, string $action, array $context = [], ?Request $request = null): void
    {
        $user = Auth::user();

        // Scrub sensitive data keys from before/after/metadata
        $sanitize = function ($data) {
            if (!is_array($data)) return null;
            $sensitive = ['password', 'password_confirmation', 'current_password', 'token', 'secret', 'otp'];
            $filtered = $data;
            foreach ($sensitive as $key) {
                if (array_key_exists($key, $filtered)) {
                    $filtered[$key] = '[REDACTED]';
                }
            }
            return $filtered;
        };

        $payload = [
            'user_id' => $context['user_id'] ?? ($user?->getAuthIdentifier()),
            'action_type' => strtolower($actionType),
            'action' => $action,
            'status' => $context['status'] ?? 'success',
            'target_type' => $context['target_type'] ?? null,
            'target_id' => (string)($context['target_id'] ?? '' ) ?: null,
            'ip_address' => $context['ip_address'] ?? $request?->ip(),
            'method' => $context['method'] ?? $request?->method(),
            'url' => $context['url'] ?? $request?->fullUrl(),
            'user_agent' => $context['user_agent'] ?? $request?->userAgent(),
            'before' => $sanitize($context['before'] ?? null),
            'after' => $sanitize($context['after'] ?? null),
            'metadata' => $sanitize($context['metadata'] ?? null),
        ];

        WriteAuditLog::dispatch($payload);
    }
}
