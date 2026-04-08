<?php

namespace App\Services;

use App\Models\Partido;
use App\Models\Gol;
use Illuminate\Support\Facades\Cache;

class GoalAnalysisService
{
    /**
     * Determina el ID del gol de la victoria para un partido dado.
     * CRITERIO ESTRICTO:
     * 1. River debe haber ganado por EXACTAMENTE un gol de diferencia (go_ri == go_ad + 1).
     * 2. El gol de la victoria debe ser el que puso el marcador definitivo (go_ad + 1).
     * 3. Justo antes de ese gol, el partido debía estar EMPATADO (go_ad == go_ad).
     */
    public static function getWinningGoalId(Partido $partido): ?int
    {
        // 1. Condición de victoria por la mínima
        if (!$partido || $partido->go_ri != ($partido->go_ad + 1)) {
            return null;
        }

        return Cache::remember("winning_goal_v4_{$partido->fecha}", 3600, function () use ($partido) {
            $goles = Gol::where('gol_fecha', $partido->fecha)
                ->orderBy('periodo')
                ->orderBy('minutos')
                ->orderBy('gol_id')
                ->get();
            
            $ri_score = 0;
            $ad_score = 0;
            $rival_final_score = $partido->go_ad;

            foreach ($goles as $gol) {
                $score_before_ri = $ri_score;
                $score_before_ad = $ad_score;

                if ($gol->gol_parariver == 1) {
                    $ri_score++;
                } else {
                    $ad_score++;
                }

                // El gol de la victoria es aquel que:
                // - Pone a River con su marcador final (rival_final_score + 1)
                // - Rompe un empate que era igual al marcador final del rival
                if ($ri_score == ($rival_final_score + 1) && 
                    $score_before_ri == $rival_final_score && 
                    $score_before_ad == $rival_final_score) {
                    return $gol->gol_id;
                }
            }

            return null;
        });
    }

    /**
     * Cuenta cuántos goles de victoria ha marcado un jugador.
     */
    public static function countWinningGoalsForPlayer(int $playerId): int
    {
        return Cache::remember("player_{$playerId}_winning_goals_v4", 3600, function () use ($playerId) {
            $fechasPartidos = Gol::where('gol_juga', $playerId)
                ->where('gol_parariver', 1)
                ->distinct()
                ->pluck('gol_fecha');

            $count = 0;
            foreach ($fechasPartidos as $fecha) {
                $partido = Partido::find($fecha);
                if ($partido) {
                    $winningGoalId = self::getWinningGoalId($partido);
                    if ($winningGoalId) {
                        $isWinner = Gol::where('gol_id', $winningGoalId)
                            ->where('gol_juga', $playerId)
                            ->exists();
                        if ($isWinner) {
                            $count++;
                        }
                    }
                }
            }
            return $count;
        });
    }
}
