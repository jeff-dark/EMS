<?php

namespace Tests\Feature;

use App\Models\{AuditLog, Role, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogsTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_view_logs(): void
    {
    /** @var \App\Models\User $user */
    $user = User::factory()->create();
    $this->be($user); // authenticate as this user
        $response = $this->get('/admin/logs/export');
        $response->assertStatus(403);
    }

    public function test_admin_can_view_logs(): void
    {
    $adminRole = Role::factory()->create(['name' => 'Admin']);
    /** @var \App\Models\User $admin */
    $admin = User::factory()->create(['role_id' => $adminRole->id]);
        AuditLog::factory()->count(3)->create();
        $this->be($admin);
        $response = $this->get('/admin/logs/export');
        $response->assertStatus(200);
    }
}
