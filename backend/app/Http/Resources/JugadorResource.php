<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "JugadorResource",
    properties: [
        new OA\Property(property: "pl_id", type: "integer"),
        new OA\Property(property: "pl_apno", type: "string"),
        new OA\Property(property: "pl_foto", type: "string", nullable: true, description: "URL de la foto del jugador (Solo Premium)"),
        new OA\Property(property: "goles_count", type: "integer"),
        new OA\Property(
            property: "goles",
            type: "array",
            items: new OA\Items(ref: "#/components/schemas/GolResource")
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
        $isPremium = $request->user() && $request->user()->isPremium();
        
        // Historial de goles: si no es premium, limitamos a 5.
        $golesCollection = $this->whenLoaded("goles");
        if (!$isPremium && $this->relationLoaded("goles")) {
            $golesCollection = $this->goles->take(5);
        }

        return [
            "pl_id" => $this->pl_id,
            "pl_apno" => $this->pl_apno,
            "pl_foto" => $this->pl_foto ? Storage::disk("public")->url($this->pl_foto) : null,
            "goles_count" => $this->whenCounted("goles"),
            "goles" => GolResource::collection($golesCollection),
            "is_premium_restricted" => !$isPremium
        ];
    }
}
