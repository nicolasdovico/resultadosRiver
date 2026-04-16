<?php

namespace App\Services;

use App\Models\Partido;
use App\Models\Gol;
use Illuminate\Support\Facades\Cache;

class GoalAnalysisService
{
    /**
     * Determina si un partido fue una "remontada" (darlo vuelta).
     * River debe haber ganado el partido, pero en algún momento debió estar perdiendo.
     */
    public static function isComeback(Partido $partido): bool
    {
        // Solo aplica si River ganó
        if (!$partido || $partido->go_ri <= $partido->go_ad) {
            return false;
        }

        return Cache::remember("is_comeback_{$partido->fecha}", 3600, function () use ($partido) {
            $goles = Gol::where('gol_fecha', $partido->fecha)
                ->orderBy('periodo')
                ->orderBy('minutos')
                ->orderBy('gol_id')
                ->get();

            $ri_score = 0;
            $ad_score = 0;
            $was_losing = false;

            foreach ($goles as $gol) {
                if ($gol->gol_parariver == 1) {
                    $ri_score++;
                } else {
                    $ad_score++;
                }

                if ($ad_score > $ri_score) {
                    $was_losing = true;
                    break; // Ya detectamos que estuvo perdiendo
                }
            }

            return $was_losing;
        });
    }

    /**
     * Obtiene el último partido dado vuelta para una condición específica.
     */
    public static function getLatestComeback(int $condicion): ?Partido
    {
        // Buscamos victorias de River en esa condición, ordenadas por fecha desc
        $victorias = Partido::where('condicion', $condicion)
            ->whereRaw('go_ri > go_ad')
            ->orderBy('fecha', 'desc')
            ->limit(500) // Ampliamos el rango para encontrar registros más antiguos
            ->get();

        foreach ($victorias as $partido) {
            if (self::isComeback($partido)) {
                return $partido;
            }
        }

        return null;
    }

    /**
     * Determina el ID del gol de la victoria para un partido dado.
     * 
     * Lógica estricta:
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

    /**
     * Calcula la racha máxima de partidos consecutivos anotando de un jugador.
     * Retorna [max_matches, start_date, end_date, total_goals, matches]
     */
    public static function calculateMaxScoringStreak(int $playerId): array
    {
        return Cache::remember("player_{$playerId}_scoring_streak_v3", 3600, function () use ($playerId) {
            // 1. Obtener fechas de todos los goles del jugador (para River)
            $golesJugador = Gol::where('gol_juga', $playerId)
                ->where('gol_parariver', 1)
                ->orderBy('gol_fecha', 'asc')
                ->get();

            if ($golesJugador->isEmpty()) {
                return [
                    'max_matches' => 0,
                    'start_date' => null,
                    'end_date' => null,
                    'total_goals' => 0,
                    'matches' => []
                ];
            }

            $primerGolFecha = $golesJugador->first()->gol_fecha;
            $ultimoGolFecha = $golesJugador->last()->gol_fecha;

            // 2. Obtener TODOS los partidos de River en ese rango de fechas con sus rivales
            $todosLosPartidos = Partido::with('rival')
                ->whereBetween('fecha', [$primerGolFecha, $ultimoGolFecha])
                ->orderBy('fecha', 'asc')
                ->get();

            // 3. Crear un set de fechas donde el jugador anotó y mapear goles por fecha
            $fechasGoleador = [];
            $golesPorFecha = [];
            foreach ($golesJugador as $gol) {
                $fechasGoleador[$gol->gol_fecha] = true;
                $golesPorFecha[$gol->gol_fecha] = ($golesPorFecha[$gol->gol_fecha] ?? 0) + 1;
            }

            $currentStreak = 0;
            $currentStart = null;
            $currentGoals = 0;
            $currentMatches = [];
            
            $maxStreak = 0;
            $maxStart = null;
            $maxEnd = null;
            $maxGoals = 0;
            $maxMatchesDetails = [];

            foreach ($todosLosPartidos as $partido) {
                if (isset($fechasGoleador[$partido->fecha])) {
                    if ($currentStreak == 0) {
                        $currentStart = $partido->fecha;
                    }
                    $currentStreak++;
                    $currentGoals += $golesPorFecha[$partido->fecha];
                    $currentMatches[] = [
                        'fecha' => $partido->fecha,
                        'rival' => $partido->rival->ri_desc ?? 'Desconocido',
                        'rival_escudo' => $partido->rival->escudo_url ?? null,
                        'resultado' => $partido->resultado, // G, E, P
                        'marcador' => "{$partido->go_ri}-{$partido->go_ad}",
                        'goles_jugador' => $golesPorFecha[$partido->fecha]
                    ];
                    
                    // Actualizar máximo si corresponde
                    if ($currentStreak >= $maxStreak) {
                        $maxStreak = $currentStreak;
                        $maxStart = $currentStart;
                        $maxEnd = $partido->fecha;
                        $maxGoals = $currentGoals;
                        $maxMatchesDetails = $currentMatches;
                    }
                } else {
                    // Se rompió la racha
                    $currentStreak = 0;
                    $currentStart = null;
                    $currentGoals = 0;
                    $currentMatches = [];
                }
            }

            return [
                'max_matches' => $maxStreak,
                'start_date' => $maxStart,
                'end_date' => $maxEnd,
                'total_goals' => $maxGoals,
                'matches' => $maxMatchesDetails
            ];
        });
    }
}
