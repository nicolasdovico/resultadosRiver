<?php

namespace App\Filament\Resources\PartidoResource\Pages;

use App\Filament\Resources\PartidoResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPartido extends EditRecord
{
    protected static string $resource = PartidoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
