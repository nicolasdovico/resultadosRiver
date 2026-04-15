<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TecnicoResource\Pages;
use App\Filament\Resources\TecnicoResource\RelationManagers;
use App\Models\Tecnico;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class TecnicoResource extends Resource
{
    protected static ?string $model = Tecnico::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Información del Técnico')
                    ->schema([
                        Forms\Components\TextInput::make('tec_ape_nom')
                            ->label('Nombre Completo')
                            ->maxLength(50)
                            ->required(),
                        Forms\Components\FileUpload::make('tec_foto')
                            ->label('Foto del Técnico')
                            ->image()
                            ->directory('fotos-tecnicos')
                            ->visibility('public')
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '3:4',
                                '2:3',
                                '1:1',
                            ])
                            ->extraAttributes([
                                'style' => 'object-position: top !important;',
                            ]),
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\DatePicker::make('desde')
                                    ->label('Desde'),
                                Forms\Components\DatePicker::make('hasta')
                                    ->label('Hasta'),
                            ]),
                        Forms\Components\TextInput::make('cargo')
                            ->label('Cargo')
                            ->maxLength(30)
                            ->default('Entrenador'),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('tec_foto')
                    ->label('Foto')
                    ->height(80)
                    ->extraImgAttributes([
                        'style' => 'object-position: top !important; object-fit: cover !important;',
                    ]),
                Tables\Columns\TextColumn::make('tec_ape_nom')
                    ->label('Nombre')
                    ->searchable(),
                Tables\Columns\TextColumn::make('desde')
                    ->label('Desde')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('hasta')
                    ->label('Hasta')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('cargo')
                    ->label('Cargo')
                    ->searchable(),
            ])
            ->defaultSort('tec_ape_nom')
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
            'index' => Pages\ListTecnicos::route('/'),
            'create' => Pages\CreateTecnico::route('/create'),
            'edit' => Pages\EditTecnico::route('/{record}/edit'),
        ];
    }
}
