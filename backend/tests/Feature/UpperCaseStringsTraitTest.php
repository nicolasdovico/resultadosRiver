<?php

namespace Tests\Feature;

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
}
