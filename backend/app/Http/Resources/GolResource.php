<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'minutos' => $this->minutos,
            'tipo_gol' => $this->gol_penal,
            'periodo' => $this->periodo,
            'gol_parariver' => $this->gol_parariver,
            'jugador' => [
                'pl_id' => $this->jugador?->pl_id,
                'pl_apno' => $this->jugador?->pl_apno,
            ],
        ];
    }
}
