<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PartidoResource\Pages;
use App\Filament\Resources\PartidoResource\RelationManagers;
use App\Models\Partido;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class PartidoResource extends Resource
{
    protected static ?string $model = Partido::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('torneo')
                    ->numeric(),
                Forms\Components\TextInput::make('adversario')
                    ->numeric(),
                Forms\Components\TextInput::make('arbitro')
                    ->numeric(),
                Forms\Components\TextInput::make('go_ri')
                    ->numeric(),
                Forms\Components\TextInput::make('go_ad')
                    ->numeric(),
                Forms\Components\TextInput::make('estadio')
                    ->numeric(),
                Forms\Components\TextInput::make('condicion')
                    ->numeric(),
                Forms\Components\Textarea::make('observaciones')
                    ->columnSpanFull(),
                Forms\Components\TextInput::make('fase')
                    ->numeric(),
                Forms\Components\TextInput::make('fecha_nro')
                    ->numeric(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('fecha')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('torneo')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('adversario')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('arbitro')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('go_ri')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('go_ad')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('estadio')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('condicion')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('fase')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('fecha_nro')
                    ->numeric()
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
            'index' => Pages\ListPartidos::route('/'),
            'create' => Pages\CreatePartido::route('/create'),
            'edit' => Pages\EditPartido::route('/{record}/edit'),
        ];
    }
}
