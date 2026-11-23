<?php

declare(strict_types=1);

namespace App\Filament\Support;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Modules\Community\Filament\Resources\DonationResource;
use Modules\Community\Filament\Resources\GalleryItemResource;
use Modules\Community\Filament\Resources\QuestionResource;
use Modules\Community\Models\ContactMessage;
use Modules\Community\Models\Discussion;
use Modules\Community\Models\Donation;
use Modules\Community\Models\GalleryItem;
use Modules\Community\Models\Question;
use Modules\Core\Models\Membership;
use Modules\Core\Models\User;
use Modules\Dahira\Filament\Resources\DahiraGroupResource;
use Modules\Dahira\Models\Contribution;
use Modules\Dahira\Models\ContributionSchedule;
use Modules\Dahira\Models\DahiraGroup;
use Modules\Dahira\Models\DahiraJoinRequest;
use Modules\Dahira\Models\Meeting;
use Modules\Dahira\Models\TreasuryEntry;
use Modules\Live\Filament\Resources\LiveStreamResource;
use Modules\Live\Models\LiveChannel;
use Modules\Live\Models\LiveStream;
use Modules\Live\Models\VodRecording;
use Modules\Mosque\Filament\Resources\EventResource;
use Modules\Mosque\Models\MosqueEvent;
use Throwable;

final class DashboardMetrics
{
    /** @var array<string, mixed>|null */
    private static ?array $cache = null;

    /**
     * @return array<string, mixed>
     */
    public static function get(): array
    {
        return self::$cache ??= self::build();
    }

    public static function money(int $amount): string
    {
        return number_format($amount, 0, ',', ' ').' XOF';
    }

    /**
     * Dossiers en attente, avec le lien vers leur page d'administration.
     *
     * @return list<array{key: string, section: string, label: string, value: int, ids: list<string>, url: ?string, icon: string}>
     */
    public static function attention(): array
    {
        $items = [
            [
                'key' => 'join_requests',
                'section' => 'dahira_office',
                'label' => 'Adhésions dahira',
                'ids' => self::ids(DahiraJoinRequest::class, fn ($query) => $query->where('status', 'pending')),
                'url' => self::url(\Modules\Dahira\Filament\Resources\JoinRequestResource::class),
                'icon' => 'heroicon-o-user-plus',
            ],
            [
                'key' => 'messages',
                'section' => 'community',
                'label' => 'Messages',
                'ids' => self::ids(ContactMessage::class, fn ($query) => $query->where('status', 'new')),
                'url' => self::url(\Modules\Community\Filament\Resources\ContactMessageResource::class),
                'icon' => 'heroicon-o-envelope',
            ],
            [
                'key' => 'dues',
                'section' => 'dahira_money',
                'label' => 'Cotisations dues',
                'ids' => self::ids(ContributionSchedule::class, fn ($query) => $query->whereIn('status', ['due', 'overdue'])),
                'url' => self::url(\Modules\Dahira\Filament\Resources\ContributionScheduleResource::class),
                'icon' => 'heroicon-o-banknotes',
            ],
            [
                'key' => 'questions',
                'section' => 'community',
                'label' => 'FAQ',
                'ids' => self::ids(Question::class, fn ($query) => $query->where('status', 'pending')),
                'url' => self::url(QuestionResource::class),
                'icon' => 'heroicon-o-question-mark-circle',
            ],
        ];

        return array_map(function (array $item): array {
            $item['value'] = count($item['ids']);

            return $item;
        }, $items);
    }

