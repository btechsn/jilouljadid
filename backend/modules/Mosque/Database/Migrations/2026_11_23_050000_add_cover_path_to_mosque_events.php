<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mosque_events', function (Blueprint $table) {
            if (! Schema::hasColumn('mosque_events', 'cover_path')) {
                $table->string('cover_path')->nullable()->after('image_media_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('mosque_events', function (Blueprint $table) {
            if (Schema::hasColumn('mosque_events', 'cover_path')) {
                $table->dropColumn('cover_path');
            }
        });
    }
};
