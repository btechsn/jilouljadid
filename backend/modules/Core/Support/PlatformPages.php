<?php

declare(strict_types=1);

namespace Modules\Core\Support;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Modules\Core\Models\Setting;
use Throwable;

/**
 * Textes éditables de chaque page publique.
 * Les valeurs enregistrées remplacent les fichiers de traduction du site.
 */
final class PlatformPages
{
    /**
     * @var array<string, array<string, mixed>>
     */
    private static array $messages = [];

    /**
     * @return array<int, array{id: string, label: string, sort: int, slug: string, root: string, class: class-string, navigation: bool}>
     */
    public static function definitions(): array
    {
        return [
            self::page('home', 'Accueil', 5, 'pages/accueil', 'splash', \App\Filament\Pages\Content\HomePage::class),
            self::page('events', 'Événements', 10, 'pages/evenements', 'pages.events', \App\Filament\Pages\Content\EventsPage::class),
            self::page('live', 'En direct', 20, 'pages/direct', 'pages.live', \App\Filament\Pages\Content\LivePage::class),
            self::page('media', 'Médiathèque', 30, 'pages/mediatheque', 'pages.media', \App\Filament\Pages\Content\MediaPage::class),
            self::page('community', 'Communauté', 40, 'pages/communaute', 'pages.community', \App\Filament\Pages\Content\CommunityPage::class),
            self::page('contact', 'Contact', 50, 'pages/contact', 'pages.contact', \App\Filament\Pages\Content\ContactPage::class),
            // Hors navigation — héritage ou pages non exposées sur jilouljadid.com
            self::page('dahira', 'Sections (textes)', 55, 'pages/sections', 'pages.dahira', \App\Filament\Pages\Content\DahiraPage::class, false),
            self::page('announcements', 'Annonces (textes)', 70, 'pages/annonces', 'pages.announcements', \App\Filament\Pages\Content\AnnouncementsPage::class, false),
            self::page('replay', 'Replay', 80, 'pages/replay', 'pages.replay', \App\Filament\Pages\Content\ReplayPage::class, false),
            self::page('discussions', 'Discussions', 90, 'pages/discussions', 'pages.discussions', \App\Filament\Pages\Content\DiscussionsPage::class, false),
            self::page('centre', 'Centre', 100, 'pages/centre', 'doors.centre', \App\Filament\Pages\Content\CentrePage::class, false),
            self::page('zawiya', 'Zawiya', 110, 'pages/zawiya', 'pages.zawiya', \App\Filament\Pages\Content\ZawiyaPage::class, false),
            self::page('prayers', 'Horaires de prière', 120, 'pages/horaires', 'pages.prayers', \App\Filament\Pages\Content\PrayerTimesPage::class, false),
            self::page('calendar', 'Calendrier hégirien', 130, 'pages/calendrier', 'pages.calendar', \App\Filament\Pages\Content\CalendarPage::class, false),
            self::page('khutbas', 'Khutbas', 140, 'pages/khutbas', 'pages.khutbas', \App\Filament\Pages\Content\KhutbasPage::class, false),
            self::page('programs', 'Programmes', 150, 'pages/programmes', 'pages.programs', \App\Filament\Pages\Content\ProgramsPage::class, false),
            self::page('teachers', 'Enseignants', 160, 'pages/enseignants', 'pages.teachers', \App\Filament\Pages\Content\TeachersPage::class, false),
            self::page('enroll', 'Inscription', 170, 'pages/inscription', 'pages.enroll', \App\Filament\Pages\Content\EnrollmentPage::class, false),
            self::page('promotions', 'Promotions', 180, 'pages/promotions', 'pages.promotions', \App\Filament\Pages\Content\PromotionsPage::class, false),
            self::page('quiz', 'Quizz', 190, 'pages/quizz', 'pages.quiz', \App\Filament\Pages\Content\QuizPage::class, false),
            self::page('certificates', 'Certificats', 200, 'pages/certificats', 'pages.certificates', \App\Filament\Pages\Content\CertificatesPage::class, false),
            self::page('ijaza', 'Ijaza', 210, 'pages/ijaza', 'pages.ijaza', \App\Filament\Pages\Content\IjazaPage::class, false),
            self::page('news', 'Actualités', 220, 'pages/actualites', 'news', \App\Filament\Pages\Content\NewsPage::class, false),
            self::page('recitations', 'Récitations', 230, 'pages/recitations', 'pages.recitations', \App\Filament\Pages\Content\RecitationsPage::class, false),
            self::page('library', 'Bibliothèque', 240, 'pages/bibliotheque', 'pages.library', \App\Filament\Pages\Content\LibraryPage::class, false),
            self::page('daily', 'Du jour', 250, 'pages/du-jour', 'pages.daily', \App\Filament\Pages\Content\DailyPage::class, false),
            self::page('zakat', 'Zakat', 260, 'pages/zakat', 'pages.zakat', \App\Filament\Pages\Content\ZakatPage::class, false),
            self::page('muud', 'Muud Ramadan', 270, 'pages/muud-ramadan', 'pages.muud', \App\Filament\Pages\Content\MuudPage::class, false),
        ];
    }

