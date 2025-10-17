<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action_type', 50); // authentication, create, update, delete, view, config, import, export
            $table->string('action', 255); // human readable summary
            $table->string('status', 50)->default('success'); // success, failed, denied
            $table->string('target_type', 120)->nullable();
            $table->string('target_id', 120)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('method', 10)->nullable();
            $table->text('url')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('before')->nullable();
            $table->json('after')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'action_type']);
            $table->index(['target_type', 'target_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
