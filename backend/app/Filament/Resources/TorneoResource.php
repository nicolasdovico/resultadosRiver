<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TorneoResource\Pages;
use App\Filament\Resources\TorneoResource\RelationManagers;
use App\Models\Torneo;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class TorneoResource extends Resource
{
    protected static ?string $model = Torneo::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Textarea::make('tor_desc')
                    ->columnSpanFull(),
                Forms\Components\Textarea::make('tor_nivel')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                //
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTorneos::route('/'),
            'create' => Pages\CreateTorneo::route('/create'),
            'edit' => Pages\EditTorneo::route('/{record}/edit'),
        ];
    }
}
