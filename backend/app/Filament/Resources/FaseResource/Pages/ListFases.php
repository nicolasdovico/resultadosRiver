<?php

namespace App\Filament\Resources\FaseResource\Pages;

use App\Filament\Resources\FaseResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListFases extends ListRecords
{
    protected static string $resource = FaseResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
