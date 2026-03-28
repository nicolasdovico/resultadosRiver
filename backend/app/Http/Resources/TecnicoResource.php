<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TecnicoResource',
    properties: [
        new OA\Property(property: 'te_desc', type: 'string'),
        new OA\Property(property: 'cargo', type: 'string', nullable: true)
    ]
)]
class TecnicoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_tecnicos' => $this->id_tecnicos,
            'te_desc' => $this->tec_ape_nom,
            'cargo' => $this->cargo,
        ];
    }
}
