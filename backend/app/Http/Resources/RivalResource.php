<?php

namespace App\Http\Resources;

use App\Models\Setting;
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
        new OA\Property(property: 'river_shield', type: 'string', nullable: true),
        new OA\Property(property: 'stats', type: 'object'),
        new OA\Property(property: 'top_scorers', type: 'array', items: new OA\Items(type: 'object')),
        new OA\Property(property: 'goles_por_periodo', type: 'array', items: new OA\Items(type: 'object')),
        new OA\Property(property: 'goles_por_tipo', type: 'array', items: new OA\Items(type: 'object')),
        new OA\Property(property: 'partidos', type: 'array', items: new OA\Items(ref: '#/components/schemas/PartidoResource')),
        new OA\Property(property: 'is_premium_restricted', type: 'boolean'),
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
        $user = auth('sanctum')->user();
        $isPremium = $user && $user->isPremium();

        $partidosCollection = $this->whenLoaded('partidos');
        $isRestricted = false;

        // Si es la vista de detalle (relación partidos cargada)
        if ($this->relationLoaded('partidos')) {
            if (!$isPremium) {
                // Restringimos a los últimos 10 partidos para usuarios free
                $totalPartidos = $partidosCollection->count();
                if ($totalPartidos > 10) {
                    $partidosCollection = $partidosCollection->sortByDesc('fecha')->take(10);
                    $isRestricted = true;
                }
            }
        }

        return [
            'ri_id' => $this->ri_id,
            'ri_desc' => $this->ri_desc,
            'escudo' => $this->escudo_url,
            'escudo_url' => $this->escudo_url,
            'river_shield' => Setting::getUrl('river_shield'),
            'stats' => $this->stats,
            'top_scorers' => $this->top_scorers,
            'goles_por_periodo' => $this->when($isPremium, $this->goles_por_periodo),
            'goles_por_tipo' => $this->when($isPremium, $this->goles_por_tipo),
            'partidos' => PartidoResource::collection($partidosCollection),
            'is_premium_restricted' => $isRestricted,
        ];
    }
}
