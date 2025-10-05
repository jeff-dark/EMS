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
        Schema::create('exams', function (Blueprint $table) {
            // Primary Key
            $table->id();
            
            // Foreign Key: Links the exam to its parent unit
            $table->foreignId('unit_id')
                  ->constrained() // Automatically links to the 'units' table's 'id'
                  ->onDelete('cascade'); // If a unit is deleted, all its exams are deleted
            
            // Exam Title
            $table->string('title');
            
            // Time limit for the exam in minutes
            $table->unsignedSmallInteger('duration_minutes');
            
            // Minimum score (as a percentage) required to pass the exam
            $table->decimal('passing_score', 5, 2)->default(70.00); 
            
            // Status flag: determines if the exam is visible to students
            $table->boolean('is_published')->default(false); 

            // Laravel Timestamps
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};