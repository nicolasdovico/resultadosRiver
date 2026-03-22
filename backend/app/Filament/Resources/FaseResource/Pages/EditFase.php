<?php

namespace App\Filament\Resources\FaseResource\Pages;

use App\Filament\Resources\FaseResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditFase extends EditRecord
{
    protected static string $resource = FaseResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
