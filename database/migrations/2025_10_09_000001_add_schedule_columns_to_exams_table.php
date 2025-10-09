<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            if (!Schema::hasColumn('exams', 'start_time')) {
                $table->dateTime('start_time')->nullable()->after('is_published');
            }
            if (!Schema::hasColumn('exams', 'end_time')) {
                $table->dateTime('end_time')->nullable()->after('start_time');
            }
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            if (Schema::hasColumn('exams', 'start_time')) {
                $table->dropColumn('start_time');
            }
            if (Schema::hasColumn('exams', 'end_time')) {
                $table->dropColumn('end_time');
            }
        });
    }
};
