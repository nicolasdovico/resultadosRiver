<?php

namespace App\Filament\Resources;

use App\Filament\Resources\RivalResource\Pages;
use App\Filament\Resources\RivalResource\RelationManagers;
use App\Models\Rival;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class RivalResource extends Resource
{
    protected static ?string $model = Rival::class;

    protected static ?string $pluralLabel = 'Rivales';

    protected static ?string $modelLabel = 'Rival';

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('ri_desc')
                    ->label('Nombre'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('ri_desc')
                    ->label('Nombre')
                    ->searchable()
                    ->sortable(),
            ])
            ->defaultSort('ri_desc')
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
            'index' => Pages\ListRivals::route('/'),
            'create' => Pages\CreateRival::route('/create'),
            'edit' => Pages\EditRival::route('/{record}/edit'),
        ];
    }
}
