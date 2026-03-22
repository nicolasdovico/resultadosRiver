<?php

namespace App\Filament\Resources\RivalResource\Pages;

use App\Filament\Resources\RivalResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListRivals extends ListRecords
{
    protected static string $resource = RivalResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
