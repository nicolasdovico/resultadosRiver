<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'GolResource',
    properties: [
        new OA\Property(property: 'gol_id', type: 'integer'),
        new OA\Property(property: 'gol_fecha', type: 'string', format: 'date'),
        new OA\Property(property: 'minutos', type: 'integer'),
        new OA\Property(property: 'tipo_gol', type: 'integer'),
        new OA\Property(property: 'tipo_gol_desc', type: 'string', nullable: true),
        new OA\Property(property: 'periodo', type: 'integer'),
        new OA\Property(property: 'periodo_desc', type: 'string', nullable: true),
        new OA\Property(property: 'gol_parariver', type: 'integer', description: '1: River, 2: Rival'),
        new OA\Property(
            property: 'partido',
            type: 'object',
            properties: [
                new OA\Property(property: 'go_ri', type: 'integer'),
                new OA\Property(property: 'go_ad', type: 'integer'),
                new OA\Property(property: 'rival', ref: '#/components/schemas/RivalResource')
            ]
        ),
        new OA\Property(
            property: 'jugador',
            type: 'object',
            properties: [
                new OA\Property(property: 'pl_id', type: 'integer'),
                new OA\Property(property: 'pl_apno', type: 'string')
            ]
        )
    ]
)]
class GolResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'gol_id' => $this->gol_id,
            'gol_fecha' => $this->gol_fecha,
            'minutos' => $this->minutos,
            'tipo_gol' => $this->gol_penal,
            'tipo_gol_desc' => trim($this->tipo_gol_rel?->tipo_gol_descripcion),
            'periodo' => $this->periodo,
            'periodo_desc' => trim($this->periodo_rel?->periodo_desc),
            'gol_parariver' => $this->gol_parariver,
            'partido' => [
                'go_ri' => $this->partido?->go_ri,
                'go_ad' => $this->partido?->go_ad,
                'rival' => new RivalResource($this->partido?->rival),
            ],
            'jugador' => [
                'pl_id' => $this->jugador?->pl_id,
                'pl_apno' => $this->jugador?->pl_apno,
            ],
        ];
    }
}
