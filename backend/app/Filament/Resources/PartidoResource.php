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
                Forms\Components\DatePicker::make('fecha')
                    ->required(),
                Forms\Components\Select::make('torneo')
                    ->relationship('torneo_rel', 'tor_desc')
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('adversario')
                    ->relationship('rival', 'ri_desc')
                    ->searchable()
                    ->preload(),
                # El campo arbitro es 'arbitro' en la tabla estadisticas
                Forms\Components\Select::make('arbitro')
                    ->relationship('arbitro_rel', 'ar_apno')
                    ->searchable()
                    ->preload(),
                Forms\Components\TextInput::make('go_ri')
                    ->label('Goles River')
                    ->numeric(),
                Forms\Components\TextInput::make('go_ad')
                    ->label('Goles Rival')
                    ->numeric(),
                Forms\Components\Select::make('estadio')
                    ->relationship('estadio_rel', 'es_desc')
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('condicion')
                    ->relationship('condicion_rel', 'descripcion')
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('fase')
                    ->relationship(
                        name: 'fase_rel',
                        titleAttribute: 'fase',
                        modifyQueryUsing: fn (Builder $query) => $query->orderBy('fase', 'asc'),
                    )
                    ->searchable()
                    ->preload(),
                Forms\Components\TextInput::make('fecha_nro')
                    ->label('Fecha Nro')
                    ->numeric(),
                Forms\Components\Textarea::make('observaciones')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('fecha_nro')
                    ->label('Fecha')
                    ->sortable(),
                Tables\Columns\TextColumn::make('fecha')
                    ->label('Día')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('torneo_rel.tor_desc')
                    ->label('Torneo')
                    ->sortable(),
                Tables\Columns\TextColumn::make('rival.ri_desc')
                    ->label('Rival')
                    ->sortable(),
                Tables\Columns\TextColumn::make('go_ri')
                    ->label('LP')
                    ->sortable(),
                Tables\Columns\TextColumn::make('go_ad')
                    ->label('LV')
                    ->sortable(),
                Tables\Columns\TextColumn::make('condicion_rel.descripcion')
                    ->label('Condición')
                    ->sortable(),
                Tables\Columns\TextColumn::make('estadio_rel.es_desc')
                    ->label('Estadio')
                    ->sortable(),
                Tables\Columns\TextColumn::make('fase_rel.fase')
                    ->label('Fase')
                    ->sortable(),
                Tables\Columns\TextColumn::make('arbitro_rel.ar_apno')
                    ->label('Arbitro')
                    ->sortable(),
            ])
            ->defaultSort('fecha', 'desc')
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
