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

class TecnicoResource extends Resource
{
    protected static ?string $model = Tecnico::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationGroup = 'Archivo Histórico';
    protected static ?string $navigationLabel = 'Técnicos';
    protected static ?string $modelLabel = 'Técnico';
    protected static ?string $pluralModelLabel = 'Técnicos';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Información del Técnico')
                    ->schema([
                        Forms\Components\TextInput::make('tec_ape_nom')
                            ->label('Nombre Completo')
                            ->maxLength(100)
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
                    ]),

                Forms\Components\Section::make('Ciclos / Etapas de Conducción')
                    ->description('Administre los distintos ciclos o periodos en los que el técnico dirigió al club.')
                    ->schema([
                        Forms\Components\Repeater::make('ciclos')
                            ->relationship('ciclos')
                            ->schema([
                                Forms\Components\TextInput::make('numero_ciclo')
                                    ->label('N° Ciclo')
                                    ->numeric()
                                    ->default(1)
                                    ->required()
                                    ->columnSpan(1),
                                Forms\Components\DatePicker::make('desde')
                                    ->label('Fecha Desde')
                                    ->required()
                                    ->columnSpan(1),
                                Forms\Components\DatePicker::make('hasta')
                                    ->label('Fecha Hasta (Vacío = Actual)')
                                    ->columnSpan(1),
                                Forms\Components\Select::make('cargo')
                                    ->label('Cargo')
                                    ->options([
                                        'TITULAR' => 'TITULAR',
                                        'INTERINO' => 'INTERINO',
                                    ])
                                    ->default('TITULAR')
                                    ->required()
                                    ->columnSpan(1),
                                Forms\Components\TextInput::make('observaciones')
                                    ->label('Observaciones')
                                    ->maxLength(255)
                                    ->columnSpan(2),
                            ])
                            ->columns(6)
                            ->defaultItems(1)
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => 
                                isset($state['desde']) 
                                    ? "Ciclo #" . ($state['numero_ciclo'] ?? '1') . ": " . $state['desde'] . " a " . ($state['hasta'] ?? 'Actualidad') . " (" . ($state['cargo'] ?? 'TITULAR') . ")"
                                    : 'Nuevo Ciclo'
                            ),
                    ]),
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
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('ciclos_count')
                    ->counts('ciclos')
                    ->label('Ciclos')
                    ->badge()
                    ->color('danger')
                    ->sortable(),
                Tables\Columns\TextColumn::make('ciclos_resumen')
                    ->label('Periodos Históricos')
                    ->state(function (Tecnico $record) {
                        return $record->ciclos->map(fn($c) => "{$c->desde} a " . ($c->hasta ?? 'Actual') . " (" . trim($c->cargo) . ")")->join(' | ');
                    })
                    ->wrap(),
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
