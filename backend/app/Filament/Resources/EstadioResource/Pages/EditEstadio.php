<?php

namespace App\Filament\Resources\EstadioResource\Pages;

use App\Filament\Resources\EstadioResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditEstadio extends EditRecord
{
    protected static string $resource = EstadioResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
