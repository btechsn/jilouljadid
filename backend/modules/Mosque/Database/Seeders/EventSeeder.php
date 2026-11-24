<?php

namespace Modules\Mosque\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Modules\Core\Models\Organization;
use Modules\Mosque\Models\MosqueEvent;

/**
 * Aligne les événements admin sur ceux du site (jiloul-events.ts).
 */
class EventSeeder extends Seeder
{
    public function run(): void
    {
        $organizationId = Organization::query()->where('slug', 'nujum-al-huda')->value('id')
            ?? Organization::query()->value('id');

        if (! $organizationId) {
            $this->command?->warn('Aucune organisation — événements non créés.');

            return;
        }

        // Remplace les anciens exemples Nujum
        MosqueEvent::query()->forceDelete();

        $events = [
            [
                'seed' => 'ansaroudine',
                'title_i18n' => [
                    'fr' => 'Journée Ansaroudine',
                    'en' => 'Ansaroudine Day',
                    'ar' => 'يوم الأنصارودين',
                ],
                'description_i18n' => [
                    'fr' => '<p>Journée Ansaroudine au Maroc.</p><p>La Journée Ansaroudine a rassemblé les disciples et amis du mouvement au Maroc. Prière, enseignement et fraternité ont marqué cette rencontre, dans l’esprit de la voie et de l’unité de la Fayda.</p>',
                    'en' => '<p>Ansaroudine Day in Morocco.</p>',
                    'ar' => '<p>يوم الأنصارودين في المغرب.</p>',
                ],
                'type' => 'community',
                'start_at' => now()->subMonths(3)->setTime(10, 0),
                'end_at' => now()->subMonths(3)->setTime(18, 0),
                'location' => 'Maroc',
                'requires_registration' => false,
                'status' => 'completed',
                'is_featured' => false,
            ],
            [
                'seed' => 'guediawaye',
                'title_i18n' => [
                    'fr' => 'Prière et hadara du vendredi',
                    'en' => 'Friday prayer and hadara',
                    'ar' => 'صلاة الجمعة والحضرة',
                ],
                'description_i18n' => [
                    'fr' => '<p>Prière et hadara du vendredi à Guédiawaye.</p><p>À Guédiawaye, la communauté s’est réunie pour la prière du vendredi, suivie de la hadara.</p>',
                    'en' => '<p>Friday prayer and hadara in Guédiawaye.</p>',
                    'ar' => '<p>صلاة الجمعة والحضرة في غيديواي.</p>',
                ],
                'type' => 'special_prayer',
                'start_at' => now()->subMonths(1)->setTime(13, 0),
                'end_at' => now()->subMonths(1)->setTime(16, 0),
                'location' => 'Guédiawaye',
                'requires_registration' => false,
                'status' => 'completed',
                'is_featured' => false,
            ],
            [
                'seed' => 'imam-day',
                'title_i18n' => [
                    'fr' => 'Imam Day',
                    'en' => 'Imam Day',
                    'ar' => 'يوم الإمام',
                ],
                'description_i18n' => [
                    'fr' => '<p>La Journée internationale de l’Imam Cheikh Tidiane Cissé, le 24 janvier 2027, à l’Hôtel King Fahd Palace, Dakar.</p>',
                    'en' => '<p>The International Day of Imam Cheikh Tidiane Cissé, 24 January 2027, at the King Fahd Palace Hotel, Dakar.</p>',
                    'ar' => '<p>اليوم الدولي للإمام الشيخ تجاني سيسي، 24 يناير 2027، بفندق قصر الملك فهد، دكار.</p>',
                ],
                'type' => 'community',
                'start_at' => '2027-01-24 09:00:00',
                'end_at' => '2027-01-24 18:00:00',
                'location' => 'Hôtel King Fahd Palace, Dakar',
                'requires_registration' => true,
                'status' => 'upcoming',
                'is_featured' => true,
            ],
        ];

        foreach ($events as $eventData) {
            $seed = $eventData['seed'];
            unset($eventData['seed']);

            MosqueEvent::create(array_merge([
                'id' => Str::ulid(),
                'organization_id' => $organizationId,
                'location_details' => $seed,
            ], $eventData));
        }

        $this->command?->info('✅ 3 événements Jiloul Jadid synchronisés.');
    }
}
