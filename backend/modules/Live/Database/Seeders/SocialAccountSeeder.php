<?php

namespace Modules\Live\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Live\Models\SocialAccount;

class SocialAccountSeeder extends Seeder
{
    public function run(): void
    {
        // Retire les anciens comptes Nujum
        SocialAccount::query()->delete();

        $accounts = [
            [
                'platform' => 'youtube',
                'handle' => '@jilouljadid',
                'url' => 'https://www.youtube.com/@jilouljadid',
                'embed_url' => null,
                'redirect_only' => false,
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'platform' => 'facebook',
                'handle' => 'jilouljadid',
                'url' => 'https://www.facebook.com/jilouljadid',
                'embed_url' => null,
                'redirect_only' => false,
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'platform' => 'instagram',
                'handle' => '@jilouljadid',
                'url' => 'https://www.instagram.com/jilouljadid',
                'embed_url' => null,
                'redirect_only' => true,
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'platform' => 'tiktok',
                'handle' => '@jilouljadid',
                'url' => 'https://www.tiktok.com/@jilouljadid',
                'embed_url' => null,
                'redirect_only' => true,
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($accounts as $row) {
            SocialAccount::updateOrCreate(
                ['platform' => $row['platform']],
                $row,
            );
        }

        $this->command?->info('✅ Comptes sociaux Jiloul Jadid (à vérifier / corriger les URLs réelles).');
    }
}
