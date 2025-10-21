<?php

namespace App\Observers;

use App\Mail\AccountDeletedMail;
use App\Mail\UserRegisteredMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    public function created(User $user): void
    {
        if (!$user->email) return;
        try {
            if (config('queue.default') === 'sync') {
                Mail::to($user->email)->send(new UserRegisteredMail($user));
            } else {
                Mail::to($user->email)->queue(new UserRegisteredMail($user));
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch welcome email', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function deleted(User $user): void
    {
        if (!$user->email) return;
        // Use name because after delete, some attributes may be unavailable in certain drivers
        try {
            if (config('queue.default') === 'sync') {
                Mail::to($user->email)->send(new AccountDeletedMail($user->name ?? 'User'));
            } else {
                Mail::to($user->email)->queue(new AccountDeletedMail($user->name ?? 'User'));
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch account deletion email', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
