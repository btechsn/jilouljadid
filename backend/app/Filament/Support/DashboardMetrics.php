<?php

declare(strict_types=1);

namespace App\Filament\Support;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Modules\Announcements\Filament\Resources\AnnouncementResource;
use Modules\Announcements\Models\Announcement;
use Modules\Community\Filament\Resources\ContactMessageResource;
use Modules\Community\Filament\Resources\DonationResource;
use Modules\Community\Filament\Resources\GalleryItemResource;
use Modules\Community\Filament\Resources\QuestionResource;
use Modules\Community\Models\ContactMessage;
use Modules\Community\Models\Donation;
use Modules\Community\Models\GalleryItem;
use Modules\Community\Models\Question;
use Modules\Core\Models\User;
use Modules\Dahira\Filament\Resources\DahiraGroupResource;
use Modules\Dahira\Models\DahiraGroup;
use Modules\Live\Filament\Resources\LiveStreamResource;
use Modules\Live\Models\LiveStream;
use Modules\Live\Models\SocialAccount;
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
     * @return list<array{key: string, section: string, label: string, value: int, ids: list<string>, url: ?string, icon: string}>
     */
    public static function attention(): array
    {
        $items = [
            [
                'key' => 'messages',
                'section' => 'community',
                'label' => 'Messages contact',
                'ids' => self::ids(ContactMessage::class, fn ($query) => $query->where('status', 'new')),
                'url' => self::url(ContactMessageResource::class),
                'icon' => 'heroicon-o-envelope',
            ],
            [
                'key' => 'questions',
                'section' => 'community',
                'label' => 'FAQ en attente',
                'ids' => self::ids(Question::class, fn ($query) => $query->where('status', 'pending')),
                'url' => self::url(QuestionResource::class),
                'icon' => 'heroicon-o-question-mark-circle',
            ],
            [
                'key' => 'events_upcoming',
                'section' => 'community',
                'label' => 'Événements à venir',
                'ids' => self::ids(MosqueEvent::class, fn ($query) => $query->where('status', 'upcoming')->where('start_at', '>=', now())),
                'url' => self::url(EventResource::class),
                'icon' => 'heroicon-o-calendar-days',
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
        $months = collect(range(5, 0))->map(fn (int $i) => now()->startOfMonth()->subMonths($i));
        $labels = $months->map(fn (Carbon $date) => $date->translatedFormat('M'))->all();
        $keys = $months->map(fn (Carbon $date) => $date->format('Y-m'))->all();

        $contactsSeries = self::monthlyCount(ContactMessage::class, $keys);
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

        $donationsMonth = (int) (end($donations) ?: 0);
        $donationsPrevious = count($donations) > 1 ? (int) $donations[count($donations) - 2] : 0;

        return [
            'labels' => $labels,
            'kpis' => [
                'events' => self::count(MosqueEvent::class),
                'events_upcoming' => self::count(MosqueEvent::class, fn ($query) => $query->where('status', 'upcoming')->where('start_at', '>=', now())),
                'events_featured' => self::count(MosqueEvent::class, fn ($query) => $query->where('is_featured', true)),
                'sections' => self::count(DahiraGroup::class, fn ($query) => $query->where('is_active', true)),
                'announcements' => self::count(Announcement::class, fn ($query) => $query->where('is_active', true)),
                'live' => self::count(LiveStream::class, fn ($query) => $query->where('status', 'live')),
                'live_scheduled' => self::count(LiveStream::class, fn ($query) => $query->where('status', 'scheduled')),
                'messages_new' => self::count(ContactMessage::class, fn ($query) => $query->where('status', 'new')),
                'gallery' => self::count(GalleryItem::class),
                'social' => self::count(SocialAccount::class, fn ($query) => $query->where('is_active', true)),
                'users' => self::count(User::class),
                'donations_month' => $donationsMonth,
                'donations_previous' => $donationsPrevious,
                'donations_series' => $donations,
                'contacts_series' => $contactsSeries,
            ],
            'spaces' => [
                'labels' => ['Événements', 'Sections', 'Annonces', 'Médias', 'Directs', 'Messages'],
                'values' => [
                    self::count(MosqueEvent::class),
                    self::count(DahiraGroup::class),
                    self::count(Announcement::class),
                    self::count(GalleryItem::class),
                    self::count(LiveStream::class),
                    self::count(ContactMessage::class),
                ],
            ],
            'attention' => self::attention(),
            'areas' => [
                [
                    'title' => 'Événements',
                    'icon' => 'heroicon-o-calendar-days',
                    'url' => self::url(EventResource::class),
                    'items' => [
                        ['label' => 'Total', 'value' => (string) self::count(MosqueEvent::class)],
                        ['label' => 'À venir', 'value' => (string) self::count(MosqueEvent::class, fn ($query) => $query->where('status', 'upcoming')->where('start_at', '>=', now()))],
                        ['label' => 'Mis en avant', 'value' => (string) self::count(MosqueEvent::class, fn ($query) => $query->where('is_featured', true))],
                    ],
                ],
                [
                    'title' => 'Sections',
                    'icon' => 'heroicon-o-user-group',
                    'url' => self::url(DahiraGroupResource::class),
                    'items' => [
                        ['label' => 'Actives', 'value' => (string) self::count(DahiraGroup::class, fn ($query) => $query->where('is_active', true))],
                    ],
                ],
                [
                    'title' => 'Annonces',
                    'icon' => 'heroicon-o-megaphone',
                    'url' => self::url(AnnouncementResource::class),
                    'items' => [
                        ['label' => 'Actives', 'value' => (string) self::count(Announcement::class, fn ($query) => $query->where('is_active', true))],
                    ],
                ],
                [
                    'title' => 'Direct & réseaux',
                    'icon' => 'heroicon-o-signal',
                    'url' => self::url(LiveStreamResource::class),
                    'items' => [
                        ['label' => 'En cours', 'value' => (string) self::count(LiveStream::class, fn ($query) => $query->where('status', 'live'))],
                        ['label' => 'Planifiés', 'value' => (string) self::count(LiveStream::class, fn ($query) => $query->where('status', 'scheduled'))],
                        ['label' => 'Comptes sociaux', 'value' => (string) self::count(SocialAccount::class, fn ($query) => $query->where('is_active', true))],
                    ],
                ],
                [
                    'title' => 'Communauté',
                    'icon' => 'heroicon-o-chat-bubble-left-right',
                    'url' => self::url(QuestionResource::class),
                    'items' => [
                        ['label' => 'FAQ', 'value' => (string) self::count(Question::class)],
                        ['label' => 'Messages nouveaux', 'value' => (string) self::count(ContactMessage::class, fn ($query) => $query->where('status', 'new'))],
                        ['label' => 'Médiathèque', 'value' => (string) self::count(GalleryItem::class)],
                    ],
                ],
                [
                    'title' => 'Soutien',
                    'icon' => 'heroicon-o-heart',
                    'url' => self::url(DonationResource::class),
                    'items' => [
                        ['label' => 'Dons du mois', 'value' => self::money($donationsMonth)],
                    ],
                ],
            ],
        ];
    }

    /**
     * @param  class-string<Model>  $model
     * @param  (callable(\Illuminate\Database\Eloquent\Builder): mixed)|null  $scope
     */
    private static function count(string $model, ?callable $scope = null): int
    {
        try {
            if (! class_exists($model) || ! Schema::hasTable((new $model)->getTable())) {
                return 0;
            }

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
     * @param  (callable(\Illuminate\Database\Eloquent\Builder): mixed)|null  $scope
     * @return list<string>
     */
    private static function ids(string $model, ?callable $scope = null): array
    {
        try {
            if (! class_exists($model) || ! Schema::hasTable((new $model)->getTable())) {
                return [];
            }

            $query = $model::query();
            if ($scope) {
                $scope($query);
            }

            return $query->limit(50)->pluck('id')->map(fn ($id) => (string) $id)->all();
        } catch (Throwable) {
            return [];
        }
    }

    /**
     * @param  class-string  $resource
     */
    private static function url(string $resource): ?string
    {
        try {
            if (! class_exists($resource) || ! method_exists($resource, 'getUrl')) {
                return null;
            }

            return $resource::getUrl();
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @param  class-string<Model>  $model
     * @param  list<string>  $keys
     * @return list<int>
     */
    private static function monthlyCount(string $model, array $keys): array
    {
        try {
            if (! class_exists($model) || ! Schema::hasTable((new $model)->getTable())) {
                return array_fill(0, count($keys), 0);
            }

            $rows = $model::query()
                ->where('created_at', '>=', now()->startOfMonth()->subMonths(5))
                ->get(['created_at']);

            $bucket = array_fill_keys($keys, 0);
            foreach ($rows as $row) {
                $key = optional($row->created_at)->format('Y-m');
                if ($key && isset($bucket[$key])) {
                    $bucket[$key]++;
                }
            }

            return array_values($bucket);
        } catch (Throwable) {
            return array_fill(0, count($keys), 0);
        }
    }

    /**
     * @param  class-string<Model>  $model
     * @param  list<string>  $keys
     * @param  callable(object): (?Carbon)  $dateOf
     * @param  list<string>  $columns
     * @param  (callable(\Illuminate\Database\Eloquent\Builder): mixed)|null  $scope
     * @return list<int>
     */
    private static function monthlyAmount(string $model, array $keys, callable $dateOf, array $columns, ?callable $scope = null): array
    {
        try {
            if (! class_exists($model) || ! Schema::hasTable((new $model)->getTable())) {
                return array_fill(0, count($keys), 0);
            }

            $query = $model::query();
            if ($scope) {
                $scope($query);
            }

            $rows = $query->get($columns);
            $bucket = array_fill_keys($keys, 0);

            foreach ($rows as $row) {
                $date = $dateOf($row);
                $key = $date?->format('Y-m');
                if ($key && isset($bucket[$key])) {
                    $bucket[$key] += (int) ($row->amount_minor ?? 0);
                }
            }

            return array_values($bucket);
        } catch (Throwable) {
            return array_fill(0, count($keys), 0);
        }
    }
}
