<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(schema: 'ArbitroResource', properties: [
    new OA\Property(property: 'ar_id', type: 'integer'),
    new OA\Property(property: 'ar_desc', type: 'string')
])]
class ArbitroResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'ar_id' => $this->ar_id,
            'ar_desc' => $this->ar_apno,
        ];
    }
}
