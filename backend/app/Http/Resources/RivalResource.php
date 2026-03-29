<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'RivalResource',
    type: 'object',
    properties: [
        new OA\Property(property: 'ri_id', type: 'integer'),
        new OA\Property(property: 'ri_desc', type: 'string'),
        new OA\Property(property: 'escudo', type: 'string', nullable: true),
        new OA\Property(property: 'escudo_url', type: 'string', nullable: true),
    ]
)]
class RivalResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'ri_id' => $this->ri_id,
            'ri_desc' => $this->ri_desc,
            'escudo' => $this->escudo,
            'escudo_url' => $this->escudo_url,
        ];
    }
}
