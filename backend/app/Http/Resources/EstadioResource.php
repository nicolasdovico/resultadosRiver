<?php

namespace App\Http\Resources;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'EstadioResource',
    type: 'object',
    properties: [
        new OA\Property(property: 'es_id', type: 'integer'),
        new OA\Property(property: 'es_desc', type: 'string'),
        new OA\Property(property: 'river_shield', type: 'string', nullable: true),
        new OA\Property(property: 'stats', type: 'object'),
        new OA\Property(property: 'top_scorers', type: 'array', items: new OA\Items(type: 'object')),
        new OA\Property(property: 'streaks', type: 'object', properties: [
            new OA\Property(property: 'invincibility', type: 'object', nullable: true),
            new OA\Property(property: 'drought', type: 'object', nullable: true),
        ]),
        new OA\Property(property: 'last_won_match', type: 'object', nullable: true),
        new OA\Property(property: 'last_lost_match', type: 'object', nullable: true),
        new OA\Property(property: 'goles_por_periodo', type: 'array', items: new OA\Items(type: 'object')),
        new OA\Property(property: 'goles_por_tipo', type: 'array', items: new OA\Items(type: 'object')),
        new OA\Property(property: 'partidos', type: 'array', items: new OA\Items(ref: '#/components/schemas/PartidoResource')),
        new OA\Property(property: 'is_premium_restricted', type: 'boolean'),
    ]
)]
class EstadioResource extends JsonResource
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
        $hasPartidos = $this->relationLoaded('partidos');
        $isTopEndpoint = $request->is('*/estadios/top') || $request->routeIs('*.top');
        $isDetail = $hasPartidos && !$isTopEndpoint;

        // If detail view (matches relation is loaded and not top list)
        if ($isDetail) {
            if (!$isPremium) {
                // Restrict to last 3 matches for free users
                $totalPartidos = $partidosCollection->count();
                if ($totalPartidos > 3) {
                    $partidosCollection = $partidosCollection->sortByDesc('fecha')->take(3);
                    $isRestricted = true;
                }
            }
        }

        return [
            'es_id' => $this->es_id,
            'es_desc' => $this->es_desc,
            'river_shield' => Setting::getUrl('river_shield'),
            'stats' => $this->when($hasPartidos || $isTopEndpoint, $this->stats),
            'top_scorers' => $this->when($isDetail, $this->top_scorers),
            'streaks' => $this->when($isDetail, $this->streaks),
            'last_won_match' => $this->when($isDetail, $this->last_won_match),
            'last_lost_match' => $this->when($isDetail, $this->last_lost_match),
            'goles_por_periodo' => $this->when($isPremium && $isDetail, $this->goles_por_periodo),
            'goles_por_tipo' => $this->when($isPremium && $isDetail, $this->goles_por_tipo),
            'partidos' => $this->when($isDetail, PartidoResource::collection($partidosCollection)),
            'is_premium_restricted' => $isRestricted,
        ];
    }
}
