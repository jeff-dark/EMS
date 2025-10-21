<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Send an email notification with basic de-duplication by category/target/user.
     * If queue is sync, send immediately. Otherwise, queue the mailable.
     *
     * @param string $category Logical category key, e.g., 'exam.published', 'exam.reminder.before'
     * @param string|null $targetType Eloquent model class or string
     * @param string|int|null $targetId Identifier
     * @param \Illuminate\Contracts\Mail\Mailable $mailable
     * @param string $to Recipient email
     * @param array $meta Optional metadata stored alongside
     * @param bool $dedupe Skip sending if the same category/target/user was already sent
     */
    public function sendOnce(string $category, ?string $targetType, $targetId, \Illuminate\Contracts\Mail\Mailable $mailable, string $to, array $meta = [], bool $dedupe = true): void
    {
        $userId = $meta['user_id'] ?? null;
        if ($dedupe) {
            $exists = DB::table('notification_sends')
                ->where('category', $category)
                ->where('target_type', $targetType)
                ->where('target_id', (string)($targetId ?? ''))
                ->when($userId, fn($q) => $q->where('user_id', $userId))
                ->exists();
            if ($exists) return;
        }

        if (config('queue.default') === 'sync') {
            Mail::to($to)->send($mailable);
        } else {
            Mail::to($to)->queue($mailable);
        }

        DB::table('notification_sends')->insert([
            'category' => $category,
            'target_type' => $targetType,
            'target_id' => (string)($targetId ?? ''),
            'user_id' => $userId,
            'meta' => empty($meta) ? null : json_encode($meta),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
