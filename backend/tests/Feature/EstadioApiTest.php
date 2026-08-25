<?php

namespace Tests\Feature;

use App\Models\Condicion;
use App\Models\Estadio;
use App\Models\Fase;
use App\Models\Gol;
use App\Models\Jugador;
use App\Models\Partido;
use App\Models\Periodo;
use App\Models\Rival;
use App\Models\TipoGol;
use App\Models\Torneo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EstadioApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_estadios_and_filter_by_letter(): void
    {
        Estadio::create(['es_id' => 1, 'es_desc' => 'MONUMENTAL']);
        Estadio::create(['es_id' => 2, 'es_desc' => 'BOMBONERA']);
        Estadio::create(['es_id' => 3, 'es_desc' => 'MARACANA']);

        $response = $this->getJson('/api/v1/estadios?letter=M');
        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
        $response->assertJsonFragment(['es_desc' => 'MONUMENTAL']);
        $response->assertJsonFragment(['es_desc' => 'MARACANA']);
        $response->assertJsonMissing(['es_desc' => 'BOMBONERA']);
    }

    public function test_can_get_top_estadios(): void
    {
        $estadio1 = Estadio::create(['es_id' => 1, 'es_desc' => 'MONUMENTAL']);
        $estadio2 = Estadio::create(['es_id' => 2, 'es_desc' => 'AMALFITANI']);
        $rival = Rival::create(['ri_id' => 10, 'ri_desc' => 'BOCA JUNIORS']);
        $torneo = Torneo::create(['tor_id' => 1, 'tor_desc' => 'LIGA PROFESIONAL']);

        // Create 2 matches for Monumental, 1 for Amalfitani
        Partido::create([
            'fecha' => '2023-05-01',
            'torneo' => 1,
            'adversario' => 10,
            'estadio' => 1,
            'go_ri' => 2,
            'go_ad' => 0,
        ]);
        Partido::create([
            'fecha' => '2023-05-08',
            'torneo' => 1,
            'adversario' => 10,
            'estadio' => 1,
            'go_ri' => 1,
            'go_ad' => 1,
        ]);
        Partido::create([
            'fecha' => '2023-05-15',
            'torneo' => 1,
            'adversario' => 10,
            'estadio' => 2,
            'go_ri' => 0,
            'go_ad' => 1,
        ]);

        $response = $this->getJson('/api/v1/estadios/top');
        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(2, $data);
        $this->assertEquals('MONUMENTAL', $data[0]['es_desc']);
        $this->assertEquals(2, $data[0]['stats']['pj']);
        $this->assertEquals(1, $data[0]['stats']['pg']);
        $this->assertEquals(1, $data[0]['stats']['pe']);
        $this->assertEquals(0, $data[0]['stats']['pp']);

        $this->assertEquals('AMALFITANI', $data[1]['es_desc']);
        $this->assertEquals(1, $data[1]['stats']['pj']);
    }

    public function test_can_get_estadio_detail_with_stats_and_hitos(): void
    {
        $estadio = Estadio::create(['es_id' => 1, 'es_desc' => 'MONUMENTAL']);
        $rival = Rival::create(['ri_id' => 10, 'ri_desc' => 'BOCA JUNIORS']);
        $torneo = Torneo::create(['tor_id' => 1, 'tor_desc' => 'LIGA PROFESIONAL']);
        $condicion = Condicion::create(['id_condicion' => 1, 'descripcion' => 'LOCAL']);
        $jugador = Jugador::create(['pl_id' => 100, 'pl_apno' => 'LABRUNA, ANGEL']);

        Partido::create([
            'fecha' => '2023-05-01',
            'torneo' => 1,
            'adversario' => 10,
            'estadio' => 1,
            'condicion' => 1,
            'go_ri' => 3,
            'go_ad' => 1,
        ]);

        Gol::create([
            'gol_fecha' => '2023-05-01',
            'gol_juga' => 100,
            'gol_parariver' => 1,
            'gol_penal' => 1,
            'periodo' => 1,
            'minutos' => 25,
        ]);

        $response = $this->getJson('/api/v1/estadios/1');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'es_id',
                'es_desc',
                'stats' => [
                    'pj', 'pg', 'pe', 'pp', 'gf', 'gc', 'dg', 'puntos', 'vallas_invictas', 'efectividad'
                ],
                'top_scorers',
                'streaks' => ['invincibility', 'drought'],
                'last_won_match',
                'last_lost_match',
                'partidos'
            ]
        ]);

        $data = $response->json('data');
        $this->assertEquals(1, $data['stats']['pj']);
        $this->assertEquals(1, $data['stats']['pg']);
        $this->assertEquals(3, $data['stats']['gf']);
        $this->assertEquals(1, $data['stats']['gc']);
        $this->assertEquals(1, count($data['top_scorers']));
        $this->assertEquals('LABRUNA, ANGEL', $data['top_scorers'][0]['pl_apno']);
    }
}
