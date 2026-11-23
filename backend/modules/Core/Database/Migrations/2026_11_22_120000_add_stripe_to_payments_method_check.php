<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('payments')) {
            return;
        }

        // PostgreSQL : élargir le check des méthodes pour Stripe.
        DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check');
        DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_method_check CHECK (method IN ('wave', 'orange_money', 'cash', 'bank_transfer', 'stripe'))");
    }

    public function down(): void
    {
        if (!Schema::hasTable('payments')) {
            return;
        }

        DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check');
        DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_method_check CHECK (method IN ('wave', 'orange_money', 'cash', 'bank_transfer'))");
    }
};
