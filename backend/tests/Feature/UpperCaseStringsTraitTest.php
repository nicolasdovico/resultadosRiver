<?php

namespace Tests\Feature;

use App\Models\Jugador;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpperCaseStringsTraitTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that Role name is converted to upper case.
     */
    public function test_role_name_is_converted_to_upper_case(): void
    {
        $role = Role::create(['name' => 'super admin']);

        $this->assertEquals('SUPER ADMIN', $role->name);
        $this->assertDatabaseHas('roles', [
            'id' => $role->id,
            'name' => 'SUPER ADMIN',
        ]);
    }

    /**
     * Test that Permission name is converted to upper case.
     */
    public function test_permission_name_is_converted_to_upper_case(): void
    {
        $permission = Permission::create(['name' => 'edit posts']);

        $this->assertEquals('EDIT POSTS', $permission->name);
        $this->assertDatabaseHas('permissions', [
            'id' => $permission->id,
            'name' => 'EDIT POSTS',
        ]);
    }

    /**
     * Test that Jugador pl_foto is NOT converted to upper case.
     */
    public function test_jugador_pl_foto_is_not_converted_to_upper_case(): void
    {
        $jugador = Jugador::create([
            'pl_apno' => 'Enzo Perez',
            'pl_foto' => 'players-photos/enzo-perez.jpg'
        ]);

        // Name SHOULD be upper cased (because of the trait)
        $this->assertEquals('ENZO PEREZ', $jugador->pl_apno);
        
        // Photo SHOULD NOT be upper cased
        $this->assertEquals('players-photos/enzo-perez.jpg', $jugador->pl_foto);
        
        $this->assertDatabaseHas('players', [
            'pl_id' => $jugador->pl_id,
            'pl_apno' => 'ENZO PEREZ',
            'pl_foto' => 'players-photos/enzo-perez.jpg',
        ]);
    }
}
