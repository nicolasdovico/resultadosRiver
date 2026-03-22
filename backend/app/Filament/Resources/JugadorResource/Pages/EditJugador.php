<?php

namespace App\Filament\Resources\JugadorResource\Pages;

use App\Filament\Resources\JugadorResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditJugador extends EditRecord
{
    protected static string $resource = JugadorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
