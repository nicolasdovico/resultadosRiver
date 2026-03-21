<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartidoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'torneo' => new TorneoResource($this->whenLoaded('torneo')),
            'rival' => new RivalResource($this->whenLoaded('rival')),
            'arbitro' => new ArbitroResource($this->whenLoaded('arbitro')),
            'estadio' => new EstadioResource($this->whenLoaded('estadio')),
            'condicion' => new CondicionResource($this->whenLoaded('condicion')),
            'fase' => new FaseResource($this->whenLoaded('fase')),
            'goles' => GolResource::collection($this->whenLoaded('goles')),
        ]);
    }
}
