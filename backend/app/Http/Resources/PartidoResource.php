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
        return [
            'fecha' => $this->fecha->format('Y-m-d'),
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
            'goles' => GolResource::collection($this->whenLoaded('goles')),
        ];
    }
}
