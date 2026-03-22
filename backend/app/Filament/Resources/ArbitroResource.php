<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ArbitroResource\Pages;
use App\Filament\Resources\ArbitroResource\RelationManagers;
use App\Models\Arbitro;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ArbitroResource extends Resource
{
    protected static ?string $model = Arbitro::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('ar_apno')
                    ->label('Nombre'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('ar_apno')
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
            'index' => Pages\ListArbitros::route('/'),
            'create' => Pages\CreateArbitro::route('/create'),
            'edit' => Pages\EditArbitro::route('/{record}/edit'),
        ];
    }
}
