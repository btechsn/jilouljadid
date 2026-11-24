<?php

namespace Modules\Live\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Live\Models\LiveStream;

/**
 * Pas de directs fictifs : le site affiche « Pas encore de direct » tant qu'aucun flux n'est publié.
 */
class LiveStreamSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(LiveChannelSeeder::class);

        LiveStream::query()->forceDelete();

        $this->command?->info('✅ Directs demo supprimés — ajoute un direct réel depuis l’admin.');
    }
}