    /**
     * @return array<string, mixed>
     */
    private static function build(): array
    {
        $months = collect(range(5, 0))
            ->map(fn (int $i): Carbon => now()->startOfMonth()->subMonths($i));
        $keys = $months->map(fn (Carbon $month): string => $month->format('Y-m'))->all();
        $labels = $months->map(fn (Carbon $month): string => $month->locale('fr')->isoFormat('MMM'))->all();

        $donations = self::monthlyAmount(
            Donation::class,
            $keys,
            fn ($row): ?Carbon => $row->paid_at ?? $row->created_at,
            ['paid_at', 'created_at', 'amount_minor'],
            fn ($query) => $query->where('status', 'completed')->where(function ($query): void {
                $start = now()->startOfMonth()->subMonths(5);
                $query->where('paid_at', '>=', $start)
                    ->orWhere(function ($query) use ($start): void {
                        $query->whereNull('paid_at')->where('created_at', '>=', $start);
                    });
            }),
        );
        $contributions = self::monthlyAmount(
            Contribution::class,
            $keys,
            fn ($row): ?Carbon => $row->paid_on,
            ['paid_on', 'amount_minor'],
        );
        $treasuryIn = self::monthlyAmount(
            TreasuryEntry::class,
            $keys,
            fn ($row): ?Carbon => $row->occurred_on,
            ['occurred_on', 'amount_minor'],
            fn ($query) => $query->where('direction', 'in'),
        );
        $treasuryOut = self::monthlyAmount(
            TreasuryEntry::class,
            $keys,
            fn ($row): ?Carbon => $row->occurred_on,
            ['occurred_on', 'amount_minor'],
            fn ($query) => $query->where('direction', 'out'),
        );

        $usersSeries = self::monthlyCount(User::class, $keys);
        $enrollmentSeries = self::monthlyCount(Enrollment::class, $keys);
        $questionSeries = self::monthlyCount(Question::class, $keys);
        $contactSeries = self::monthlyCount(ContactMessage::class, $keys);

        $donationsMonth = (int) (end($donations) ?: 0);
        $donationsPrevious = (int) (prev($donations) ?: 0);
        reset($donations);

        $treasuryInTotal = self::sum(TreasuryEntry::class, 'amount_minor', fn ($query) => $query->where('direction', 'in'));
        $treasuryOutTotal = self::sum(TreasuryEntry::class, 'amount_minor', fn ($query) => $query->where('direction', 'out'));

        $otherIncome = [];
        foreach ($keys as $index => $key) {
            $otherIncome[] = max(0, ($treasuryIn[$index] ?? 0) - ($contributions[$index] ?? 0));
        }

        return [
            'labels' => $labels,
            'kpis' => [
                'users' => self::count(User::class),
                'users_series' => $usersSeries,
                'students' => self::count(Enrollment::class, fn ($query) => $query->where('status', 'active')),
                'enrollments_series' => $enrollmentSeries,
                'donations_month' => $donationsMonth,
                'donations_previous' => $donationsPrevious,
                'donations_series' => $donations,
                'treasury' => $treasuryInTotal - $treasuryOutTotal,
                'dues' => self::count(ContributionSchedule::class, fn ($query) => $query->whereIn('status', ['due', 'overdue'])),
                'pending_enrollments' => self::count(Enrollment::class, fn ($query) => $query->where('status', 'pending')),
                'live' => self::count(LiveStream::class, fn ($query) => $query->where('status', 'live')),
            ],
            'finance' => [
                'donations' => $donations,
                'contributions' => $contributions,
                'treasury_in' => $treasuryIn,
                'treasury_out' => $treasuryOut,
            ],
            'activity' => [
                'users' => $usersSeries,
                'enrollments' => $enrollmentSeries,
                'questions' => $questionSeries,
                'contacts' => $contactSeries,
            ],
            'income' => [
                'Dons' => array_sum($donations),
                'Cotisations' => array_sum($contributions),
                'Autres entrées' => array_sum($otherIncome),
            ],
            'spaces' => [
                'labels' => ['Événements', 'Dahiras', 'Médias', 'FAQ', 'Directs', 'Discussions'],
                'values' => [
                    self::count(MosqueEvent::class),
                    self::count(DahiraGroup::class),
                    self::count(GalleryItem::class),
                    self::count(Question::class),
                    self::count(LiveStream::class),
                    self::count(Discussion::class),
                ],
            ],
            'attention' => self::attention(),
            'areas' => [
                [
                    'title' => 'Événements',
                    'icon' => 'heroicon-o-calendar-days',
                    'url' => self::url(EventResource::class),
                    'items' => [
                        ['label' => 'Publiés', 'value' => (string) self::count(MosqueEvent::class)],
                        ['label' => 'À venir', 'value' => (string) self::count(MosqueEvent::class, fn ($query) => $query->where('start_at', '>=', now()))],
                        ['label' => 'Médiathèque', 'value' => (string) self::count(GalleryItem::class)],
                    ],
                ],
                [
                    'title' => 'Dahira',
                    'icon' => 'heroicon-o-user-group',
                    'url' => self::url(DahiraGroupResource::class),
                    'items' => [
                        ['label' => 'Cercles', 'value' => (string) self::count(DahiraGroup::class)],
                        ['label' => 'Membres actifs', 'value' => (string) self::count(Membership::class, fn ($query) => $query->where('status', 'active'))],
                        ['label' => 'Réunions à venir', 'value' => (string) self::count(Meeting::class, fn ($query) => $query->where('starts_at', '>=', now()))],
                    ],
                ],
                [
                    'title' => 'Finances',
                    'icon' => 'heroicon-o-banknotes',
                    'url' => self::url(DonationResource::class),
                    'items' => [
                        ['label' => 'Dons du mois', 'value' => self::money($donationsMonth)],
                        ['label' => 'Cotisations (6 mois)', 'value' => self::money((int) array_sum($contributions))],
                        ['label' => 'Solde trésorerie', 'value' => self::money($treasuryInTotal - $treasuryOutTotal)],
                    ],
                ],
                [
                    'title' => 'Communauté',
                    'icon' => 'heroicon-o-chat-bubble-left-right',
                    'url' => self::url(QuestionResource::class),
                    'items' => [
                        ['label' => 'Discussions', 'value' => (string) self::count(Discussion::class)],
                        ['label' => 'FAQ', 'value' => (string) self::count(Question::class)],
                        ['label' => 'Messages nouveaux', 'value' => (string) self::count(ContactMessage::class, fn ($query) => $query->where('status', 'new'))],
                    ],
                ],
                [
                    'title' => 'Direct',
                    'icon' => 'heroicon-o-signal',
                    'url' => self::url(LiveStreamResource::class),
                    'items' => [
                        ['label' => 'Chaînes', 'value' => (string) self::count(LiveChannel::class)],
                        ['label' => 'En cours', 'value' => (string) self::count(LiveStream::class, fn ($query) => $query->where('status', 'live'))],
                        ['label' => 'Rediffusions', 'value' => (string) self::count(VodRecording::class)],
                    ],
                ],
                [
                    'title' => 'Médiathèque',
                    'icon' => 'heroicon-o-photo',
                    'url' => self::url(GalleryItemResource::class),
                    'items' => [
                        ['label' => 'Médias', 'value' => (string) self::count(GalleryItem::class)],
                        ['label' => 'Utilisateurs', 'value' => (string) self::count(User::class)],
                        ['label' => 'Dons confirmés', 'value' => (string) self::count(Donation::class, fn ($query) => $query->where('status', 'completed'))],
                    ],
                ],
            ],
        ];
    }

