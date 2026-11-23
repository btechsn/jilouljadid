<?php

namespace Modules\Resources;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;
use Modules\Resources\Console\Commands\NotifyDailyHadithCommand;

class ResourcesServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(base_path('config/zakat.php'), 'zakat');

        // Zakat / bibliothèque / récitations hérités : non exposés dans le panneau Jiloul Jadid.
    }

    public function boot(): void
    {
        $this->commands([NotifyDailyHadithCommand::class]);

        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
        $this->loadRoutesFrom(__DIR__ . '/routes/api.php');
        $this->loadRoutesFrom(__DIR__ . '/routes/web.php');

        $this->app->booted(function (): void {
            $this->app->make(Schedule::class)
                ->command('resources:notify-daily-hadith')
                ->dailyAt('08:00')
                ->timezone('Africa/Dakar')
                ->withoutOverlapping();
        });
    }
}
