<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('revision_documents', function (Blueprint $table) {
            if (Schema::hasColumn('revision_documents', 'tags')) {
                $table->dropColumn('tags');
            }
            if (Schema::hasColumn('revision_documents', 'category')) {
                $table->dropColumn('category');
            }
        });
    }

    public function down(): void
    {
        Schema::table('revision_documents', function (Blueprint $table) {
            if (!Schema::hasColumn('revision_documents', 'category')) {
                $table->string('category')->nullable()->after('mime');
            }
            if (!Schema::hasColumn('revision_documents', 'tags')) {
                $table->json('tags')->nullable()->after('category');
            }
        });
    }
};
