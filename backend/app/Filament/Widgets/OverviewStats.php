<?php

declare(strict_types=1);

namespace App\Filament\Widgets;

use App\Filament\Support\DashboardMetrics;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class OverviewStats extends StatsOverviewWidget
{
    public static function canView(): bool
    {
        return \Modules\Core\Support\PanelAccess::allows('dashboard_money')
            || \Modules\Core\Support\PanelAccess::allows('dashboard_activity');
    }

    protected static ?int $sort = 1;

    protected ?string $heading = 'Vue d’ensemble';

    protected ?string $description = 'Indicateurs du mouvement Jiloul Jadid.';

    protected int|string|array $columnSpan = 'full';

    protected function getColumns(): int
    {
        return 4;
    }

    protected function getStats(): array
    {
        $kpis = DashboardMetrics::get()['kpis'];
        $donationsDelta = $this->delta($kpis['donations_month'], $kpis['donations_previous']);

        return [
            Stat::make('Événements', $kpis['events'])
                ->description($kpis['events_upcoming'].' à venir · '.$kpis['events_featured'].' en avant')
                ->color('primary')
                ->icon('heroicon-o-calendar-days'),
            Stat::make('Sections', $kpis['sections'])
                ->description('Sections actives du mouvement')
                ->color('primary')
                ->icon('heroicon-o-user-group'),
            Stat::make('Annonces', $kpis['announcements'])
                ->description('Annonces actives')
                ->color('warning')
                ->icon('heroicon-o-megaphone'),
            Stat::make('En direct', $kpis['live'])
                ->description($kpis['live'] > 0 ? 'Diffusion en cours' : ($kpis['live_scheduled'].' planifié(s)'))
                ->color($kpis['live'] > 0 ? 'danger' : 'gray')
                ->icon('heroicon-o-signal'),
            Stat::make('Messages', $kpis['messages_new'])
                ->description($kpis['messages_new'] > 0 ? 'Nouveaux à traiter' : 'Boîte à jour')
                ->descriptionColor($kpis['messages_new'] > 0 ? 'warning' : 'success')
                ->chart($kpis['contacts_series'])
                ->color($kpis['messages_new'] > 0 ? 'warning' : 'success')
                ->icon('heroicon-o-envelope'),
            Stat::make('Médiathèque', $kpis['gallery'])
                ->description('Médias publiés')
                ->color('primary')
                ->icon('heroicon-o-photo'),
            Stat::make('Réseaux', $kpis['social'])
                ->description('Comptes sociaux actifs')
                ->color('primary')
                ->icon('heroicon-o-share'),
            Stat::make('Dons du mois', DashboardMetrics::money($kpis['donations_month']))
                ->description($donationsDelta['label'])
                ->descriptionIcon($donationsDelta['icon'])
                ->descriptionColor($donationsDelta['color'])
                ->chart($kpis['donations_series'])
                ->color('warning')
                ->icon('heroicon-o-heart'),
        ];
    }

    /**
     * @return array{label: string, icon: string, color: string}
     */
    private function delta(int $current, int $previous): array
    {
        $diff = $current - $previous;

        if ($previous === 0) {
            return [
                'label' => $diff > 0 ? 'Nouveau ce mois' : 'Stable',
                'icon' => $diff > 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-minus',
                'color' => $diff > 0 ? 'success' : 'gray',
            ];
        }

        $percent = (int) round(($diff / $previous) * 100);

        return [
            'label' => ($percent > 0 ? '+' : '').$percent.' % vs mois dernier',
            'icon' => $diff >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down',
            'color' => $diff >= 0 ? 'success' : 'danger',
        ];
    }
}
