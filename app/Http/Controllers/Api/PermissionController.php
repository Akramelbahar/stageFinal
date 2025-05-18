<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class PermissionController extends BaseApiController
{
    public function __construct()
    {
        $this->model = Permission::class;
        $this->validationRules = [
            'module' => 'required|string|max:255',
            'action' => 'required|string|max:100',
            'description' => 'nullable|string',
        ];
        $this->relations = ['roles'];
        
        // Only admins can manage permissions
        $this->middleware('permission:admin-permissions');
    }
    
    /**
     * Generate CRUD permissions for a module.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function generateCrudPermissions(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'module' => 'required|string|max:255',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $module = strtolower($request->module);
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            $createdPermissions = [];
            
            // Create standard CRUD permissions
            $actions = ['list', 'create', 'edit', 'view', 'delete'];
            
            foreach ($actions as $action) {
                $permission = Permission::firstOrCreate(
                    [
                        'module' => $module,
                        'action' => $action
                    ],
                    [
                        'description' => "Can $action $module"
                    ]
                );
                
                $createdPermissions[] = $permission;
            }
            
            // Commit the transaction
            DB::commit();
            
            return response()->json([
                'message' => "CRUD permissions for $module created successfully",
                'data' => $createdPermissions
            ], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating permissions', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get permissions by module.
     *
     * @param string $module
     * @return JsonResponse
     */
    public function byModule($module): JsonResponse
    {
        $permissions = Permission::where('module', $module)
            ->with('roles')
            ->get();
            
        return response()->json(['data' => $permissions], 200);
    }
    
    /**
     * Get all modules with their permissions.
     *
     * @return JsonResponse
     */
    public function modules(): JsonResponse
    {
        $modules = Permission::select('module')
            ->distinct()
            ->get()
            ->pluck('module');
            
        $result = [];
        
        foreach ($modules as $module) {
            $permissions = Permission::where('module', $module)->get();
            $result[$module] = $permissions;
        }
            
        return response()->json(['data' => $result], 200);
    }
}