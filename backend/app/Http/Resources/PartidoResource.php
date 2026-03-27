<?php

namespace App\Http\Resources;

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
            'goles_river' => $this->go_ri,
            'goles_rival' => $this->go_ad,
            'observaciones' => $this->observaciones,
            'resultado' => $this->when(isset($this->go_ri) && isset($this->go_ad), function() {
                if ($this->go_ri > $this->go_ad) return 'G';
                if ($this->go_ri < $this->go_ad) return 'P';
                return 'E';
            }),
            'torneo' => new TorneoResource($this->whenLoaded('torneo_rel')),
            'rival' => new RivalResource($this->whenLoaded('rival')),
            'arbitro' => new ArbitroResource($this->whenLoaded('arbitro_rel')),
            'estadio' => new EstadioResource($this->whenLoaded('estadio_rel')),
            'condicion' => new CondicionResource($this->whenLoaded('condicion_rel')),
            'fase' => new FaseResource($this->whenLoaded('fase_rel')),
            'tecnico' => new TecnicoResource($this->whenLoaded('tecnico_rel')),
            'goles' => GolResource::collection($this->whenLoaded('goles')),
        ];
    }
}
