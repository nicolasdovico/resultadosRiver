<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FaseResource\Pages;
use App\Filament\Resources\FaseResource\RelationManagers;
use App\Models\Fase;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class FaseResource extends Resource
{
    protected static ?string $model = Fase::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('fase')
                    ->maxLength(50),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('fase')
                    ->searchable()
                    ->sortable(),
            ])
            ->defaultSort('fase', 'asc')
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
            'index' => Pages\ListFases::route('/'),
            'create' => Pages\CreateFase::route('/create'),
            'edit' => Pages\EditFase::route('/{record}/edit'),
        ];
    }
}
