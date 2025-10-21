<?php

namespace App\Listeners;

use App\Services\AuditLogger;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Validated;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Support\Facades\App;
use Laravel\Fortify\Events\TwoFactorAuthenticationEnabled;
use Laravel\Fortify\Events\TwoFactorAuthenticationDisabled;
use Laravel\Fortify\Events\TwoFactorAuthenticationConfirmed;
use Laravel\Fortify\Events\TwoFactorAuthenticationChallenged;
use Laravel\Fortify\Events\TwoFactorAuthenticationFailed;
use Laravel\Fortify\Events\ValidTwoFactorAuthenticationCodeProvided;
use Laravel\Fortify\Events\RecoveryCodesGenerated;
use Laravel\Fortify\Events\RecoveryCodeReplaced;
use Illuminate\Support\Facades\Mail;
use App\Mail\TwoFactorStatusMail;

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

    public function onRegistered(Registered $event): void
    {
        $this->logger->log('authentication', 'User registered', [
            'user_id' => method_exists($event->user, 'getAuthIdentifier') ? $event->user->getAuthIdentifier() : null,
            'status' => 'success',
        ], request());
    }

    // Fortify two-factor events
    public function onTwoFactorEnabled(TwoFactorAuthenticationEnabled $event): void
    {
        $this->logger->log('authentication', 'Two-factor enabled', [
            'user_id' => $event->user->getAuthIdentifier(),
            'status' => 'success',
        ], request());
        try { if ($event->user->email) Mail::to($event->user->email)->queue(new TwoFactorStatusMail($event->user, 'enabled')); } catch (\Throwable $e) {}
    }

    public function onTwoFactorDisabled(TwoFactorAuthenticationDisabled $event): void
    {
        $this->logger->log('authentication', 'Two-factor disabled', [
            'user_id' => $event->user->getAuthIdentifier(),
            'status' => 'success',
        ], request());
        try { if ($event->user->email) Mail::to($event->user->email)->queue(new TwoFactorStatusMail($event->user, 'disabled')); } catch (\Throwable $e) {}
    }

    public function onTwoFactorConfirmed(TwoFactorAuthenticationConfirmed $event): void
    {
        $this->logger->log('authentication', 'Two-factor confirmed', [
            'user_id' => $event->user->getAuthIdentifier(),
            'status' => 'success',
        ], request());
        try { if ($event->user->email) Mail::to($event->user->email)->queue(new TwoFactorStatusMail($event->user, 'confirmed')); } catch (\Throwable $e) {}
    }

    public function onTwoFactorChallenged(TwoFactorAuthenticationChallenged $event): void
    {
        $this->logger->log('authentication', 'Two-factor challenged', [
            'user_id' => $event->user->getAuthIdentifier(),
            'status' => 'success',
        ], request());
    }

    public function onTwoFactorFailed(TwoFactorAuthenticationFailed $event): void
    {
        $this->logger->log('authentication', 'Two-factor failed', [
            'user_id' => $event->user->getAuthIdentifier(),
            'status' => 'failed',
        ], request());
        try { if ($event->user->email) Mail::to($event->user->email)->queue(new TwoFactorStatusMail($event->user, 'failed')); } catch (\Throwable $e) {}
    }

    public function onTwoFactorVerified(ValidTwoFactorAuthenticationCodeProvided $event): void
    {
        $this->logger->log('authentication', 'Two-factor verified', [
            'user_id' => $event->user->getAuthIdentifier(),
            'status' => 'success',
        ], request());
        try { if ($event->user->email) Mail::to($event->user->email)->queue(new TwoFactorStatusMail($event->user, 'verified')); } catch (\Throwable $e) {}
    }

    public function onTwoFactorRecoveryCodesGenerated(RecoveryCodesGenerated $event): void
    {
        $this->logger->log('authentication', 'Two-factor recovery codes generated', [
            'user_id' => $event->user->getAuthIdentifier(),
            'status' => 'success',
        ], request());
    }

    public function onTwoFactorRecoveryCodeReplaced(RecoveryCodeReplaced $event): void
    {
        $this->logger->log('authentication', 'Two-factor recovery code replaced', [
            'user_id' => $event->user->getAuthIdentifier(),
            'status' => 'success',
        ], request());
    }
}
