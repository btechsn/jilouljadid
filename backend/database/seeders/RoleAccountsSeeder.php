<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Core\Enums\MembershipStatus;
use Modules\Core\Enums\OrganizationType;
use Modules\Core\Models\Membership;
use Modules\Core\Models\Organization;
use Modules\Core\Models\Role;
use Modules\Core\Models\User;

/**
 * Compte administrateur uniquement pour Jiloul Jadid.
 */
class RoleAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $center = Organization::query()->where('slug', 'nujum-al-huda')->first()
            ?? Organization::query()->where('type', OrganizationType::CENTER)->first();

        if (! $center) {
            $this->command?->warn('Aucune organisation centre — admin non créé.');

            return;
        }

        // Ancien email → nouveau
        $legacy = User::query()->where('email', 'admin@nujumalhuda.com')->first();
        if ($legacy && ! User::query()->where('email', 'admin@jilouljadid.com')->exists()) {
            $legacy->email = 'admin@jilouljadid.com';
            $legacy->first_name = 'Admin';
            $legacy->last_name = 'Jadid';
            $legacy->save();
        }

        $role = Role::query()->firstOrCreate(['name' => 'admin'], [
            'display_name' => 'Administrateur',
            'description' => 'Administrateur',
            'is_system' => true,
        ]);

        $user = User::query()->firstOrNew(['email' => 'admin@jilouljadid.com']);
        if (! $user->exists) {
            $user->first_name = 'Admin';
            $user->last_name = 'Jadid';
            $user->locale = 'fr';
            $user->timezone = 'Africa/Dakar';
        }
        $user->password = 'password';
        $user->email_verified_at ??= now();
        if (blank($user->phone) && ! User::query()->where('phone', '+221770000001')->exists()) {
            $user->phone = '+221770000001';
        }
        $user->save();

        Membership::query()->firstOrCreate([
            'user_id' => $user->id,
            'organization_id' => $center->id,
            'role_id' => $role->id,
        ], [
            'status' => MembershipStatus::ACTIVE,
            'joined_at' => now(),
        ]);

        // Retirer les comptes démo hors admin
        $demoEmails = [
            'directeur@nujumalhuda.com',
            'secretaire@nujumalhuda.com',
            'enseignant@nujumalhuda.com',
            'pedagogie@nujumalhuda.com',
            'muqaddam@nujumalhuda.com',
            'secretaire.dahira@nujumalhuda.com',
            'tresorier@nujumalhuda.com',
            'membre@nujumalhuda.com',
            'admin@nujumalhuda.com',
        ];

        User::query()
            ->whereIn('email', $demoEmails)
            ->where('email', '!=', 'admin@jilouljadid.com')
            ->each(function (User $demo): void {
                Membership::query()->where('user_id', $demo->id)->delete();
                $demo->delete();
            });

        $this->command?->info('   Administrateur : admin@jilouljadid.com');
    }
}
