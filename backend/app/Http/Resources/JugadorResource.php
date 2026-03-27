<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'JugadorResource',
    properties: [
        new OA\Property(property: 'pl_id', type: 'integer'),
        new OA\Property(property: 'pl_apno', type: 'string'),
        new OA\Property(
            property: 'goles',
            type: 'array',
            items: new OA\Items(ref: '#/components/schemas/GolResource')
        )
    ]
)]
class JugadorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'pl_id' => $this->pl_id,
            'pl_apno' => $this->pl_apno,
            'goles' => GolResource::collection($this->whenLoaded('goles')),
        ];
    }
}
