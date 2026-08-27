<?php

namespace Tests\Feature;

use App\Models\Arbitro;
use App\Models\Condicion;
use App\Models\Estadio;
use App\Models\Fase;
use App\Models\Gol;
use App\Models\Jugador;
use App\Models\Partido;
use App\Models\Rival;
use App\Models\Tecnico;
use App\Models\Torneo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomQueryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_custom_query_stats_returns_aggregated_data(): void
    {
        $rival = Rival::create(['ri_id' => 1, 'ri_desc' => 'BOCA JUNIORS']);
        $estadio = Estadio::create(['es_id' => 1, 'es_desc' => 'MONUMENTAL']);
        $arbitro = Arbitro::create(['ar_id' => 1, 'ar_apno' => 'LOUSTAU, PATRICIO']);
        $torneo = Torneo::create(['tor_id' => 1, 'tor_desc' => 'LIGA PROFESIONAL', 'tor_nivel' => 'NACIONAL']);
        $condicion = Condicion::create(['id_condicion' => 1, 'descripcion' => 'LOCAL']);
        $fase = Fase::create(['id_fase' => 1, 'fase' => 'FINAL']);
        $jugador = Jugador::create(['pl_id' => 10, 'pl_apno' => 'LABRUNA, ANGEL']);

        // Match 1: Win 3-1
        Partido::create([
            'fecha' => '2023-05-01',
            'torneo' => 1,
            'adversario' => 1,
            'estadio' => 1,
            'arbitro' => 1,
            'condicion' => 1,
            'fase' => 1,
            'go_ri' => 3,
            'go_ad' => 1,
        ]);

        Gol::create([
            'gol_fecha' => '2023-05-01',
            'gol_juga' => 10,
            'gol_parariver' => 1,
            'gol_penal' => 1,
            'periodo' => 1,
            'minutos' => 20,
        ]);

        // Match 2: Loss 0-1
        Partido::create([
            'fecha' => '2023-06-01',
            'torneo' => 1,
            'adversario' => 1,
            'estadio' => 1,
            'arbitro' => 1,
            'condicion' => 1,
            'fase' => 1,
            'go_ri' => 0,
            'go_ad' => 1,
        ]);

        $response = $this->getJson('/api/v1/stats/custom-query?adversario=1&estadio=1&arbitro=1');
        $response->assertStatus(200);

        $response->assertJsonStructure([
            'data' => [
                'stats' => [
                    'pj', 'pg', 'pe', 'pp', 'gf', 'gc', 'dg', 'puntos', 'vallas_invictas', 'efectividad'
                ],
                'top_scorers',
                'streaks' => ['invincibility', 'drought'],
                'last_won_match',
                'last_lost_match'
            ]
        ]);

        $data = $response->json('data');
        $this->assertEquals(2, $data['stats']['pj']);
        $this->assertEquals(1, $data['stats']['pg']);
        $this->assertEquals(1, $data['stats']['pp']);
        $this->assertEquals(3, $data['stats']['gf']);
        $this->assertEquals(2, $data['stats']['gc']);
        $this->assertEquals(1, $data['stats']['dg']);
        $this->assertEquals(3, $data['stats']['puntos']);
        $this->assertEquals(50, $data['stats']['efectividad']);

        $this->assertCount(1, $data['top_scorers']);
        $this->assertEquals('LABRUNA, ANGEL', $data['top_scorers'][0]['pl_apno']);

        $this->assertNotNull($data['last_won_match']);
        $this->assertEquals('2023-05-01', $data['last_won_match']['fecha']);
        $this->assertNotNull($data['last_lost_match']);
        $this->assertEquals('2023-06-01', $data['last_lost_match']['fecha']);
    }

    public function test_custom_query_stats_with_tecnico_and_resultado_filter(): void
    {
        $rival = Rival::create(['ri_id' => 1, 'ri_desc' => 'BOCA JUNIORS']);
        $torneo = Torneo::create(['tor_id' => 1, 'tor_desc' => 'LIGA']);
        $tecnico = Tecnico::create([
            'id_tecnicos' => 1,
            'tec_ape_nom' => 'GALLARDO, MARCELO',
        ]);
        \App\Models\TecnicoCiclo::create([
            'tecnico_id' => 1,
            'numero_ciclo' => 1,
            'desde' => '2014-06-01',
            'hasta' => '2022-12-31',
            'cargo' => 'TITULAR'
        ]);

        Partido::create([
            'fecha' => '2018-12-09',
            'torneo' => 1,
            'adversario' => 1,
            'go_ri' => 3,
            'go_ad' => 1,
        ]);

        Partido::create([
            'fecha' => '2023-05-01', // Outside Gallardo's cycle
            'torneo' => 1,
            'adversario' => 1,
            'go_ri' => 1,
            'go_ad' => 0,
        ]);

        $response = $this->getJson('/api/v1/stats/custom-query?tecnico=1&resultado=G');
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertEquals(1, $data['stats']['pj']);
        $this->assertEquals(1, $data['stats']['pg']);
        $this->assertEquals(3, $data['stats']['gf']);
    }
}
