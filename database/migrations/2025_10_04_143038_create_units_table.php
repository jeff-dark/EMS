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
        Schema::create('units', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Foreign Key to link to the 'courses' table
            // This is the critical link!
            $table->foreignId('course_id')
                  ->constrained() // This assumes the parent table is 'courses' and the key is 'id'
                  ->onDelete('cascade'); // If the course is deleted, all its units are also deleted

            // Unit Name/Title
            $table->string('title');

            // A number to define the order of the units within the course (e.g., Unit 1, Unit 2, etc.)
            $table->unsignedInteger('order')->default(1);

            // An optional description or summary of the unit
            $table->text('summary')->nullable();

            // Laravel Timestamps
            $table->timestamps();

            // Optional: Ensure the unit title is unique within a specific course
            $table->unique(['course_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
