<?php

namespace Modules\Mosque\Filament\Resources\EventResource\Pages;

use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Modules\Mosque\Filament\Resources\EventResource;
use Modules\Mosque\Models\MosqueEvent;

class EditEvent extends EditRecord
{
    protected static string $resource = EventResource::class;

    public function getTitle(): string|\Illuminate\Contracts\Support\Htmlable
    {
        return 'Modifier l’événement';
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (($this->data['is_cancelled'] ?? false) === true) {
            $data['status'] = 'cancelled';
        } else {
            $data['status'] = (new MosqueEvent(array_merge($this->record->attributesToArray(), $data)))->computeStatus();
        }

        return $data;
    }
}
