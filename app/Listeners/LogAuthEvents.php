<?php

namespace App\Listeners;

use App\Services\AuditLogger;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Validated;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Support\Facades\App;

class LogAuthEvents
{
    protected AuditLogger $logger;

    public function __construct()
    {
        $this->logger = App::make(AuditLogger::class);
    }

    public function onLogin(Login $event): void
    {
        $this->logger->log('authentication', 'Logged in', [
            'user_id' => $event->user?->getAuthIdentifier(),
            'status' => 'success',
        ], request());
    }

    public function onLogout(Logout $event): void
    {
        $this->logger->log('authentication', 'Logged out', [
            'user_id' => $event->user?->getAuthIdentifier(),
            'status' => 'success',
        ], request());
    }

    public function onFailed(Failed $event): void
    {
        $this->logger->log('authentication', 'Login failed', [
            'user_id' => $event->user?->getAuthIdentifier(),
            'status' => 'failed',
            'metadata' => ['email' => $event->credentials['email'] ?? null],
        ], request());
    }

    public function onLockout(Lockout $event): void
    {
        $this->logger->log('authentication', 'Login lockout', [
            'status' => 'failed',
            'metadata' => ['email' => $event->request->input('email')],
        ], request());
    }

    public function onPasswordReset(PasswordReset $event): void
    {
        $this->logger->log('authentication', 'Password reset', [
            'user_id' => $event->user?->getAuthIdentifier(),
            'status' => 'success',
        ], request());
    }
}
