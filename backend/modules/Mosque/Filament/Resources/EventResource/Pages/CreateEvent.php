<?php

namespace Modules\Mosque\Filament\Resources\EventResource\Pages;

use Filament\Resources\Pages\CreateRecord;
use Modules\Mosque\Filament\Resources\EventResource;
use Modules\Mosque\Models\MosqueEvent;

class CreateEvent extends CreateRecord
{
    protected static string $resource = EventResource::class;

    public function getTitle(): string|\Illuminate\Contracts\Support\Htmlable
    {
        return 'Nouvel événement';
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        if (($this->data['is_cancelled'] ?? false) === true) {
            $data['status'] = 'cancelled';
        } else {
            $data['status'] = (new MosqueEvent($data))->computeStatus();
        }

        return $data;
    }
}
