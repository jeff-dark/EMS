<?php

namespace App\Observers;

use App\Observers\Concerns\LogsChanges;
use Illuminate\Database\Eloquent\Model;

class GenericCrudObserver
{
    use LogsChanges;

    public function created(Model $model): void
    {
        $this->logger()->log('create', 'Created '.class_basename($model)." #{$model->getKey()}", [
            ...$this->target($model),
            'after' => $this->after($model),
        ], request());
    }

    public function updated(Model $model): void
    {
        $changes = $model->getChanges();
        // remove timestamps-only noise
        unset($changes['updated_at']);
        if (empty($changes)) return;
        $this->logger()->log('update', 'Updated '.class_basename($model)." #{$model->getKey()}", [
            ...$this->target($model),
            'before' => array_intersect_key($this->before($model), $changes),
            'after' => $changes,
        ], request());
    }

    public function deleted(Model $model): void
    {
        $this->logger()->log('delete', 'Deleted '.class_basename($model)." #{$model->getKey()}", [
            ...$this->target($model),
            'before' => $this->before($model),
        ], request());
    }
}
