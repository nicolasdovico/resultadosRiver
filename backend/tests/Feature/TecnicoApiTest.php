<?php

namespace Tests\Feature;

use App\Models\Condicion;
use App\Models\Fase;
use App\Models\Partido;
use App\Models\Rival;
use App\Models\Tecnico;
use App\Models\TecnicoCiclo;
use App\Models\Torneo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TecnicoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_unique_tecnicos_and_filter_by_letter(): void
    {
        $gallardo = Tecnico::create(['id_tecnicos' => 4, 'tec_ape_nom' => 'GALLARDO, MARCELO DANIEL']);
        TecnicoCiclo::create([
            'tecnico_id' => 4,
            'numero_ciclo' => 1,
            'desde' => '2014-07-27',
            'hasta' => '2022-12-31',
            'cargo' => 'TITULAR'
        ]);
        TecnicoCiclo::create([
            'tecnico_id' => 4,
            'numero_ciclo' => 2,
            'desde' => '2024-08-05',
            'hasta' => '2026-02-26',
            'cargo' => 'TITULAR'
        ]);

        $ramon = Tecnico::create(['id_tecnicos' => 20, 'tec_ape_nom' => 'DIAZ, RAMON ANGEL']);
        TecnicoCiclo::create([
            'tecnico_id' => 20,
            'numero_ciclo' => 1,
            'desde' => '1995-07-07',
            'hasta' => '2000-02-11',
            'cargo' => 'TITULAR'
        ]);

        $response = $this->getJson('/api/v1/tecnicos?letter=G');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonFragment(['tec_ape_nom' => 'GALLARDO, MARCELO DANIEL']);
        $response->assertJsonMissing(['tec_ape_nom' => 'DIAZ, RAMON ANGEL']);

        // Check total_ciclos
        $data = $response->json('data.0');
        $this->assertEquals(2, $data['total_ciclos']);
        $this->assertCount(2, $data['ciclos']);
    }

    public function test_multi_cycle_tecnico_global_stats(): void
    {
        $gallardo = Tecnico::create(['id_tecnicos' => 4, 'tec_ape_nom' => 'GALLARDO, MARCELO DANIEL']);
        TecnicoCiclo::create([
            'tecnico_id' => 4,
            'numero_ciclo' => 1,
            'desde' => '2014-07-27',
            'hasta' => '2022-12-31',
            'cargo' => 'TITULAR'
        ]);
        TecnicoCiclo::create([
            'tecnico_id' => 4,
            'numero_ciclo' => 2,
            'desde' => '2024-08-05',
            'hasta' => '2026-02-26',
            'cargo' => 'TITULAR'
        ]);

        $rival = Rival::create(['ri_id' => 10, 'ri_desc' => 'BOCA JUNIORS']);
        $torneo = Torneo::create(['tor_id' => 1, 'tor_desc' => 'LIGA PROFESIONAL']);

        // 1st cycle match (Win: 2-0)
        Partido::create([
            'fecha' => '2015-05-07',
            'torneo' => 1,
            'adversario' => 10,
            'go_ri' => 2,
            'go_ad' => 0,
        ]);

        // 2nd cycle match (Draw: 1-1)
        Partido::create([
            'fecha' => '2024-09-21',
            'torneo' => 1,
            'adversario' => 10,
            'go_ri' => 1,
            'go_ad' => 1,
        ]);

        $response = $this->getJson('/api/v1/tecnicos/4');
        $response->assertStatus(200);
        $data = $response->json('data');

        // Global stats should combine both cycles: 2 matches, 1 win, 1 draw, 0 losses, 3 GF, 1 GC
        $this->assertEquals(2, $data['stats']['pj']);
        $this->assertEquals(1, $data['stats']['pg']);
        $this->assertEquals(1, $data['stats']['pe']);
        $this->assertEquals(0, $data['stats']['pp']);
        $this->assertEquals(3, $data['stats']['gf']);
        $this->assertEquals(1, $data['stats']['gc']);
        $this->assertEquals(2, $data['stats']['dg']);
        $this->assertEquals(4, $data['stats']['puntos']);
        $this->assertEquals(66.67, $data['stats']['efectividad']);
    }

    public function test_can_get_tecnico_scoped_by_ciclo_id(): void
    {
        $gallardo = Tecnico::create(['id_tecnicos' => 4, 'tec_ape_nom' => 'GALLARDO, MARCELO DANIEL']);
        $ciclo1 = TecnicoCiclo::create([
            'tecnico_id' => 4,
            'numero_ciclo' => 1,
            'desde' => '2014-07-27',
            'hasta' => '2022-12-31',
            'cargo' => 'TITULAR'
        ]);
        $ciclo2 = TecnicoCiclo::create([
            'tecnico_id' => 4,
            'numero_ciclo' => 2,
            'desde' => '2024-08-05',
            'hasta' => '2026-02-26',
            'cargo' => 'TITULAR'
        ]);

        $rival = Rival::create(['ri_id' => 10, 'ri_desc' => 'BOCA JUNIORS']);
        $torneo = Torneo::create(['tor_id' => 1, 'tor_desc' => 'LIGA PROFESIONAL']);

        // 1st cycle match (Win: 2-0)
        Partido::create([
            'fecha' => '2015-05-07',
            'torneo' => 1,
            'adversario' => 10,
            'go_ri' => 2,
            'go_ad' => 0,
        ]);

        // 2nd cycle match (Draw: 1-1)
        Partido::create([
            'fecha' => '2024-09-21',
            'torneo' => 1,
            'adversario' => 10,
            'go_ri' => 1,
            'go_ad' => 1,
        ]);

        // Query only cycle 1
        $response = $this->getJson("/api/v1/tecnicos/4?ciclo_id={$ciclo1->id}");
        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertEquals($ciclo1->id, $data['active_ciclo_id']);
        $this->assertEquals(1, $data['stats']['pj']);
        $this->assertEquals(1, $data['stats']['pg']);
        $this->assertEquals(2, $data['stats']['gf']);
        $this->assertEquals(0, $data['stats']['gc']);
        $this->assertEquals(100.0, $data['stats']['efectividad']);

        // Query only cycle 2
        $response2 = $this->getJson("/api/v1/tecnicos/4?ciclo_id={$ciclo2->id}");
        $response2->assertStatus(200);
        $data2 = $response2->json('data');

        $this->assertEquals($ciclo2->id, $data2['active_ciclo_id']);
        $this->assertEquals(1, $data2['stats']['pj']);
        $this->assertEquals(0, $data2['stats']['pg']);
        $this->assertEquals(1, $data2['stats']['pe']);
        $this->assertEquals(1, $data2['stats']['gf']);
        $this->assertEquals(1, $data2['stats']['gc']);
        $this->assertEquals(33.33, $data2['stats']['efectividad']);
    }

    public function test_custom_query_filters_by_tecnico_across_all_cycles(): void
    {
        $gallardo = Tecnico::create(['id_tecnicos' => 4, 'tec_ape_nom' => 'GALLARDO, MARCELO DANIEL']);
        TecnicoCiclo::create([
            'tecnico_id' => 4,
            'numero_ciclo' => 1,
            'desde' => '2014-07-27',
            'hasta' => '2022-12-31',
            'cargo' => 'TITULAR'
        ]);
        TecnicoCiclo::create([
            'tecnico_id' => 4,
            'numero_ciclo' => 2,
            'desde' => '2024-08-05',
            'hasta' => '2026-02-26',
            'cargo' => 'TITULAR'
        ]);

        $rival = Rival::create(['ri_id' => 10, 'ri_desc' => 'BOCA JUNIORS']);
        $torneo = Torneo::create(['tor_id' => 1, 'tor_desc' => 'LIGA PROFESIONAL']);

        // Match during Gallardo cycle 1
        Partido::create([
            'fecha' => '2015-05-07',
            'torneo' => 1,
            'adversario' => 10,
            'go_ri' => 2,
            'go_ad' => 0,
        ]);

        // Match between cycles (Demichelis)
        Partido::create([
            'fecha' => '2023-05-07',
            'torneo' => 1,
            'adversario' => 10,
            'go_ri' => 1,
            'go_ad' => 0,
        ]);

        // Match during Gallardo cycle 2
        Partido::create([
            'fecha' => '2024-09-21',
            'torneo' => 1,
            'adversario' => 10,
            'go_ri' => 1,
            'go_ad' => 1,
        ]);

        $response = $this->getJson('/api/v1/stats/custom-query?tecnico=4');
        $response->assertStatus(200);
        $data = $response->json('data.stats');

        // Gallardo should have 2 matches (excluding 2023 Demichelis match)
        $this->assertEquals(2, $data['pj']);
        $this->assertEquals(1, $data['pg']);
        $this->assertEquals(1, $data['pe']);
        $this->assertEquals(0, $data['pp']);
    }
}
