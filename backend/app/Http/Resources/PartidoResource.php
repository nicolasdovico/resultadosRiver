<?php

namespace App\Http\Resources;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'PartidoResource',
    properties: [
        new OA\Property(property: 'fecha', type: 'string', format: 'date'),
        new OA\Property(property: 'goles_river', type: 'integer'),
        new OA\Property(property: 'goles_rival', type: 'integer'),
        new OA\Property(property: 'observaciones', type: 'string', nullable: true),
        new OA\Property(property: 'resultado', type: 'string', enum: ['G', 'E', 'P']),
        new OA\Property(property: 'torneo', ref: '#/components/schemas/TorneoResource'),
        new OA\Property(property: 'rival', ref: '#/components/schemas/RivalResource'),
        new OA\Property(property: 'arbitro', ref: '#/components/schemas/ArbitroResource'),
        new OA\Property(property: 'estadio', ref: '#/components/schemas/EstadioResource'),
        new OA\Property(property: 'condicion', ref: '#/components/schemas/CondicionResource'),
        new OA\Property(property: 'fase', ref: '#/components/schemas/FaseResource'),
        new OA\Property(property: 'tecnico', ref: '#/components/schemas/TecnicoResource'),
        new OA\Property(
            property: 'goles',
            type: 'array',
            items: new OA\Items(ref: '#/components/schemas/GolResource')
        )
    ]
)]
class PartidoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'fecha' => Carbon::parse($this->fecha)->format('Y-m-d'),
            'fecha_nro' => $this->fecha_nro,
            'goles_river' => $this->go_ri,
            'goles_rival' => $this->go_ad,
            'observaciones' => $this->observaciones,
            'resultado' => $this->when(isset($this->go_ri) && isset($this->go_ad), function() {
                if ($this->go_ri > $this->go_ad) return 'G';
                if ($this->go_ri < $this->go_ad) return 'P';
                return 'E';
            }),
            'torneo' => $this->whenLoaded('torneo_rel', function() {
                return [
                    'tor_id' => $this->torneo_rel->tor_id,
                    'tor_desc' => $this->torneo_rel->tor_desc,
                    'tor_nivel' => $this->torneo_rel->tor_nivel,
                    'tor_anio' => $this->torneo_rel->anio,
                ];
            }),
            'rival' => $this->whenLoaded('rival', function() {
                return [
                    'ri_id' => $this->rival->ri_id,
                    'ri_desc' => $this->rival->ri_desc,
                    'escudo' => $this->rival->escudo_url,
                    'escudo_url' => $this->rival->escudo_url,
                    'river_shield' => Setting::getUrl('river_shield'),
                    'is_premium_restricted' => false,
                ];
            }),
            'arbitro' => $this->whenLoaded('arbitro_rel', function() {
                return [
                    'ar_id' => $this->arbitro_rel->ar_id,
                    'ar_desc' => $this->arbitro_rel->ar_apno,
                ];
            }),
            'estadio' => $this->whenLoaded('estadio_rel', function() {
                return [
                    'es_id' => $this->estadio_rel->es_id,
                    'es_desc' => $this->estadio_rel->es_desc,
                    'river_shield' => Setting::getUrl('river_shield'),
                ];
            }),
            'condicion' => $this->whenLoaded('condicion_rel', function() {
                return [
                    'id_condicion' => $this->condicion_rel->id_condicion,
                    'co_desc' => $this->condicion_rel->co_desc ?? $this->condicion_rel->descripcion,
                ];
            }),
            'fase' => $this->whenLoaded('fase_rel', function() {
                return [
                    'id_fase' => $this->fase_rel->id_fase,
                    'fa_desc' => $this->fase_rel->fa_desc ?? $this->fase_rel->fase,
                ];
            }),
            'tecnico' => [
                'id_tecnicos' => $this->tecnico?->id_tecnicos,
                'tec_ape_nom' => $this->tecnico?->tec_ape_nom,
                'te_desc' => $this->tecnico?->tec_ape_nom,
                'cargo' => $this->tecnico?->cargo,
                'ciclo' => $this->ciclo ? [
                    'id' => $this->ciclo->id,
                    'numero_ciclo' => $this->ciclo->numero_ciclo,
                    'cargo' => $this->ciclo->cargo,
                    'desde' => $this->ciclo->desde,
                    'hasta' => $this->ciclo->hasta,
                ] : null,
            ],
            'goles' => GolResource::collection($this->whenLoaded('goles')),
        ];
    }
}
