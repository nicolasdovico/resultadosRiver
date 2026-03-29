<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(schema: 'FaseResource', properties: [new OA\Property(property: 'fa_desc', type: 'string')])]
class FaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_fase' => $this->id_fase,
            'fa_desc' => $this->fase,
        ];
    }
}
