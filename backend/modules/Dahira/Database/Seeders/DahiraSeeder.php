<?php

namespace Modules\Dahira\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Core\Enums\OrganizationType;
use Modules\Core\Models\Organization;
use Modules\Core\Models\Role;
use Modules\Dahira\Models\ContributionPlan;
use Modules\Dahira\Models\DahiraGroup;
use Modules\Dahira\Models\Meeting;

/**
 * Sections du mouvement (affichées comme « Sections » dans l’admin).
 */
class DahiraSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'dahira_muqaddam' => 'Responsable de section',
            'dahira_secretary' => 'Secrétaire de section',
            'dahira_treasurer' => 'Trésorier de section',
            'dahira_member' => 'Membre de section',
        ] as $name => $label) {
            Role::firstOrCreate(['name' => $name], [
                'display_name' => $label,
                'description' => $label,
                'is_system' => true,
            ]);
        }

        Meeting::query()->delete();
        ContributionPlan::query()->delete();
        DahiraGroup::query()->delete();

        $sections = [
            [
                'slug' => 'section-jeunesse',
                'name' => [
                    'fr' => 'Jeunesse & fraternité',
                    'en' => 'Youth & brotherhood',
                    'ar' => 'الشباب والأخوة',
                ],
                'description' => [
                    'fr' => 'Se connaître, se rapprocher et renforcer l’appartenance à la grande fraternité islamique.',
                    'en' => 'To foster mutual knowledge and belonging to the great Islamic brotherhood.',
                    'ar' => 'التعارف والتقارب وتعزيز الانتماء إلى الأخوة الإسلامية الكبرى.',
                ],
            ],
            [
                'slug' => 'section-transmission',
                'name' => [
                    'fr' => 'Transmission',
                    'en' => 'Transmission',
                    'ar' => 'النقل والتوريث',
                ],
                'description' => [
                    'fr' => 'Préserver le patrimoine et la voie du Cheikh, par la sagesse et la bonne exhortation.',
                    'en' => 'Preserve the heritage and the path of the Sheikh, through wisdom and good counsel.',
                    'ar' => 'حفظ التراث وطريق الشيخ بالحكمة والموعظة الحسنة.',
                ],
            ],
            [
                'slug' => 'section-service',
                'name' => [
                    'fr' => 'Service',
                    'en' => 'Service',
                    'ar' => 'الخدمة',
                ],
                'description' => [
                    'fr' => 'Œuvrer concrètement pour le bien : entraide, présence et engagement auprès des nouvelles générations.',
                    'en' => 'Work concretely for the good: mutual aid, presence and commitment to the new generations.',
                    'ar' => 'العمل من أجل الخير: التضامن والحضور والالتزام مع الأجيال الجديدة.',
                ],
            ],
            [
                'slug' => 'section-unite',
                'name' => [
                    'fr' => 'Unité de la Fayda',
                    'en' => 'Unity of the Fayda',
                    'ar' => 'وحدة الفيضة',
                ],
                'description' => [
                    'fr' => 'Refuser les divisions, rapprocher les rangs et avancer ensemble.',
                    'en' => 'Reject divisions, bring ranks closer and move forward together.',
                    'ar' => 'رفض الفرقة وتقريب الصفوف والتقدم معاً.',
                ],
            ],
        ];

        foreach ($sections as $section) {
            $organization = Organization::query()->firstOrNew(['slug' => $section['slug']]);
            $organization->type = OrganizationType::DAHIRA;
            $organization->country = 'SN';
            $organization->city = 'Dakar';
            $organization->is_active = true;
            $organization->setTranslations('name', $section['name']);
            $organization->save();

            DahiraGroup::updateOrCreate(
                ['organization_id' => $organization->id],
                [
                    'name_i18n' => $section['name'],
                    'description_i18n' => $section['description'],
                    'meeting_weekday' => null,
                    'meeting_time' => null,
                    'location' => 'Dakar',
                    'is_active' => true,
                ]
            );
        }

        // Ancienne org dahira unique
        Organization::query()->where('slug', 'dahira-nujum-al-huda')->update(['is_active' => false]);

        $this->command?->info('✅ 4 sections Jiloul Jadid.');
    }
}
