<?php

namespace Database\Factories;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<AuditLog> */
class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'action_type' => 'test',
            'action' => 'Test action',
            'status' => 'success',
            'ip_address' => $this->faker->ipv4(),
        ];
    }
}
