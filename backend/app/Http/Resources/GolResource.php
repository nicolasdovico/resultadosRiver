<?php

namespace App\Http\Resources;

use App\Services\GoalAnalysisService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'GolResource',
    properties: [
        new OA\Property(property: 'gol_id', type: 'integer'),
        new OA\Property(property: 'gol_fecha', type: 'string', format: 'date'),
        new OA\Property(property: 'minutos', type: 'integer'),
        new OA\Property(property: 'tipo_gol', type: 'integer'),
        new OA\Property(property: 'tipo_gol_desc', type: 'string', nullable: true),
        new OA\Property(property: 'periodo', type: 'integer'),
        new OA\Property(property: 'periodo_desc', type: 'string', nullable: true),
        new OA\Property(property: 'gol_parariver', type: 'integer', description: '1: River, 2: Rival'),
        new OA\Property(property: 'es_gol_victoria', type: 'boolean', nullable: true),
        new OA\Property(
            property: 'partido',
            type: 'object',
            properties: [
                new OA\Property(property: 'fecha', type: 'string', format: 'date'),
                new OA\Property(property: 'fecha_nro', type: 'integer', nullable: true),
                new OA\Property(property: 'go_ri', type: 'integer'),
                new OA\Property(property: 'go_ad', type: 'integer'),
                new OA\Property(property: 'rival', ref: '#/components/schemas/RivalResource'),
                new OA\Property(property: 'torneo', type: 'object', nullable: true),
                new OA\Property(property: 'fase', type: 'object', nullable: true),
                new OA\Property(property: 'condicion', type: 'object', nullable: true),
                new OA\Property(property: 'estadio', type: 'object', nullable: true),
            ]
        ),
        new OA\Property(
            property: 'jugador',
            type: 'object',
            properties: [
                new OA\Property(property: 'pl_id', type: 'integer'),
                new OA\Property(property: 'pl_apno', type: 'string')
            ]
        )
    ]
)]
class GolResource extends JsonResource
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

        $partido = $this->partido;
        $esGolVictoria = null;
        if ($isPremium && $partido) {
            $winningGoalId = GoalAnalysisService::getWinningGoalId($partido);
            $esGolVictoria = $winningGoalId === $this->gol_id;
        }

        $torneo = $partido?->torneo_rel;
        $fase = $partido?->fase_rel;
        $condicion = $partido?->condicion_rel;
        $estadio = $partido?->estadio_rel;
        $rival = $partido?->rival;

        return [
            'gol_id' => $this->gol_id,
            'gol_fecha' => $this->gol_fecha,
            'minutos' => $this->minutos,
            'gol_penal' => $this->gol_penal,
            'tipo_gol' => $this->gol_penal,
            'tipo_gol_desc' => trim($this->tipo_gol_rel?->tipo_gol_descripcion),
            'periodo' => $this->periodo,
            'periodo_desc' => trim($this->periodo_rel?->periodo_desc),
            'gol_parariver' => $this->gol_parariver,
            'es_gol_victoria' => $esGolVictoria,
            'partido' => [
                'fecha' => $partido?->fecha,
                'fecha_nro' => $partido?->fecha_nro,
                'go_ri' => $partido?->go_ri,
                'go_ad' => $partido?->go_ad,
                'rival' => new RivalResource($rival),
                'torneo' => $torneo ? [
                    'tor_id' => $torneo->tor_id,
                    'tor_desc' => trim($torneo->tor_desc),
                ] : null,
                'fase' => $fase ? [
                    'id_fase' => $fase->id_fase,
                    'fa_desc' => trim($fase->fase ?? $fase->fa_desc),
                ] : null,
                'condicion' => $condicion ? [
                    'id_condicion' => $condicion->id_condicion,
                    'co_desc' => trim($condicion->descripcion ?? $condicion->co_desc),
                ] : null,
                'estadio' => $estadio ? [
                    'es_id' => $estadio->es_id,
                    'es_desc' => trim($estadio->es_desc),
                ] : null,
            ],
            'jugador' => [
                'pl_id' => $this->jugador?->pl_id,
                'pl_apno' => $this->jugador?->pl_apno,
            ],
        ];
    }
}
