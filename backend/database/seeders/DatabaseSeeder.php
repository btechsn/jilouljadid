<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Core\Enums\OrganizationType;
use Modules\Core\Models\Organization;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🌱 Seeding Jiloul Jadid...');

        $this->command->info('1️⃣  Organisation...');
        $org = Organization::query()->firstOrNew(['slug' => 'nujum-al-huda']);
        $org->type = OrganizationType::CENTER;
        $org->email = 'Jilouljadid1@gmail.com';
        $org->phone = '+221771234567';
        $org->address = 'Dakar, Dakar';
        $org->latitude = 14.7437965;
        $org->longitude = -17.4674915;
        $org->city = 'Dakar';
        $org->country = 'SN';
        $org->website = 'https://jilouljadid.com';
        $org->is_active = true;
        $org->setTranslations('name', [
            'fr' => 'Jiloul Jadid',
            'en' => 'Jiloul Jadid',
            'ar' => 'مركز الجيل الجديد',
        ]);
        $org->save();

        $this->command->info('2️⃣  Admin...');
        $this->call(RoleAccountsSeeder::class);

        $this->command->info('3️⃣  Événements (alignés site)...');
        $this->call(\Modules\Mosque\Database\Seeders\EventSeeder::class);

        $this->command->info('4️⃣  Annonces...');
        $this->call(\Modules\Announcements\Database\Seeders\AnnouncementSeeder::class);

        $this->command->info('5️⃣  Direct + réseaux sociaux...');
        $this->call(\Modules\Live\Database\Seeders\LiveStreamSeeder::class);
        $this->call(\Modules\Live\Database\Seeders\SocialAccountSeeder::class);

        $this->command->info('6️⃣  Sections...');
        $this->call(\Modules\Dahira\Database\Seeders\DahiraSeeder::class);

        $this->command->info('7️⃣  Communauté (FAQ légère)...');
        $this->call(\Modules\Community\Database\Seeders\CommunitySeeder::class);

        $this->command->newLine();
        $this->command->info('🎉 Seeding terminé.');
        $this->command->info('   Email    : admin@jilouljadid.com');
        $this->command->info('   Password : password');
        $this->command->info('   URL Admin: /jj/administration');
    }
}
