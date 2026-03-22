<?php

namespace App\Filament\Resources\PartidoResource\Pages;

use App\Filament\Resources\PartidoResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListPartidos extends ListRecords
{
    protected static string $resource = PartidoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