    /**
     * @return array<int, class-string>
     */
    public static function pageClasses(): array
    {
        $pages = array_filter(
            self::definitions(),
            static fn (array $definition): bool => $definition['navigation'],
        );

        return array_column($pages, 'class');
    }

    /**
     * @return array{id: string, label: string, sort: int, slug: string, root: string, class: class-string}
     */
    public static function definition(string $id): array
    {
        foreach (self::definitions() as $definition) {
            if ($definition['id'] === $id) {
                return $definition;
            }
        }

        throw new \InvalidArgumentException("Page inconnue : {$id}");
    }

    /**
     * @return array<int, array{name: string, path: string, label: string, type: string}>
     */
    public static function fields(string $id): array
    {
        $definition = self::definition($id);
        $node = data_get(self::messages('fr'), $definition['root']);
        $fields = [];

        if ($id === 'home') {
            $fields[] = [
                'name' => 'image',
                'path' => '',
                'label' => 'Image de fond (splash)',
                'type' => 'image',
                'directory' => 'pages/accueil',
            ];
            $fields[] = [
                'name' => 'founder_image',
                'path' => '',
                'label' => 'Photo du fondateur (Accueil)',
                'type' => 'image',
                'directory' => 'pages/accueil',
            ];
        }

        if ($id === 'centre') {
            $fields[] = [
                'name' => 'image',
                'path' => '',
                'label' => 'Photo',
                'type' => 'image',
                'directory' => 'pages/centre',
            ];
        }

        if ($id === 'zawiya') {
            $fields[] = [
                'name' => 'founder_image',
                'path' => '',
                'label' => 'Photo du fondateur',
                'type' => 'image',
                'directory' => 'pages/zawiya',
            ];
        }

        if ($id === 'live') {
            $fields[] = [
                'name' => 'poster',
                'path' => '',
                'label' => 'Image du lecteur (sans direct)',
                'type' => 'image',
                'directory' => 'pages/direct',
            ];
        }

        if ($id === 'community') {
            $fields[] = [
                'name' => 'image',
                'path' => '',
                'label' => 'Image du bandeau (Communauté)',
                'type' => 'image',
                'directory' => 'pages/communaute',
            ];
        }

        if ($id === 'media') {
            $fields[] = [
                'name' => 'image',
                'path' => '',
                'label' => 'Image du bandeau (Médiathèque)',
                'type' => 'image',
                'directory' => 'pages/mediatheque',
            ];
        }

        if ($id === 'contact') {
            $fields[] = [
                'name' => 'image',
                'path' => '',
                'label' => 'Image du bandeau (Contact)',
                'type' => 'image',
                'directory' => 'pages/contact',
            ];
        }

        if (is_array($node)) {
            foreach (self::labels() as $name => $label) {
                if (! isset($node[$name]) || ! is_string($node[$name])) {
                    continue;
                }

                $fields[] = self::textField($name, $definition['root'].'.'.$name, $label);
            }
        }

        foreach (self::extraFields($id) as $field) {
            $fields[] = $field;
        }

        if (is_array($node) && isset($node['points']) && is_array($node['points'])) {
            $first = $node['points'][0] ?? null;

            if ($first === null || is_string($first)) {
                $fields[] = [
                    'name' => 'points',
                    'path' => $definition['root'].'.points',
                    'label' => 'Points',
                    'type' => 'points',
                ];
            }
        }

        return $fields;
    }

