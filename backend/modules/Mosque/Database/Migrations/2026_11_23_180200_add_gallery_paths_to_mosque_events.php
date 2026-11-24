<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mosque_events', function (Blueprint $table) {
            if (! Schema::hasColumn('mosque_events', 'gallery_paths')) {
                $table->json('gallery_paths')->nullable()->after('cover_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('mosque_events', function (Blueprint $table) {
            if (Schema::hasColumn('mosque_events', 'gallery_paths')) {
                $table->dropColumn('gallery_paths');
            }
        });
    }
};
