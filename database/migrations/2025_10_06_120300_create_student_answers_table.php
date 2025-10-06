<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('question_id')->constrained()->onDelete('cascade');
            // Student submitted answer text (subjective)
            $table->text('answer_text')->nullable();
            // Points awarded by teacher for this question
            $table->decimal('points_awarded', 8, 2)->nullable();
            // Any teacher comments
            $table->text('comments')->nullable();
            $table->timestamps();

            $table->unique(['exam_session_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_answers');
    }
};
