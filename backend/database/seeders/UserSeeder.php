<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Utilisateur;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create permissions for all modules
        $this->createPermissions();
        
        // Create admin role
        $role = Role::firstOrCreate(
            ['nom' => 'Admin'],
            ['id' => 1, 'cout' => 0]
        );
        
        // Assign all permissions to admin role
        $allPermissions = Permission::all();
        $permissionIds = $allPermissions->pluck('id')->toArray();
        $role->permissions()->sync($permissionIds);
        
        // Create admin user
        $user = Utilisateur::firstOrCreate(
            ['nom' => 'admin'],
            [
                'id' => 1,
                'section' => 'Administration',
                'credentials' => Hash::make('admin123'),
                'section_id' => null,
                'api_token' => null, // Token will be generated upon login
            ]
        );
        
        // Assign admin role to user
        $user->roles()->sync([$role->id]);
        
        // Output success message
        $this->command->info('Admin user created successfully with username "admin" and password "admin123"');
    }
    
    /**
     * Create all required permissions
     */
    private function createPermissions()
    {
        // Define modules and their actions
        $modules = [
            'machine' => ['list', 'create', 'edit', 'view', 'delete'],
            'intervention' => ['list', 'create', 'edit', 'view', 'delete'],
            'diagnostic' => ['list', 'create', 'edit', 'view', 'delete'],
            'controle' => ['list', 'create', 'edit', 'view', 'delete'],
            'renovation' => ['list', 'create', 'edit', 'view', 'delete'],
            'maintenance' => ['list', 'create', 'edit', 'view', 'delete'],
            'rapport' => ['list', 'create', 'edit', 'view', 'delete', 'validate'],
            'planification' => ['list', 'create', 'edit', 'view', 'delete'],
            'utilisateur' => ['list', 'create', 'edit', 'view', 'delete', 'manage-roles'],
            'section' => ['list', 'create', 'edit', 'view', 'delete'],
            'prestataire' => ['list', 'create', 'edit', 'view', 'delete'],
            'gestion' => ['list', 'create', 'edit', 'view', 'delete', 'validate'],
            'admin' => ['roles', 'permissions'],
        ];
        
        // Reset auto-increment ID counter
        $permissionId = 1;
        
        // Create each permission with explicit ID
        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                Permission::firstOrCreate(
                    [
                        'module' => $module,
                        'action' => $action
                    ],
                    [
                        'id' => $permissionId++,
                        'description' => "Can $action $module"
                    ]
                );
            }
        }
        
        $this->command->info('Permissions created successfully');
    }
}