    /**
     * @return array<string, mixed>
     */
    public static function formState(string $id): array
    {
        $stored = self::stored($id);
        $state = [];

        foreach (self::fields($id) as $field) {
            if ($field['type'] === 'image') {
                $state[$field['name']] = self::imagePath($stored[$field['name']] ?? null);

                continue;
            }

            if ($field['type'] === 'points') {
                $state['points'] = isset($stored['points']) && is_array($stored['points'])
                    ? self::normalizePoints($stored['points'])
                    : self::defaultPoints($field['path']);

                continue;
            }

            $source = isset($field['store']) ? self::stored((string) $field['store']) : $stored;
            $key = (string) ($field['storeKey'] ?? $field['name']);
            $row = $source[$key] ?? null;
            $state[$field['name']] = [
                'fr' => is_array($row) ? (string) ($row['fr'] ?? '') : self::defaultString($field['path'], 'fr'),
                'en' => is_array($row) ? (string) ($row['en'] ?? '') : self::defaultString($field['path'], 'en'),
                'ar' => is_array($row) ? (string) ($row['ar'] ?? '') : self::defaultString($field['path'], 'ar'),
            ];

            if (! is_array($row)) {
                continue;
            }

            foreach (['fr', 'en', 'ar'] as $locale) {
                if ($state[$field['name']][$locale] === '') {
                    $state[$field['name']][$locale] = self::defaultString($field['path'], $locale);
                }
            }
        }

        return $state;
    }

