<?php

namespace Modules\Mosque\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Modules\Core\Models\Media;
use Modules\Core\Models\Organization;
use Modules\Core\Models\User;

class MosqueEvent extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'title_i18n',
        'description_i18n',
        'type',
        'start_at',
        'end_at',
        'is_recurring',
        'recurrence_pattern',
        'location',
        'location_details',
        'speaker_id',
        'speaker_name',
        'capacity',
        'requires_registration',
        'registered_count',
        'image_media_id',
        'cover_path',
        'gallery_paths',
        'youtube_url',
        'status',
        'is_featured',
    ];

    protected $casts = [
        'title_i18n' => 'array',
        'description_i18n' => 'array',
        'gallery_paths' => 'array',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'is_recurring' => 'boolean',
        'requires_registration' => 'boolean',
        'is_featured' => 'boolean',
        'capacity' => 'integer',
        'registered_count' => 'integer',
    ];

    protected static function booted(): void
    {
        static::saving(function (MosqueEvent $event): void {
            if ($event->status === 'cancelled') {
                return;
            }

            $event->status = $event->computeStatus();
        });
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function speaker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'speaker_id');
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'image_media_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class, 'event_id');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming')
            ->where('start_at', '>', now())
            ->orderBy('start_at');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function getTitle(string $locale = 'fr'): ?string
    {
        return $this->title_i18n[$locale] ?? $this->title_i18n['fr'] ?? null;
    }

    public function scopePublicList($query)
    {
        return $query
            ->where(function ($query): void {
                $query->where('status', '!=', 'cancelled')
                    ->orWhereNull('status');
            })
            ->orderByDesc('is_featured')
            ->orderBy('start_at');
    }

    /** Statut dérivé des dates (sauf annulé). */
    public function computeStatus(): string
    {
        $now = now();
        $start = $this->start_at;
        $end = $this->end_at ?? $this->start_at?->copy()->addHours(3);

        if (! $start) {
            return 'upcoming';
        }

        if ($end && $end->isPast()) {
            return 'completed';
        }

        if ($start->lte($now) && (! $end || $end->gte($now))) {
            return 'ongoing';
        }

        return 'upcoming';
    }

    public function syncStatusFromDates(bool $save = true): void
    {
        if ($this->status === 'cancelled') {
            return;
        }

        $computed = $this->computeStatus();
        if ($this->status !== $computed) {
            $this->status = $computed;
            if ($save && $this->exists) {
                $this->saveQuietly();
            }
        }
    }

    public function coverUrl(): ?string
    {
        $path = $this->cover_path;

        if (is_array($path)) {
            $path = reset($path) ?: null;
        }

        if (is_string($path) && trim($path) !== '') {
            $path = ltrim(str_replace('\\', '/', trim($path)), '/');

            return Storage::disk('public')->url($path);
        }

        return $this->image?->url();
    }

    /**
     * @return list<string>
     */
    public function galleryUrls(): array
    {
        $paths = $this->gallery_paths;
        if (! is_array($paths)) {
            $paths = [];
        }

        $urls = [];
        foreach ($paths as $path) {
            if (is_array($path)) {
                $path = reset($path) ?: null;
            }
            if (! is_string($path) || trim($path) === '') {
                continue;
            }
            $path = ltrim(str_replace('\\', '/', trim($path)), '/');
            $urls[] = Storage::disk('public')->url($path);
        }

        $cover = $this->coverUrl();
        if ($cover && ! in_array($cover, $urls, true)) {
            array_unshift($urls, $cover);
        }

        return array_values(array_unique($urls));
    }

    public function isFinished(): bool
    {
        return $this->computeStatus() === 'completed' || $this->status === 'completed';
    }

    public function isFull(): bool
    {
        return $this->capacity && $this->registered_count >= $this->capacity;
    }

    public function canRegister(): bool
    {
        return $this->requires_registration
            && ! $this->isFinished()
            && ! $this->isFull()
            && $this->status !== 'cancelled'
            && $this->computeStatus() !== 'completed';
    }
}
