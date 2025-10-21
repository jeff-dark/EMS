<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_sends', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // e.g., exam.reminder.before, exam.published
            $table->string('target_type')->nullable();
            $table->string('target_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->index(['category','target_type','target_id','user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_sends');
    }
};
