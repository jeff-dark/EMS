<?php

namespace App\Observers\Concerns;

use App\Services\AuditLogger;
use Illuminate\Contracts\Container\Container;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Request;

trait LogsChanges
{
    protected function logger(): AuditLogger
    {
        return App::make(AuditLogger::class);
    }

    protected function target(Model $model): array
    {
        return [
            'target_type' => get_class($model),
            'target_id' => (string)$model->getKey(),
        ];
    }

    protected function before(Model $model): array
    {
        return $model->getOriginal();
    }

    protected function after(Model $model): array
    {
        return $model->getAttributes();
    }
}
