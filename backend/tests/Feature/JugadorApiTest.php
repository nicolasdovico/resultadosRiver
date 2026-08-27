<?php

namespace Tests\Feature;

use App\Models\Condicion;
use App\Models\Fase;
use App\Models\Gol;
use App\Models\Jugador;
use App\Models\Partido;
use App\Models\Periodo;
use App\Models\Rival;
use App\Models\TipoGol;
use App\Models\Torneo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JugadorApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_jugador_detail_with_goals_and_match_relations(): void
    {
        $jugador = Jugador::create(['pl_id' => 960, 'pl_apno' => 'ALONSO, NORBERTO OSVALDO']);
        $rival = Rival::create(['ri_id' => 15, 'ri_desc' => 'BOCA JUNIORS']);
        $torneo = Torneo::create(['tor_id' => 97, 'tor_desc' => 'CAMPEONATO 1985/1986']);
        $fase = Fase::create(['id_fase' => 1, 'fase' => 'UNICA']);
        $condicion = Condicion::create(['id_condicion' => 2, 'descripcion' => 'Visitante']);
        $periodo = Periodo::create(['id_periodo' => 1, 'periodo_desc' => 'Primero']);
        $tipoGol = TipoGol::create(['tipo_gol' => 3, 'tipo_gol_descripcion' => 'Cabeza']);

        Partido::create([
            'fecha' => '1986-04-06',
            'fecha_nro' => 36,
            'torneo' => 97,
            'adversario' => 15,
            'fase' => 1,
            'condicion' => 2,
            'go_ri' => 2,
            'go_ad' => 0,
        ]);

        Gol::create([
            'gol_id' => 3437,
            'gol_fecha' => '1986-04-06',
            'gol_juga' => 960,
            'gol_parariver' => 1,
            'gol_penal' => 3,
            'periodo' => 1,
            'minutos' => 31,
        ]);

        $response = $this->getJson('/api/v1/jugadores/960');
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertEquals(960, $data['pl_id']);
        $this->assertEquals('ALONSO, NORBERTO OSVALDO', $data['pl_apno']);
        $this->assertNotEmpty($data['goles']);
        
        $gol = $data['goles'][0];
        $this->assertEquals('1986-04-06', $gol['gol_fecha']);
        $this->assertEquals(31, $gol['minutos']);
        $this->assertEquals('CAMPEONATO 1985/1986', $gol['partido']['torneo']['tor_desc']);
        $this->assertEquals('UNICA', $gol['partido']['fase']['fa_desc']);
        $this->assertEquals('VISITANTE', $gol['partido']['condicion']['co_desc']);
        $this->assertEquals('BOCA JUNIORS', $gol['partido']['rival']['ri_desc']);
        $this->assertEquals(36, $gol['partido']['fecha_nro']);
    }
}
