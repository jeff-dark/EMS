<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            // Primary Key: Auto-incrementing unsigned big integer
            $table->id();
            
            // Course Name: String, required, and unique (for easy lookup)
            $table->string('name')->unique();
            
            // Course Description: Text, nullable (optional)
            $table->text('description')->nullable();
            
            // Laravel Timestamps (created_at and updated_at)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};