<?php

namespace Modules\News;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Modules\Core\Events\AssistantKnowledgeCollecting;
use Modules\Core\Events\PublicSearchRunning;
use Modules\News\Listeners\CollectNewsAssistantKnowledge;
use Modules\News\Listeners\SearchPublishedArticles;

class NewsServiceProvider extends ServiceProvider
{
    protected string $namespace = 'Modules\News';

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
        $this->loadRoutesFrom(__DIR__ . '/routes/api.php');
        $this->loadRoutesFrom(__DIR__ . '/routes/web.php');
        Event::listen(PublicSearchRunning::class, SearchPublishedArticles::class);
        Event::listen(AssistantKnowledgeCollecting::class, CollectNewsAssistantKnowledge::class);
    }

    public function register(): void
    {
        // Actualités héritées : non exposées dans le panneau Jiloul Jadid.

        $this->app->register(\Modules\News\Providers\EventServiceProvider::class);
        $this->app->singleton(\Modules\News\Services\CommentSpamService::class);
    }
}
