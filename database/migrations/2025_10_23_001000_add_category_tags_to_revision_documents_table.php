<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('revision_documents', function (Blueprint $table) {
            $table->string('category')->nullable()->after('mime');
            $table->json('tags')->nullable()->after('category');
        });
    }

    public function down(): void
    {
        Schema::table('revision_documents', function (Blueprint $table) {
            $table->dropColumn(['category','tags']);
        });
    }
};
