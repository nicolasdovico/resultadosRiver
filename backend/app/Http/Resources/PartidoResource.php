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
            'torneo' => new TorneoResource($this->whenLoaded('torneo_rel')),
            'rival' => new RivalResource($this->whenLoaded('rival')),
            'arbitro' => new ArbitroResource($this->whenLoaded('arbitro_rel')),
            'estadio' => new EstadioResource($this->whenLoaded('estadio_rel')),
            'condicion' => new CondicionResource($this->whenLoaded('condicion_rel')),
            'fase' => new FaseResource($this->whenLoaded('fase_rel')),
            'goles' => GolResource::collection($this->whenLoaded('goles')),
        ]);
    }
}
