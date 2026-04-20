<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;
use App\Http\Resources\PartidoResource;

#[OA\Schema(
    schema: 'TorneoResource',
    type: 'object',
    properties: [
        new OA\Property(property: 'tor_id', type: 'integer'),
        new OA\Property(property: 'tor_desc', type: 'string'),
        new OA\Property(property: 'tor_nivel', type: 'string'),
        new OA\Property(property: 'tor_anio', type: 'integer'),
        new OA\Property(property: 'stats', type: 'object', properties: [
            new OA\Property(property: 'pj', type: 'integer'),
            new OA\Property(property: 'pg', type: 'integer'),
            new OA\Property(property: 'pe', type: 'integer'),
            new OA\Property(property: 'pp', type: 'integer'),
            new OA\Property(property: 'gf', type: 'integer'),
            new OA\Property(property: 'gc', type: 'integer'),
            new OA\Property(property: 'dg', type: 'integer'),
            new OA\Property(property: 'puntos', type: 'integer'),
            new OA\Property(property: 'vallas_invictas', type: 'integer'),
            new OA\Property(property: 'efectividad', type: 'number', format: 'float'),
        ])
    ]
)]
class TorneoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user('sanctum');
        $isPremium = $user && $user->isPremium();
        
        $data = [
            'tor_id' => $this->tor_id,
            'tor_desc' => $this->tor_desc,
            'tor_nivel' => $this->tor_nivel,
            'tor_anio' => $this->anio,
            'top_scorers' => $this->top_scorers,
        ];

        // Basic stats for everyone
        $stats = $this->stats;
        
        if ($isPremium) {
            $data['stats'] = $stats;
        } else {
            // Limited stats for free users
            $data['stats'] = [
                'pj' => $stats['pj'],
                'pg' => $stats['pg'],
                'pe' => $stats['pe'],
                'pp' => $stats['pp'],
                // Hide advanced stats for non-premium
                'gf' => null,
                'gc' => null,
                'dg' => null,
                'puntos' => null,
                'vallas_invictas' => null,
                'efectividad' => null,
            ];
        }

        if ($this->relationLoaded('partidos')) {
            $data['partidos'] = PartidoResource::collection($this->partidos);
        }

        return $data;
    }
}
