<?php

namespace Modules\Mosque\Filament\Resources;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Modules\Core\Enums\OrganizationType;
use Modules\Core\Models\Organization;
use Modules\Core\Models\User;
use Modules\Mosque\Filament\Resources\EventResource\Pages;
use Modules\Mosque\Filament\Resources\EventResource\RelationManagers;
use Modules\Mosque\Models\MosqueEvent;

class EventResource extends Resource
{
    public static function canViewAny(): bool
    {
        return \Modules\Core\Support\PanelAccess::allows('zawiya')
            || \Modules\Core\Support\PanelAccess::allows('community');
    }

    protected static ?string $model = MosqueEvent::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationGroup = 'Événements';

    protected static ?string $navigationLabel = 'Événements';

    protected static ?string $modelLabel = 'événement';

    protected static ?string $pluralModelLabel = 'Événements';

    protected static ?string $slug = 'events';

    protected static ?int $navigationSort = 1;

    public static function getModelLabel(): string
    {
        return 'événement';
    }

    public static function getPluralModelLabel(): string
    {
        return 'Événements';
    }

    public static function getNavigationLabel(): string
    {
        return 'Événements';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informations générales')
                    ->schema([
                        Forms\Components\Select::make('organization_id')
                            ->label('Organisation')
                            ->options(fn (): array => self::organizationOptions())
                            ->required()
                            ->default(fn () => Organization::query()
                                ->whereIn('slug', ['jiloul-jadid', 'nujum-al-huda'])
                                ->orderByRaw("CASE WHEN slug = 'jiloul-jadid' THEN 0 ELSE 1 END")
                                ->value('id'))
                            ->searchable(),

                        Forms\Components\Select::make('type')
                            ->label('Type')
                            ->options(self::typeOptions())
                            ->required(),
                    ])->columns(2),

                Forms\Components\Section::make('Titre et description')
                    ->schema([
                        Forms\Components\TextInput::make('title_i18n.fr')
                            ->label('Titre (français)')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('title_i18n.en')
                            ->label('Title (English)')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('title_i18n.ar')
                            ->label('العنوان (عربي)')
                            ->maxLength(255),
                        Forms\Components\RichEditor::make('description_i18n.fr')
                            ->label('Description (français)')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('description_i18n.en')
                            ->label('Description (English)')
                            ->rows(3)
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('description_i18n.ar')
                            ->label('الوصف (عربي)')
                            ->rows(3)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Dates et horaires')
                    ->description('Le statut (à venir / en cours / terminé) se calcule automatiquement à partir de ces dates.')
                    ->schema([
                        Forms\Components\DateTimePicker::make('start_at')
                            ->label('Début')
                            ->required()
                            ->seconds(false)
                            ->default(now()->addDay()->setTime(10, 0)),
                        Forms\Components\DateTimePicker::make('end_at')
                            ->label('Fin')
                            ->seconds(false)
                            ->after('start_at'),
                        Forms\Components\Placeholder::make('status_hint')
                            ->label('Statut')
                            ->content(function (Get $get, ?MosqueEvent $record): string {
                                $status = $record?->status === 'cancelled'
                                    ? 'cancelled'
                                    : self::previewStatus($get('start_at'), $get('end_at'));

                                return match ($status) {
                                    'ongoing' => 'En cours (automatique)',
                                    'completed' => 'Terminé (automatique)',
                                    'cancelled' => 'Annulé',
                                    default => 'À venir (automatique)',
                                };
                            }),
                        Forms\Components\Toggle::make('is_cancelled')
                            ->label('Annuler cet événement')
                            ->helperText('Cochez uniquement pour marquer l’événement comme annulé.')
                            ->dehydrated(false)
                            ->afterStateHydrated(function (Forms\Components\Toggle $component, ?MosqueEvent $record): void {
                                $component->state($record?->status === 'cancelled');
                            })
                            ->live(),
                    ])->columns(2),

                Forms\Components\Section::make('Lieu')
                    ->schema([
                        Forms\Components\TextInput::make('location')
                            ->label('Lieu')
                            ->maxLength(255)
                            ->placeholder('Dakar'),
                        Forms\Components\Textarea::make('location_details')
                            ->label('Détails du lieu')
                            ->rows(2)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Intervenant')
                    ->schema([
                        Forms\Components\Select::make('speaker_id')
                            ->label('Intervenant (utilisateur)')
                            ->relationship(
                                name: 'speaker',
                                modifyQueryUsing: fn (Builder $query) => $query->orderBy('last_name')->orderBy('first_name'),
                            )
                            ->getOptionLabelFromRecordUsing(fn (User $record): string => $record->fullName())
                            ->searchable(['first_name', 'last_name', 'email'])
                            ->preload()
                            ->nullable(),
                        Forms\Components\TextInput::make('speaker_name')
                            ->label('Intervenant externe')
                            ->helperText('Si la personne n’a pas de compte.')
                            ->maxLength(255),
                    ])->columns(2),

                Forms\Components\Section::make('Inscriptions')
                    ->schema([
                        Forms\Components\Toggle::make('requires_registration')
                            ->label('Inscription requise')
                            ->live(),
                        Forms\Components\TextInput::make('capacity')
                            ->label('Capacité maximale')
                            ->numeric()
                            ->minValue(1)
                            ->visible(fn (Get $get): bool => (bool) $get('requires_registration')),
                        Forms\Components\TextInput::make('registered_count')
                            ->label('Inscrits')
                            ->numeric()
                            ->disabled()
                            ->dehydrated(false)
                            ->default(0),
                    ])->columns(3),

                Forms\Components\Section::make('Image et vidéo')
                    ->schema([
                        Forms\Components\FileUpload::make('cover_path')
                            ->label('Image de couverture')
                            ->image()
                            ->disk('public')
                            ->directory('events/covers')
                            ->visibility('public')
                            ->imageEditor()
                            ->maxSize(5120)
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->helperText('JPEG, PNG ou WebP — depuis votre ordinateur (5 Mo max). Affichée en tête de la fiche.')
                            ->columnSpanFull(),
                        Forms\Components\FileUpload::make('gallery_paths')
                            ->label('Galerie (page détail)')
                            ->image()
                            ->multiple()
                            ->reorderable()
                            ->disk('public')
                            ->directory('events/gallery')
                            ->visibility('public')
                            ->maxFiles(20)
                            ->maxSize(5120)
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->helperText('Plusieurs photos pour le carrousel de la page détail (JPEG, PNG ou WebP, 5 Mo max chacune).')
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('youtube_url')
                            ->label('Vidéo YouTube')
                            ->url()
                            ->maxLength(255)
                            ->placeholder('https://youtube.com/watch?v=...'),
                    ]),

                Forms\Components\Section::make('Options')
                    ->schema([
                        Forms\Components\Toggle::make('is_featured')
                            ->label('Mis en avant')
                            ->helperText('Affiché dans le slider Accueil et en priorité dans la liste des événements.')
                            ->default(false),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('cover_path')
                    ->label('')
                    ->disk('public')
                    ->circular()
                    ->defaultImageUrl(url('/brand/slide-centre.jpg')),
                Tables\Columns\TextColumn::make('title_i18n.fr')
                    ->label('Titre')
                    ->searchable()
                    ->limit(40),
                Tables\Columns\BadgeColumn::make('type')
                    ->label('Type')
                    ->formatStateUsing(fn (?string $state): string => self::typeOptions()[$state] ?? (string) $state),
                Tables\Columns\TextColumn::make('start_at')
                    ->label('Date')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('registered_count')
                    ->label('Inscrits')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Statut')
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'ongoing' => 'En cours',
                        'completed' => 'Terminé',
                        'cancelled' => 'Annulé',
                        default => 'À venir',
                    })
                    ->colors([
                        'warning' => 'upcoming',
                        'success' => 'ongoing',
                        'secondary' => 'completed',
                        'danger' => 'cancelled',
                    ]),
                Tables\Columns\IconColumn::make('is_featured')
                    ->label('En avant')
                    ->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')->options(self::typeOptions()),
                Tables\Filters\SelectFilter::make('status')->options([
                    'upcoming' => 'À venir',
                    'ongoing' => 'En cours',
                    'completed' => 'Terminé',
                    'cancelled' => 'Annulé',
                ]),
                Tables\Filters\TernaryFilter::make('is_featured')->label('Mis en avant'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('start_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\RegistrationsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEvents::route('/'),
            'create' => Pages\CreateEvent::route('/create'),
            'edit' => Pages\EditEvent::route('/{record}/edit'),
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function typeOptions(): array
    {
        return [
            'lecture' => 'Conférence',
            'conference' => 'Séminaire',
            'special_prayer' => 'Prière spéciale',
            'fundraising' => 'Collecte de fonds',
            'community' => 'Événement communautaire',
            'gamou' => 'Gamou',
            'workshop' => 'Atelier',
            'other' => 'Autre',
        ];
    }

    /**
     * @return array<string, string>
     */
    private static function organizationOptions(): array
    {
        return Organization::query()
            ->where('is_active', true)
            ->where(function (Builder $query): void {
                $query->whereIn('slug', ['jiloul-jadid', 'nujum-al-huda'])
                    ->orWhere('slug', 'like', 'section-%')
                    ->orWhere('type', OrganizationType::CENTER)
                    ->orWhere('type', OrganizationType::DAHIRA);
            })
            ->orderBy('slug')
            ->get()
            ->mapWithKeys(function (Organization $org): array {
                $label = $org->getTranslation('name', 'fr')
                    ?: $org->slug
                    ?: $org->id;

                return [$org->id => $label];
            })
            ->all();
    }

    private static function previewStatus(mixed $start, mixed $end): string
    {
        try {
            $startAt = $start ? \Carbon\Carbon::parse($start) : null;
            $endAt = $end ? \Carbon\Carbon::parse($end) : ($startAt?->copy()->addHours(3));
            $now = now();

            if (! $startAt) {
                return 'upcoming';
            }
            if ($endAt && $endAt->isPast()) {
                return 'completed';
            }
            if ($startAt->lte($now) && (! $endAt || $endAt->gte($now))) {
                return 'ongoing';
            }

            return 'upcoming';
        } catch (\Throwable) {
            return 'upcoming';
        }
    }

}
