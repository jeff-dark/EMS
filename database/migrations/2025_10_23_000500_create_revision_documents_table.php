<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('revision_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path'); // relative to public disk
            $table->string('original_name');
            $table->unsignedBigInteger('file_size');
            $table->string('mime')->default('application/pdf');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revision_documents');
    }
};
