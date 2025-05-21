<?php

namespace App\Http\Controllers\Api;

use App\Models\Role;
use App\Models\Permission;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class RoleController extends BaseApiController
{
    public function __construct()
    {
        $this->model = Role::class;
        $this->validationRules = [
            'nom' => 'required|string|max:255',
            'cout' => 'required|numeric',
        ];
        $this->relations = ['permissions', 'utilisateurs'];
        
        // Only admins can manage roles
        $this->middleware('permission:admin-roles');
    }
    
    /**
     * Store a newly created role with associated permissions.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), array_merge($this->validationRules, [
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:Permission,id',
        ]));
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Create role
            $role = Role::create([
                'nom' => $request->nom,
                'cout' => $request->cout,
            ]);
            
            // Attach permissions if provided
            if ($request->has('permissions') && is_array($request->permissions)) {
                $role->permissions()->sync($request->permissions);
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $role->load($this->relations);
            
            return response()->json(['data' => $role, 'message' => 'Role created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating role', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update role with associated permissions.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $role = Role::find($id);
        
        if (!$role) {
            return response()->json(['message' => 'Role not found'], 404);
        }
        
        $validator = Validator::make($request->all(), array_merge($this->validationRules, [
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:Permission,id',
        ]));
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Update role
            $role->update([
                'nom' => $request->nom,
                'cout' => $request->cout,
            ]);
            
            // Update permissions if provided
            if ($request->has('permissions')) {
                $role->permissions()->sync($request->permissions);
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $role->load($this->relations);
            
            return response()->json(['data' => $role, 'message' => 'Role updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating role', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Assign permissions to a role.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function assignPermissions(Request $request, $id): JsonResponse
    {
        $role = Role::find($id);
        
        if (!$role) {
            return response()->json(['message' => 'Role not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'permissions' => 'required|array',
            'permissions.*' => 'exists:Permission,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        try {
            $role->permissions()->sync($request->permissions);
            
            // Load relations
            $role->load($this->relations);
            
            return response()->json(['data' => $role, 'message' => 'Permissions assigned successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error assigning permissions', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get users with a specific role.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function users($id): JsonResponse
    {
        $role = Role::find($id);
        
        if (!$role) {
            return response()->json(['message' => 'Role not found'], 404);
        }
        
        $users = $role->utilisateurs;
        
        return response()->json(['data' => $users], 200);
    }
    
    /**
     * Create a default admin role with all permissions.
     *
     * @return JsonResponse
     */
    public function createAdminRole(): JsonResponse
    {
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Check if admin role already exists
            $existingRole = Role::where('nom', 'Admin')->first();
            
            if ($existingRole) {
                return response()->json([
                    'message' => 'Admin role already exists',
                    'data' => $existingRole
                ], 422);
            }
            
            // Create admin role
            $role = Role::create([
                'nom' => 'Admin',
                'cout' => 0, // No cost for admin
            ]);
            
            // Attach all permissions
            $allPermissions = Permission::all()->pluck('id')->toArray();
            $role->permissions()->sync($allPermissions);
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $role->load($this->relations);
            
            return response()->json(['data' => $role, 'message' => 'Admin role created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating admin role', 'error' => $e->getMessage()], 500);
        }
    }
}