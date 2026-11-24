<?php

namespace Modules\Mosque\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $this->resource->syncStatusFromDates();

        $locale = $request->getPreferredLanguage(['fr', 'en', 'ar']) ?: 'fr';
        $title = $this->title_i18n[$locale] ?? $this->title_i18n['fr'] ?? '';
        $descriptionHtml = $this->description_i18n[$locale] ?? $this->description_i18n['fr'] ?? '';
        $descriptionText = trim(html_entity_decode(strip_tags((string) $descriptionHtml)));

        $speakerName = $this->speaker?->fullName() ?: $this->speaker_name;

        return [
            'id' => $this->id,
            'title' => $this->title_i18n,
            'title_localized' => $title,
            'description' => $this->description_i18n,
            'description_localized' => $descriptionText,
            'description_html' => $descriptionHtml,
            'type' => $this->type,
            'start_at' => $this->start_at?->toIso8601String(),
            'end_at' => $this->end_at?->toIso8601String(),
            'location' => $this->location,
            'location_details' => $this->location_details,
            'speaker' => $speakerName ? [
                'id' => $this->speaker?->id,
                'name' => $speakerName,
            ] : null,
            'capacity' => $this->capacity,
            'registered_count' => $this->registered_count,
            'requires_registration' => (bool) $this->requires_registration,
            'can_register' => $this->canRegister(),
            'is_finished' => $this->isFinished(),
            'is_full' => $this->isFull(),
            'image_url' => $this->coverUrl(),
            'gallery_urls' => $this->galleryUrls(),
            'youtube_url' => $this->youtube_url,
            'status' => $this->status,
            'is_featured' => (bool) $this->is_featured,
        ];
    }
}
