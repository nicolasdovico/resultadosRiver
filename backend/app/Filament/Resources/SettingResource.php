<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SettingResource\Pages;
use App\Filament\Resources\SettingResource\RelationManagers;
use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class SettingResource extends Resource
{
    protected static ?string $model = Setting::class;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('key')
                    ->required()
                    ->maxLength(255)
                    ->disabled(fn (?Setting $record) => $record !== null),
                Forms\Components\Textarea::make('value')
                    ->visible(fn (Forms\Get $get) => !in_array($get('key'), ['river_shield', 'goals_cataloged_since']))
                    ->columnSpanFull(),
                Forms\Components\DatePicker::make('value')
                    ->label('Datos catalogados desde')
                    ->native(false)
                    ->displayFormat('d/m/Y')
                    ->formatStateUsing(fn (?string $state) => $state)
                    ->dehydrateStateUsing(fn ($state) => $state)
                    ->visible(fn (Forms\Get $get) => $get('key') === 'goals_cataloged_since')
                    ->columnSpanFull(),
                Forms\Components\FileUpload::make('value')
                    ->label('Escudo de River')
                    ->image()
                    ->directory('settings')
                    ->visible(fn (Forms\Get $get) => $get('key') === 'river_shield')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('key')
                    ->searchable(),
                Tables\Columns\TextColumn::make('value')
                    ->limit(50)
                    ->formatStateUsing(function (?string $state, Setting $record) {
                        if ($record->key === 'river_shield') {
                            return 'Imagen cargada';
                        }
                        if ($record->key === 'goals_cataloged_since' && $state) {
                            return \Carbon\Carbon::parse($state)->format('d/m/Y');
                        }
                        return $state;
                    }),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
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
            'index' => Pages\ListSettings::route('/'),
            'create' => Pages\CreateSetting::route('/create'),
            'edit' => Pages\EditSetting::route('/{record}/edit'),
        ];
    }
}
