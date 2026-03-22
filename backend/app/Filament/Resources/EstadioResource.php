<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EstadioResource\Pages;
use App\Filament\Resources\EstadioResource\RelationManagers;
use App\Models\Estadio;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class EstadioResource extends Resource
{
    protected static ?string $model = Estadio::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('es_desc')
                    ->label('Nombre'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('es_desc')
                    ->label('Nombre')
                    ->searchable()
                    ->sortable(),
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
            'index' => Pages\ListEstadios::route('/'),
            'create' => Pages\CreateEstadio::route('/create'),
            'edit' => Pages\EditEstadio::route('/{record}/edit'),
        ];
    }
}
