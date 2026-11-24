<?php

namespace Modules\Community\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Community\Models\CommunityEvent;
use Modules\Community\Models\GalleryItem;
use Modules\Community\Models\Partner;
use Modules\Community\Models\Question;
use Modules\Community\Models\Testimonial;
use Modules\Core\Enums\OrganizationType;
use Modules\Core\Models\Organization;
use Modules\Core\Models\User;
use Modules\Dahira\Models\DahiraGroup;

class CommunitySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@jilouljadid.com')->first()
            ?? User::query()->where('email', 'admin@nujumalhuda.com')->first()
            ?? User::query()->first();

        if (!$admin) {
            $this->command?->warn('Aucun utilisateur pour CommunitySeeder.');

            return;
        }

        CommunityEvent::query()->delete();

        $questions = [
            [
                'slug_key' => 'rejoindre-section',
                'question_i18n' => [
                    'fr' => 'Comment rejoindre une section du mouvement ?',
                    'en' => 'How do I join a section of the movement?',
                    'ar' => 'كيف أنضم إلى قسم من الحركة؟',
                ],
                'answer_i18n' => [
                    'fr' => 'Rendez-vous sur la page Communauté, choisissez une section (Jeunesse, Transmission, Service ou Unité) et envoyez votre demande.',
                    'en' => 'Go to the Community page, choose a section (Youth, Transmission, Service or Unity) and send your request.',
                    'ar' => 'اذهب إلى صفحة الجماعة، اختر قسماً وأرسل طلبك.',
                ],
                'topics' => ['sections', 'communaute'],
            ],
            [
                'slug_key' => 'imam-day',
                'question_i18n' => [
                    'fr' => 'Quand a lieu l’Imam Day ?',
                    'en' => 'When is Imam Day?',
                    'ar' => 'متى يوم الإمام؟',
                ],
                'answer_i18n' => [
                    'fr' => 'Le 24 janvier 2027 à l’Hôtel King Fahd Palace, Dakar. Les détails sont sur la page Événements.',
                    'en' => '24 January 2027 at the King Fahd Palace Hotel, Dakar. Details are on the Events page.',
                    'ar' => '24 يناير 2027 بفندق قصر الملك فهد في دكار. التفاصيل في صفحة الفعاليات.',
                ],
                'topics' => ['evenements'],
            ],
            [
                'slug_key' => 'soutien',
                'question_i18n' => [
                    'fr' => 'Comment soutenir Jiloul Jadid ?',
                    'en' => 'How can I support Jiloul Jadid?',
                    'ar' => 'كيف أدعم الجيل الجديد؟',
                ],
                'answer_i18n' => [
                    'fr' => 'Via la page Soutien : Wave, Orange Money, Stripe ou PayPal selon votre situation.',
                    'en' => 'Via the Support page: Wave, Orange Money, Stripe or PayPal as available.',
                    'ar' => 'عبر صفحة الدعم: Wave أو Orange Money أو Stripe أو PayPal.',
                ],
                'topics' => ['soutien'],
            ],
        ];

        foreach ($questions as $index => $item) {
            $existing = Question::query()
                ->where('asker_id', $admin->id)
                ->where('question_i18n->fr', $item['question_i18n']['fr'])
                ->first();

            $recentAt = now()->subDays($index)->subHours($index);
            $payload = [
                'asker_id' => $admin->id,
                'teacher_id' => $admin->id,
                'question_i18n' => $item['question_i18n'],
                'answer_i18n' => $item['answer_i18n'],
                'topics' => $item['topics'],
                'status' => 'published',
                'is_public' => true,
                'answered_at' => $recentAt,
            ];

            if ($existing) {
                $existing->update($payload);
                $existing->created_at = $recentAt;
                $existing->save();
            } else {
                $created = Question::create($payload);
                $created->created_at = $recentAt;
                $created->save();
            }
        }

        Testimonial::query()->delete();

        foreach ([
            [
                'author_name' => 'Aïssatou Ndiaye',
                'relation' => 'member',
                'content_i18n' => [
                    'fr' => 'La section Jeunesse m’a permis de rencontrer des frères et sœurs engagés dans la même voie.',
                    'en' => 'The Youth section helped me meet brothers and sisters committed to the same path.',
                    'ar' => 'قسم الشباب أتاح لي لقاء إخوة وأخوات على نفس الطريق.',
                ],
            ],
            [
                'author_name' => 'Moussa Fall',
                'relation' => 'member',
                'content_i18n' => [
                    'fr' => 'Les sections et les événements du mouvement m’ont aidé à rester lié, même hors de Dakar.',
                    'en' => 'The sections and events of the movement helped me stay connected, even outside Dakar.',
                    'ar' => 'أقسام الحركة وفعالياتها أعانتني على البقاء مرتبطاً حتى خارج دكار.',
                ],
            ],
            [
                'author_name' => 'Fatou Ba',
                'relation' => 'member',
                'content_i18n' => [
                    'fr' => 'Imam Day et les journées du mouvement renforcent l’unité de la Fayda autour de Seydina Aliou Cissé.',
                    'en' => 'Imam Day and the movement’s gatherings strengthen Fayda unity around Seydina Aliou Cissé.',
                    'ar' => 'يوم الإمام ولقاءات الحركة تعزّز وحدة الفيضة حول سيدنا عليو سيسي.',
                ],
            ],
            [
                'author_name' => 'Ibrahima Diop',
                'relation' => 'member',
                'content_i18n' => [
                    'fr' => 'La section Service nous pousse à agir concrètement pour les nouvelles générations.',
                    'en' => 'The Service section pushes us to act concretely for the new generations.',
                    'ar' => 'قسم الخدمة يدفعنا للعمل الملموس من أجل الأجيال الجديدة.',
                ],
            ],
            [
                'author_name' => 'Marième Sarr',
                'relation' => 'member',
                'content_i18n' => [
                    'fr' => 'Les directs et la médiathèque nous relient à la vie du mouvement, même à distance.',
                    'en' => 'Lives and the media library keep us connected to the movement, even from afar.',
                    'ar' => 'البث المباشر والمكتبة الإعلامية تربطنا بالحركة حتى عن بعد.',
                ],
            ],
        ] as $row) {
            Testimonial::updateOrCreate(
                ['author_name' => $row['author_name']],
                [
                    'relation' => $row['relation'],
                    'content_i18n' => $row['content_i18n'],
                    'status' => 'approved',
                ]
            );
        }

        Partner::query()->delete();

        foreach ([
            [
                'name' => 'Association des Imams du Sénégal',
                'description_i18n' => [
                    'fr' => 'Partenaire pour la formation et l’échange autour de la voie.',
                    'en' => 'Partner for training and exchange around the path.',
                    'ar' => 'شريك للتكوين وتبادل حول الطريق.',
                ],
                'website_url' => null,
                'logo_url' => '/brand/slide-priere.jpg',
                'sort_order' => 1,
            ],
            [
                'name' => 'Collectif des Zawiya de Dakar',
                'description_i18n' => [
                    'fr' => 'Réseau de présence et d’unité autour de la Fayda.',
                    'en' => 'Network of presence and unity around the Fayda.',
                    'ar' => 'شبكة حضور ووحدة حول الفيضة.',
                ],
                'website_url' => null,
                'logo_url' => '/brand/slide-zawiya-soir.png',
                'sort_order' => 2,
            ],
            [
                'name' => 'Fondation Éducation & Coran',
                'description_i18n' => [
                    'fr' => 'Soutien à la transmission et à l’éducation des nouvelles générations.',
                    'en' => 'Support for transmission and education of new generations.',
                    'ar' => 'دعم النقل وتعليم الأجيال الجديدة.',
                ],
                'website_url' => null,
                'logo_url' => '/brand/slide-centre.jpg',
                'sort_order' => 3,
            ],
        ] as $row) {
            Partner::updateOrCreate(
                ['name' => $row['name']],
                [
                    'description_i18n' => $row['description_i18n'],
                    'website_url' => $row['website_url'],
                    'logo_url' => $row['logo_url'],
                    'sort_order' => $row['sort_order'],
                    'is_active' => true,
                ]
            );
        }

        $extraGroups = [
            [
                'slug' => 'dahira-jeunes-nujum',
                'name' => [
                    'fr' => 'Dahira des jeunes',
                    'en' => 'Youth dahira',
                    'ar' => 'دائرة الشباب',
                ],
                'description' => [
                    'fr' => 'Cercle des jeunes du centre : lecture, service et sorties.',
                    'en' => 'Youth circle of the centre: reading, service and outings.',
                    'ar' => 'حلقة شباب المركز: قراءة وخدمة وخرجات.',
                ],
                'weekday' => 6,
            ],
            [
                'slug' => 'dahira-femmes-nujum',
                'name' => [
                    'fr' => 'Dahira des sœurs',
                    'en' => 'Sisters’ dahira',
                    'ar' => 'دائرة الأخوات',
                ],
                'description' => [
                    'fr' => 'Espace des sœurs : formation, entraide et préparation du Ramadan.',
                    'en' => 'Sisters’ space: training, mutual aid and Ramadan preparation.',
                    'ar' => 'فضاء الأخوات: تكوين وتعاون واستعداد لرمضان.',
                ],
                'weekday' => 3,
            ],
        ];

        foreach ($extraGroups as $groupData) {
            $organization = Organization::query()->where('slug', $groupData['slug'])->first() ?? new Organization();
            $organization->type = OrganizationType::DAHIRA;
            $organization->slug = $groupData['slug'];
            $organization->country = 'SN';
            $organization->city = 'Dakar';
            $organization->is_active = true;
            $organization->setTranslations('name', $groupData['name']);
            $organization->save();

            DahiraGroup::updateOrCreate(
                ['organization_id' => $organization->id],
                [
                    'name_i18n' => $groupData['name'],
                    'description_i18n' => $groupData['description'],
                    'meeting_weekday' => $groupData['weekday'],
                    'location' => 'Institut Jiloul Jadid, Dakar',
                    'is_active' => true,
                ]
            );
        }

        // Ensure the main dahira from DahiraSeeder exists too.
        $this->call(\Modules\Dahira\Database\Seeders\DahiraSeeder::class);

        foreach ([
            [
                'kind' => 'photo',
                'event_name' => 'Hadara Jumma',
                'media_url' => '/brand/slide-zawiya-soir.png',
                'caption_i18n' => [
                    'fr' => 'Hadara du vendredi à la zawiya',
                    'en' => 'Friday hadara at the zawiya',
                    'ar' => 'حضرة الجمعة في الزاوية',
                ],
                'taken_on' => now()->subDays(3)->toDateString(),
            ],
            [
                'kind' => 'photo',
                'event_name' => 'Ouverture de l’année scolaire',
                'media_url' => '/brand/slide-academique.jpg',
                'caption_i18n' => [
                    'fr' => 'Cérémonie d’ouverture des cours',
                    'en' => 'Opening ceremony of classes',
                    'ar' => 'حفل افتتاح الدروس',
                ],
                'taken_on' => now()->subDays(20)->toDateString(),
            ],
            [
                'kind' => 'photo',
                'event_name' => 'Prière du vendredi',
                'media_url' => '/brand/slide-zawiya-mihrab.png',
                'caption_i18n' => [
                    'fr' => 'Ambiance de la zawiya',
                    'en' => 'Atmosphere of the zawiya',
                    'ar' => 'أجواء الزاوية',
                ],
                'taken_on' => now()->subDays(10)->toDateString(),
            ],
            [
                'kind' => 'video',
                'event_name' => 'Khutba du vendredi',
                'media_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_url' => '/brand/slide-priere.jpg',
                'caption_i18n' => [
                    'fr' => 'Extrait de la khutba',
                    'en' => 'Excerpt from the khutba',
                    'ar' => 'مقتطف من الخطبة',
                ],
                'taken_on' => now()->subDays(7)->toDateString(),
            ],
            [
                'kind' => 'video',
                'event_name' => 'Leçon de Coran',
                'media_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_url' => '/brand/intro-lecon.jpg',
                'caption_i18n' => [
                    'fr' => 'Cours filé en studio',
                    'en' => 'Studio lesson recording',
                    'ar' => 'تسجيل درس في الاستوديو',
                ],
                'taken_on' => now()->subDays(14)->toDateString(),
            ],
            [
                'kind' => 'photo',
                'event_name' => 'Gamou',
                'media_url' => '/brand/slide-actualites.jpg',
                'caption_i18n' => [
                    'fr' => 'Temps fort du Gamou au centre',
                    'en' => 'Highlight of Gamou at the centre',
                    'ar' => 'لحظة مميزة من الغامو في المركز',
                ],
                'taken_on' => now()->subDays(40)->toDateString(),
            ],
        ] as $row) {
            GalleryItem::updateOrCreate(
                [
                    'kind' => $row['kind'],
                    'event_name' => $row['event_name'],
                    'media_url' => $row['media_url'],
                ],
                [
                    'caption_i18n' => $row['caption_i18n'],
                    'thumbnail_url' => $row['thumbnail_url'] ?? null,
                    'taken_on' => $row['taken_on'],
                    'is_public' => true,
                ]
            );
        }

        $this->command?->info('✅ Communauté synchronisée.');
    }
}
