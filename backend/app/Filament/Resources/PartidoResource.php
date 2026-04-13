<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PartidoResource\Pages;
use App\Models\Partido;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PartidoResource extends Resource
{
    protected static ?string $model = Partido::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Grid::make(3)
                    ->schema([
                        // Columna Izquierda: Datos del Encuentro
                        Forms\Components\Group::make()
                            ->schema([
                                Forms\Components\Section::make('Información del Partido')
                                    ->extraAttributes(['style' => 'background-color: #e0f2fe; border: 1px solid #bae6fd;'])
                                    ->schema([
                                        Forms\Components\DatePicker::make('fecha')
                                            ->label('Fecha')
                                            ->required()
                                            ->live()
                                            ->native(false)
                                            ->displayFormat('d/m/Y'),
                                        Forms\Components\Select::make('torneo')
                                            ->label('Torneo')
                                            ->relationship('torneo_rel', 'tor_desc')
                                            ->searchable()
                                            ->preload()
                                            ->required()
                                            ->createOptionForm([
                                                Forms\Components\TextInput::make('tor_desc')
                                                    ->label('Nombre')
                                                    ->required(),
                                                Forms\Components\Select::make('tor_nivel')
                                                    ->label('Nivel')
                                                    ->options([
                                                        'Nacional' => 'Nacional',
                                                        'Internacional' => 'Internacional',
                                                    ])
                                                    ->required(),
                                            ]),
                                        Forms\Components\Grid::make(2)
                                            ->schema([
                                                Forms\Components\TextInput::make('fecha_nro')
                                                    ->label('Fecha Nro')
                                                    ->numeric(),
                                                Forms\Components\Select::make('fase')
                                                    ->label('Fase')
                                                    ->relationship(
                                                        name: 'fase_rel',
                                                        titleAttribute: 'fase',
                                                        modifyQueryUsing: fn (Builder $query) => $query->orderBy('fase', 'asc'),
                                                    )
                                                    ->searchable()
                                                    ->preload()
                                                    ->createOptionForm([
                                                        Forms\Components\TextInput::make('fase')
                                                            ->label('Nombre de la Fase')
                                                            ->required()
                                                            ->maxLength(50),
                                                    ]),
                                            ]),
                                    ])->compact(),

                                Forms\Components\Section::make('Detalles del Partido')
                                    ->extraAttributes(['style' => 'background-color: #dcfce7; border: 1px solid #bbf7d0;'])
                                    ->schema([
                                        Forms\Components\Select::make('adversario')
                                            ->label('Rival')
                                            ->relationship('rival', 'ri_desc')
                                            ->searchable()
                                            ->preload()
                                            ->required()
                                            ->createOptionForm([
                                                Forms\Components\TextInput::make('ri_desc')
                                                    ->label('Nombre')
                                                    ->required(),
                                                Forms\Components\FileUpload::make('escudo')
                                                    ->label('Escudo')
                                                    ->image()
                                                    ->disk('public')
                                                    ->directory('rivales')
                                                    ->visibility('public')
                                                    ->maxSize(2048)
                                                    ->nullable(),
                                            ]),
                                        Forms\Components\Select::make('condicion')
                                            ->label('Condición')
                                            ->relationship('condicion_rel', 'descripcion')
                                            ->searchable()
                                            ->preload(),
                                        Forms\Components\Select::make('estadio')
                                            ->label('Estadio')
                                            ->relationship('estadio_rel', 'es_desc')
                                            ->searchable()
                                            ->preload()
                                            ->createOptionForm([
                                                Forms\Components\TextInput::make('es_desc')
                                                    ->label('Nombre')
                                                    ->required(),
                                            ]),
                                        Forms\Components\Select::make('arbitro')
                                            ->label('Arbitro')
                                            ->relationship('arbitro_rel', 'ar_apno')
                                            ->searchable()
                                            ->preload()
                                            ->createOptionForm([
                                                Forms\Components\TextInput::make('ar_apno')
                                                    ->label('Nombre')
                                                    ->required(),
                                            ]),
                                    ])->compact(),
                            ])->columnSpan(2),

                        // Columna Derecha: Resultado y Observaciones
                        Forms\Components\Group::make()
                            ->schema([
                                Forms\Components\Section::make('Resultado Final')
                                    ->extraAttributes(['style' => 'background-color: #f4f4f5; border: 1px solid #e4e4e7;'])
                                    ->schema([
                                        Forms\Components\Grid::make(2)
                                            ->schema([
                                                Forms\Components\TextInput::make('go_ri')
                                                    ->label('River')
                                                    ->numeric()
                                                    ->default(0)
                                                    ->live()
                                                    ->extraInputAttributes(['class' => 'text-center text-2xl font-bold', 'style' => 'background-color: white;']),
                                                Forms\Components\TextInput::make('go_ad')
                                                    ->label('Rival')
                                                    ->numeric()
                                                    ->default(0)
                                                    ->live()
                                                    ->extraInputAttributes(['class' => 'text-center text-2xl font-bold', 'style' => 'background-color: white;']),
                                            ]),
                                    ])->compact(),

                                Forms\Components\Section::make('Notas')
                                    ->extraAttributes(['style' => 'background-color: #fef3c7; border: 1px solid #fde68a;'])
                                    ->schema([
                                        Forms\Components\Textarea::make('observaciones')
                                            ->label(false)
                                            ->placeholder('Observaciones del partido...')
                                            ->rows(5)
                                            ->extraInputAttributes(['style' => 'background-color: white;']),
                                    ])->compact(),
                            ])->columnSpan(1),
                    ]),

                // Sección inferior: Goles
                Forms\Components\Section::make('Goles del Partido')
                    ->extraAttributes(['style' => 'background-color: #ecfdf5; border: 1px solid #d1fae5;'])
                    ->description(fn (Forms\Get $get) => "Se deben cargar " . ((int) $get('go_ri') + (int) $get('go_ad')) . " goles en total.")
                    ->schema([
                        Forms\Components\Repeater::make('goles')
                            ->relationship('goles')
                            ->schema([
                                Forms\Components\Grid::make(5)
                                    ->schema([
                                        Forms\Components\Select::make('gol_juga')
                                            ->label('Jugador')
                                            ->relationship('jugador', 'pl_apno')
                                            ->searchable()
                                            ->preload()
                                            ->required()
                                            ->columnSpan(2)
                                            ->createOptionForm([
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
                                                    ]),
                                            ]),
                                        Forms\Components\Select::make('gol_parariver')
                                            ->label('Equipo')
                                            ->options([1 => 'River', 2 => 'Rival'])
                                            ->required()
                                            ->default(1),
                                        Forms\Components\TextInput::make('minutos')
                                            ->label('Minuto')
                                            ->numeric()
                                            ->required(),
                                        Forms\Components\Select::make('periodo')
                                            ->label('Periodo')
                                            ->relationship('periodo_rel', 'periodo_desc')
                                            ->required(),
                                        Forms\Components\Select::make('gol_penal')
                                            ->label('Tipo')
                                            ->relationship('tipo_gol_rel', 'tipo_gol_descripcion')
                                            ->required()
                                            ->columnSpanFull(),
                                    ]),
                                Forms\Components\Hidden::make('gol_fecha')
                                    ->default(fn (Forms\Get $get) => $get('../../fecha')),
                            ])
                            ->itemLabel(fn (array $state): ?string => 
                                ($state['gol_parariver'] == 2 ? '[RIVAL] ' : '') . 
                                (\App\Models\Jugador::find($state['gol_juga'])?->pl_apno ?? 'Gol') .
                                ($state['minutos'] ? " ({$state['minutos']}')" : "")
                            )
                            ->maxItems(fn (Forms\Get $get) => (int) $get('go_ri') + (int) $get('go_ad'))
                            ->rules([
                                fn (Forms\Get $get): \Closure => function (string $attribute, $value, \Closure $fail) use ($get) {
                                    $totalEsperado = (int) $get('go_ri') + (int) $get('go_ad');
                                    $totalCargado = is_array($value) ? count($value) : 0;
                                    if ($totalCargado !== $totalEsperado) {
                                        $fail("Faltan goles por cargar. El resultado indica {$totalEsperado} goles.");
                                    }
                                },
                            ])
                            ->addActionLabel('Añadir Gol')
                            ->collapsible()
                            ->collapsed(fn (string $operation) => $operation === 'edit')
                            ->defaultItems(0),
                    ]),
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
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('torneo_rel.tor_desc')
                    ->label('Torneo')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('rival.ri_desc')
                    ->label('Rival')
                    ->sortable()
                    ->searchable(),
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
                Tables\Filters\Filter::make('fecha')
                    ->form([
                        Forms\Components\DatePicker::make('fecha_exacta')
                            ->label('Buscar por fecha exacta')
                            ->displayFormat('d/m/Y'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['fecha_exacta'],
                                fn (Builder $query, $date): Builder => $query->whereDate('fecha', $date),
                            );
                    })
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
