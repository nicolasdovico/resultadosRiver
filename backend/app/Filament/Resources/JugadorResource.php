<?php

namespace App\Filament\Resources;

use App\Filament\Resources\JugadorResource\Pages;
use App\Models\Jugador;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class JugadorResource extends Resource
{
    protected static ?string $model = Jugador::class;
    protected static ?string $pluralLabel = "Jugadores";
    protected static ?string $modelLabel = "Jugador";
    protected static ?string $navigationIcon = "heroicon-o-users";

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make("Información del Jugador")
                    ->schema([
                        Forms\Components\TextInput::make("pl_apno")
                            ->label("Nombre Completo")
                            ->required()
                            ->maxLength(255),
                        Forms\Components\FileUpload::make("pl_foto")
                            ->label("Foto del Jugador")
                            ->image()
                            ->directory("players-photos")
                            ->visibility("public")
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '3:4',
                                '2:3',
                                '1:1',
                            ])
                            ->extraAttributes([
                                'style' => 'object-position: top !important;',
                            ]),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make("pl_foto")
                    ->label("Foto")
                    ->height(80)
                    ->extraImgAttributes([
                        'style' => 'object-position: top !important; object-fit: cover !important;',
                    ]),
                Tables\Columns\TextColumn::make("pl_apno")
                    ->label("Nombre")
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make("goles_count")
                    ->label("Goles")
                    ->counts("goles")
                    ->sortable(),
            ])
            ->defaultSort("pl_apno")
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
        return [];
    }

    public static function getPages(): array
    {
        return [
            "index" => Pages\ListJugadors::route("/"),
            "create" => Pages\CreateJugador::route("/create"),
            "edit" => Pages\EditJugador::route("/{record}/edit"),
        ];
    }
}
