<?php

declare(strict_types=1);

namespace Modules\Announcements\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Announcements\Enums\AnnouncementCategory;
use Modules\Announcements\Enums\AnnouncementPriority;
use Modules\Announcements\Enums\AudienceType;
use Modules\Announcements\Models\Announcement;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        Announcement::query()->delete();

        $examples = [
            [
                'key' => 'imam-day-2027',
                'category' => AnnouncementCategory::EVENT,
                'priority' => AnnouncementPriority::HIGH,
                'action_url' => '/fr/evenements/imam-day',
                'title' => [
                    'fr' => 'Imam Day — 24 janvier 2027',
                    'en' => 'Imam Day — 24 January 2027',
                    'ar' => 'يوم الإمام — 24 يناير 2027',
                ],
                'message' => [
                    'fr' => 'Rendez-vous à l’Hôtel King Fahd Palace, Dakar, pour la Journée internationale de l’Imam Cheikh Tidiane Cissé.',
                    'en' => 'Join us at the King Fahd Palace Hotel, Dakar, for the International Day of Imam Cheikh Tidiane Cissé.',
                    'ar' => 'الموعد بفندق قصر الملك فهد في دكار لليوم الدولي للإمام الشيخ تجاني سيسي.',
                ],
            ],
            [
                'key' => 'rejoindre-mouvement',
                'category' => AnnouncementCategory::CENTER,
                'priority' => AnnouncementPriority::NORMAL,
                'action_url' => '/fr/rejoindre',
                'title' => [
                    'fr' => 'Rejoindre le mouvement',
                    'en' => 'Join the movement',
                    'ar' => 'الانضمام إلى الحركة',
                ],
                'message' => [
                    'fr' => 'Jeunesse, transmission, service et unité de la Fayda : choisissez votre section.',
                    'en' => 'Youth, transmission, service and Fayda unity: choose your section.',
                    'ar' => 'الشباب والنقل والخدمة ووحدة الفيضة: اختر قسمك.',
                ],
            ],
            [
                'key' => 'soutenir',
                'category' => AnnouncementCategory::CENTER,
                'priority' => AnnouncementPriority::NORMAL,
                'action_url' => '/fr/soutien',
                'title' => [
                    'fr' => 'Soutenir Jiloul Jadid',
                    'en' => 'Support Jiloul Jadid',
                    'ar' => 'دعم الجيل الجديد',
                ],
                'message' => [
                    'fr' => 'Votre contribution aide le mouvement à accompagner la nouvelle génération.',
                    'en' => 'Your contribution helps the movement accompany the new generation.',
                    'ar' => 'مساهمتك تساعد الحركة على مواكبة الجيل الجديد.',
                ],
            ],
        ];

        foreach ($examples as $example) {
            $announcement = new Announcement();
            $announcement->setTranslations('title', $example['title']);
            $announcement->setTranslations('message', $example['message']);
            $announcement->category = $example['category'];
            $announcement->priority = $example['priority'];
            $announcement->is_active = true;
            $announcement->action_url = $example['action_url'];
            $announcement->metadata = ['example' => $example['key']];
            $announcement->starts_at = now()->subDay();
            $announcement->save();

            $announcement->audiences()->create([
                'type' => AudienceType::PUBLIC,
                'target_id' => null,
            ]);
        }

        $this->command?->info('✅ Annonces Jiloul Jadid.');
    }
}