    /**
     * @param  array<string, mixed>  $state
     */
    public static function persist(string $id, array $state): void
    {
        $payload = [];
        $linked = [];

        foreach (self::fields($id) as $field) {
            if ($field['type'] === 'image') {
                $payload[$field['name']] = self::imagePath($state[$field['name']] ?? null);

                continue;
            }

            if ($field['type'] === 'points') {
                $payload['points'] = self::normalizePoints($state['points'] ?? []);

                continue;
            }

            $row = is_array($state[$field['name']] ?? null) ? $state[$field['name']] : [];
            $trio = [
                'fr' => trim((string) ($row['fr'] ?? '')),
                'en' => trim((string) ($row['en'] ?? '')),
                'ar' => trim((string) ($row['ar'] ?? '')),
            ];

            if (isset($field['store'], $field['storeKey'])) {
                $linked[(string) $field['store']][(string) $field['storeKey']] = $trio;

                continue;
            }

            $payload[$field['name']] = $trio;
        }

        self::writePage($id, $payload);

        foreach ($linked as $storeId => $patch) {
            self::writePage($storeId, array_replace(self::stored($storeId), $patch));
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private static function writePage(string $id, array $payload): void
    {
        Setting::query()->updateOrCreate(
            ['key' => 'page.'.$id],
            [
                'value' => json_encode($payload, JSON_UNESCAPED_UNICODE),
                'type' => 'json',
                'group' => 'pages',
                'description' => self::definition($id)['label'],
                'is_public' => true,
            ],
        );
    }

    /**
     * Arbre de textes à fusionner dans les traductions du site.
     *
     * @return array<string, mixed>
     */
    public static function publicCopy(): array
    {
        if (! self::tableExists()) {
            return [];
        }

        try {
            $rows = Setting::query()->where('group', 'pages')->get(['key', 'value']);
        } catch (Throwable) {
            return [];
        }

        $tree = [];

        foreach ($rows as $row) {
            $id = str_starts_with((string) $row->key, 'page.') ? substr((string) $row->key, 5) : '';

            if ($id === '' || ! self::known($id)) {
                continue;
            }

            $stored = json_decode((string) $row->value, true);

            if (! is_array($stored)) {
                continue;
            }

            foreach (self::fields($id) as $field) {
                if ($field['type'] === 'image') {
                    continue;
                }

                if ($field['type'] === 'points') {
                    $points = self::normalizePoints($stored['points'] ?? []);

                    if ($points !== []) {
                        data_set($tree, $field['path'], $points);
                    }

                    continue;
                }

                $value = $stored[$field['name']] ?? null;

                if (! is_array($value)) {
                    continue;
                }

                data_set($tree, $field['path'], [
                    'fr' => trim((string) ($value['fr'] ?? '')),
                    'en' => trim((string) ($value['en'] ?? '')),
                    'ar' => trim((string) ($value['ar'] ?? '')),
                ]);
            }
        }

        return $tree;
    }

    public static function imageUrl(string $id, string $name = 'image'): ?string
    {
        $path = self::imagePath(self::stored($id)[$name] ?? null);

        if ($path === null) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    private static function imagePath(mixed $value): ?string
    {
        if (is_array($value)) {
            $value = reset($value);
        }

        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    /**
     * @param  array<string, mixed>  $points
     * @return array<int, array{fr: string, en: string, ar: string}>
     */
    private static function normalizePoints(array $points): array
    {
        $rows = [];

        foreach ($points as $point) {
            if (! is_array($point)) {
                continue;
            }

            $row = [
                'fr' => trim((string) ($point['fr'] ?? '')),
                'en' => trim((string) ($point['en'] ?? '')),
                'ar' => trim((string) ($point['ar'] ?? '')),
            ];

            if ($row['fr'] === '' && $row['en'] === '' && $row['ar'] === '') {
                continue;
            }

            $rows[] = $row;
        }

        return $rows;
    }

    /**
     * @return array<int, array{fr: string, en: string, ar: string}>
     */
    private static function defaultPoints(string $path): array
    {
        $byLocale = [];

        foreach (['fr', 'en', 'ar'] as $locale) {
            $value = data_get(self::messages($locale), $path);
            $byLocale[$locale] = is_array($value) ? array_values($value) : [];
        }

        $count = max(count($byLocale['fr']), count($byLocale['en']), count($byLocale['ar']));
        $rows = [];

        for ($index = 0; $index < $count; $index++) {
            $rows[] = [
                'fr' => is_string($byLocale['fr'][$index] ?? null) ? $byLocale['fr'][$index] : '',
                'en' => is_string($byLocale['en'][$index] ?? null) ? $byLocale['en'][$index] : '',
                'ar' => is_string($byLocale['ar'][$index] ?? null) ? $byLocale['ar'][$index] : '',
            ];
        }

        return $rows;
    }

    private static function defaultString(string $path, string $locale): string
    {
        $value = data_get(self::messages($locale), $path);

        return is_string($value) ? $value : '';
    }

    /**
     * @return array<string, mixed>
     */
    private static function stored(string $id): array
    {
        if (! self::tableExists()) {
            return [];
        }

        try {
            $value = Setting::query()->where('key', 'page.'.$id)->value('value');
        } catch (Throwable) {
            return [];
        }

        if (! is_string($value) || $value === '') {
            return [];
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @return array<string, mixed>
     */
    private static function messages(string $locale): array
    {
        if (isset(self::$messages[$locale])) {
            return self::$messages[$locale];
        }

        $path = dirname(base_path()).DIRECTORY_SEPARATOR.'frontend'.DIRECTORY_SEPARATOR.'messages'.DIRECTORY_SEPARATOR.$locale.'.json';

        if (! is_file($path)) {
            return self::$messages[$locale] = [];
        }

        try {
            $decoded = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        } catch (Throwable) {
            return self::$messages[$locale] = [];
        }

        return self::$messages[$locale] = is_array($decoded) ? $decoded : [];
    }

    private static function known(string $id): bool
    {
        foreach (self::definitions() as $definition) {
            if ($definition['id'] === $id) {
                return true;
            }
        }

        return false;
    }

    private static function tableExists(): bool
    {
        try {
            return Schema::hasTable('settings');
        } catch (Throwable) {
            return false;
        }
    }

    /**
     * @return array<string, string>
     */
    private static function labels(): array
    {
        return [
            'eyebrow' => 'Surtitre',
            'title' => 'Titre',
            'lede' => 'Introduction',
            'name' => 'Nom du mouvement',
            'arabicName' => 'Nom en arabe',
            'place' => 'Sous-titre',
            'wordmark' => 'Mot-symbole',
            'about' => 'Présentation',
            'founderEyebrow' => 'Surtitre du fondateur',
            'founderTitle' => 'Titre du fondateur',
            'founderName' => 'Nom du fondateur',
            'founderP1' => 'Paragraphe 1',
            'founderP2' => 'Paragraphe 2',
            'founderP3' => 'Paragraphe 3',
            'placeText' => 'Le lieu',
            'languagesText' => 'Les langues',
            'teachText' => 'Ce qui s’enseigne',
            'testimonialsTitle' => 'Titre des témoignages',
            'testimonialsLede' => 'Texte des témoignages',
            'partnersTitle' => 'Titre des partenaires',
            'partnersLede' => 'Texte des partenaires',
            'missionsTitle' => 'Titre des missions',
            'missionsLede' => 'Texte des missions',
            'listTitle' => 'Titre de la liste',
            'empty' => 'Message liste vide',
            'donateEyebrow' => 'Dons — surtitre',
            'donateTitle' => 'Dons — titre',
            'donateLede' => 'Dons — texte',
            'sectionsTitle' => 'Titre des sections',
            'sidebarEyebrow' => 'Encadré chat — surtitre',
            'sidebarTitle' => 'Encadré chat — titre',
            'sidebarLede' => 'Encadré chat — texte',
            'aboutTitle' => 'Titre « Comment ça marche »',
            'noMatch' => 'Message aucun résultat',
            'searchPlaceholder' => 'Placeholder recherche',
            'infoTitle' => 'Coordonnées — titre',
            'infoLede' => 'Coordonnées — texte',
            'hours' => 'Horaires',
            'formTitle' => 'Formulaire — titre',
            'formLede' => 'Formulaire — texte',
            'openMap' => 'Bouton carte',
        ];
    }

    /**
     * @return array<int, array{name: string, path: string, label: string, type: string}>
     */
    private static function extraFields(string $id): array
    {
        if ($id === 'home') {
            return [
                self::textField('door_about', 'splash.about.title', 'Bouton — Accueil / À propos'),
                self::textField('door_events', 'splash.events.title', 'Bouton — Événements'),
                self::textField('door_community', 'splash.community.title', 'Bouton — Communauté'),
                self::textField('door_media', 'splash.media.title', 'Bouton — Médiathèque'),
                self::textField('introTitle', 'pages.accueil.introTitle', 'Accueil — titre À propos'),
                self::textField('introLede', 'pages.accueil.introLede', 'Accueil — texte À propos'),
                self::textField('introMore', 'pages.accueil.introMore', 'Accueil — bouton Objectifs'),
                [
                    'name' => 'points',
                    'path' => 'pages.accueil.points',
                    'label' => 'Accueil — points À propos',
                    'type' => 'points',
                ],
                self::textField('founderEyebrow', 'pages.accueil.founderEyebrow', 'Accueil — surtitre fondateur'),
                self::textField('founderTitle', 'pages.accueil.founderTitle', 'Accueil — titre fondateur'),
                self::textField('founderP1', 'pages.accueil.founderP1', 'Accueil — fondateur §1'),
                self::textField('founderP2', 'pages.accueil.founderP2', 'Accueil — fondateur §2'),
                self::textField('founderP3', 'pages.accueil.founderP3', 'Accueil — fondateur §3'),
                self::textField('founderName', 'pages.accueil.founderName', 'Accueil — nom du fondateur'),
                self::textField('founderLine', 'pages.accueil.founderLine', 'Accueil — ligne sous le nom'),
                self::textField('aimsTitle', 'pages.accueil.aimsTitle', 'Accueil — titre Objectifs'),
                self::textField('aimsLede', 'pages.accueil.aimsLede', 'Accueil — intro Objectifs'),
                self::textField('aim1Title', 'pages.accueil.aim1Title', 'Objectif 1 — titre'),
                self::textField('aim1Text', 'pages.accueil.aim1Text', 'Objectif 1 — texte'),
                self::textField('aim2Title', 'pages.accueil.aim2Title', 'Objectif 2 — titre'),
                self::textField('aim2Text', 'pages.accueil.aim2Text', 'Objectif 2 — texte'),
                self::textField('aim3Title', 'pages.accueil.aim3Title', 'Objectif 3 — titre'),
                self::textField('aim3Text', 'pages.accueil.aim3Text', 'Objectif 3 — texte'),
                self::textField('aim4Title', 'pages.accueil.aim4Title', 'Objectif 4 — titre'),
                self::textField('aim4Text', 'pages.accueil.aim4Text', 'Objectif 4 — texte'),
                self::textField('testimonialsTitle', 'pages.accueil.testimonialsTitle', 'Accueil — titre Témoignages'),
                self::textField('testimonialsLede', 'pages.accueil.testimonialsLede', 'Accueil — intro Témoignages'),
                self::textField('partnersTitle', 'pages.accueil.partnersTitle', 'Accueil — titre Partenaires'),
            ];
        }

        if ($id === 'zawiya') {
            return [
                self::linkedField('prayers', 'lede', 'Horaires — introduction', 'textarea'),
                self::linkedField('khutbas', 'title', 'Khutbas — titre', 'text'),
                self::linkedField('khutbas', 'lede', 'Khutbas — introduction', 'textarea'),
                self::linkedField('calendar', 'title', 'Calendrier — titre', 'text'),
                self::linkedField('calendar', 'lede', 'Calendrier — introduction', 'textarea'),
            ];
        }

        if ($id !== 'centre') {
            return [];
        }

        $missions = [
            'centre' => 'Le centre',
            'zawiya' => 'La zawiya',
            'academics' => 'L’académique',
            'community' => 'La communauté',
            'live' => 'La diffusion',
            'welcome' => 'L’accueil',
        ];
        $fields = [];

        foreach ($missions as $key => $label) {
            $fields[] = self::textField(
                'mission_'.$key.'_title',
                'doors.centre.missions.'.$key.'.title',
                'Mission — '.$label.' (titre)',
            );
            $fields[] = self::textField(
                'mission_'.$key.'_text',
                'doors.centre.missions.'.$key.'.text',
                'Mission — '.$label.' (texte)',
            );
        }

        return $fields;
    }

    /**
     * @return array{name: string, path: string, label: string, type: string, store: string, storeKey: string}
     */
    private static function linkedField(string $store, string $key, string $label, string $type): array
    {
        return [
            'name' => $store.'_'.$key,
            'path' => 'pages.'.$store.'.'.$key,
            'label' => $label,
            'type' => $type,
            'store' => $store,
            'storeKey' => $key,
        ];
    }

    /**
     * @return array{name: string, path: string, label: string, type: string}
     */
    private static function textField(string $name, string $path, string $label): array
    {
        $long = in_array($name, ['lede', 'lead', 'about'], true)
            || str_starts_with($name, 'founderP')
            || str_ends_with($name, 'Text')
            || str_ends_with($name, 'Lede')
            || str_ends_with($name, '_text');

        return [
            'name' => $name,
            'path' => $path,
            'label' => $label,
            'type' => $long ? 'textarea' : 'text',
        ];
    }

    /**
     * @param  class-string  $class
     * @return array{id: string, label: string, sort: int, slug: string, root: string, class: class-string, navigation: bool}
     */
    private static function page(
        string $id,
        string $label,
        int $sort,
        string $slug,
        string $root,
        string $class,
        bool $navigation = true,
    ): array {
        return [
            'id' => $id,
            'label' => $label,
            'sort' => $sort,
            'slug' => $slug,
            'root' => $root,
            'class' => $class,
            'navigation' => $navigation,
        ];
    }
}