    /**
     * @param  class-string<Model>  $model
     * @param  list<string>  $keys
     * @param  list<string>  $columns
     * @return list<int>
     */
    private static function monthlyAmount(string $model, array $keys, callable $dateOf, array $columns, ?callable $scope = null): array
    {
        $rows = self::rows($model, $columns, $scope);
        $grouped = [];

        foreach ($rows as $row) {
            $date = $dateOf($row);
            if (! $date) {
                continue;
            }

            $key = $date->format('Y-m');
            $grouped[$key] = ($grouped[$key] ?? 0) + (int) $row->amount_minor;
        }

        return array_map(fn (string $key): int => $grouped[$key] ?? 0, $keys);
    }

    /**
     * @param  class-string<Model>  $model
     * @param  list<string>  $keys
     * @return list<int>
     */
    private static function monthlyCount(string $model, array $keys, string $column = 'created_at'): array
    {
        $start = now()->startOfMonth()->subMonths(5);
        $rows = self::rows($model, [$column], fn ($query) => $query->where($column, '>=', $start));
        $grouped = [];

        foreach ($rows as $row) {
            $date = $row->{$column};
            if (! $date) {
                continue;
            }

            $key = $date instanceof Carbon ? $date->format('Y-m') : Carbon::parse($date)->format('Y-m');
            $grouped[$key] = ($grouped[$key] ?? 0) + 1;
        }

        return array_map(fn (string $key): int => $grouped[$key] ?? 0, $keys);
    }

    /**
     * @param  class-string<Model>  $model
     * @return list<string>
     */
    private static function ids(string $model, ?callable $scope = null): array
    {
        if (! self::ready($model)) {
            return [];
        }

        try {
            $query = $model::query();
            if ($scope) {
                $scope($query);
            }

            return $query->pluck('id')->map(fn ($id): string => (string) $id)->all();
        } catch (Throwable) {
            return [];
        }
    }

    /**
     * @param  class-string<Model>  $model
     */
    private static function count(string $model, ?callable $scope = null): int
    {
        if (! self::ready($model)) {
            return 0;
        }

        try {
            $query = $model::query();
            if ($scope) {
                $scope($query);
            }

            return (int) $query->count();
        } catch (Throwable) {
            return 0;
        }
    }

    /**
     * @param  class-string<Model>  $model
     */
    private static function sum(string $model, string $column, ?callable $scope = null): int
    {
        if (! self::ready($model)) {
            return 0;
        }

        try {
            $query = $model::query();
            if ($scope) {
                $scope($query);
            }

            return (int) $query->sum($column);
        } catch (Throwable) {
            return 0;
        }
    }

    /**
     * @param  class-string<Model>  $model
     * @param  list<string>  $columns
     */
    private static function rows(string $model, array $columns, ?callable $scope = null)
    {
        if (! self::ready($model)) {
            return collect();
        }

        try {
            $start = now()->startOfMonth()->subMonths(5);
            $query = $model::query();
            if ($scope) {
                $scope($query);
            } else {
                $dateColumn = $columns[0];
                $query->where($dateColumn, '>=', $start);
            }

            return $query->get($columns);
        } catch (Throwable) {
            return collect();
        }
    }

    /**
     * @param  class-string<Model>  $model
     */
    private static function ready(string $model): bool
    {
        try {
            return Schema::hasTable((new $model)->getTable());
        } catch (Throwable) {
            return false;
        }
    }

    private static function url(string $resource): ?string
    {
        try {
            return $resource::getUrl();
        } catch (Throwable) {
            return null;
        }
    }
}
