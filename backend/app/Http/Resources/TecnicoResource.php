<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'TecnicoResource',
    properties: [
        new OA\Property(property: 'id_tecnicos', type: 'integer'),
        new OA\Property(property: 'tec_ape_nom', type: 'string'),
        new OA\Property(property: 'te_desc', type: 'string'),
        new OA\Property(property: 'desde', type: 'string', format: 'date', nullable: true),
        new OA\Property(property: 'hasta', type: 'string', format: 'date', nullable: true),
        new OA\Property(property: 'cargo', type: 'string', nullable: true),
        new OA\Property(property: 'partidos_count', type: 'integer'),
        new OA\Property(property: 'is_premium_restricted', type: 'boolean'),
        new OA\Property(property: 'stats', type: 'object'),
        new OA\Property(property: 'partidos', type: 'array', items: new OA\Items(ref: '#/components/schemas/PartidoResource')),
        new OA\Property(property: 'partidos_meta', type: 'object')
    ]
)]
class TecnicoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = auth("sanctum")->user();
        $isPremium = $user && $user->isPremium();
        
        $stats = $this->stats;
        $partidosMeta = null;
        $isRestricted = false;

        $partidosQuery = $this->getPartidosQuery()
            ->with(['rival', 'torneo_rel', 'fase_rel'])
            ->orderBy('fecha', 'desc');

        $isDetail = $request->routeIs('*.show') || $request->is('*/tecnicos/*');

        if ($isDetail) {
            $perPage = 15;
            $partidosPaginator = $partidosQuery->paginate($perPage);
            $partidosCollection = $partidosPaginator->getCollection();

            $partidosMeta = [
                "current_page" => $partidosPaginator->currentPage(),
                "last_page" => $partidosPaginator->lastPage(),
                "total" => $partidosPaginator->total(),
            ];

            if (!$isPremium) {
                $isRestricted = true;
                if ($partidosPaginator->currentPage() === 1) {
                    $partidosCollection = $partidosCollection->take(5);
                } else {
                    $partidosCollection = collect([]);
                }
            }
            
            $partidos = PartidoResource::collection($partidosCollection);
        } else {
            $partidos = null;
        }

        return [
            'id_tecnicos' => $this->id_tecnicos,
            'tec_ape_nom' => trim($this->tec_ape_nom),
            'te_desc' => trim($this->tec_ape_nom), // Compatibilidad
            'desde' => $this->desde,
            'hasta' => $this->hasta,
            'cargo' => trim($this->cargo),
            'partidos_count' => $stats['pj'],
            'stats' => $stats,
            'is_premium_restricted' => $isRestricted,
            'partidos' => $this->when($isDetail, $partidos ?? []),
            'partidos_meta' => $this->when($partidosMeta !== null, $partidosMeta),
        ];
    }
}
