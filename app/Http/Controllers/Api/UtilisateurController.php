<?php

namespace App\Http\Controllers\Api;

use App\Models\Utilisateur;
use App\Models\Role;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class UtilisateurController extends BaseApiController
{
    public function __construct()
    {
        $this->model = Utilisateur::class;
        $this->validationRules = [
            'nom' => 'required|string|max:255',
            'section' => 'required|string|max:255',
            'credentials' => 'required|string|max:255',
            'section_id' => 'nullable|exists:Section,id',
        ];
        $this->relations = [
            'sectionRelation', 
            'sectionsGerées', 
            'roles', 
            'roles.permissions',
            'interventions',
            'planifications',
            'prestataires',
            'gestionsAdministratives'
        ];
        
        // Apply permission middleware
        $this->middleware('permission:utilisateur-list', ['only' => ['index']]);
        $this->middleware('permission:utilisateur-create', ['only' => ['store']]);
        $this->middleware('permission:utilisateur-edit', ['only' => ['update']]);
        $this->middleware('permission:utilisateur-view', ['only' => ['show']]);
        $this->middleware('permission:utilisateur-delete', ['only' => ['destroy']]);
        $this->middleware('permission:utilisateur-manage-roles', ['only' => ['assignRoles']]);
    }
    
    /**
     * Store a newly created user with associated roles.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), array_merge($this->validationRules, [
            'roles' => 'nullable|array',
            'roles.*' => 'exists:Role,id',
        ]));
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Hash the credentials (assuming it's a password)
        $hashedCredentials = Hash::make($request->credentials);
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Create user
            $utilisateur = Utilisateur::create([
                'nom' => $request->nom,
                'section' => $request->section,
                'credentials' => $hashedCredentials,
                'section_id' => $request->section_id,
            ]);
            
            // Attach roles if provided
            if ($request->has('roles') && is_array($request->roles)) {
                $utilisateur->roles()->sync($request->roles);
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $utilisateur->load($this->relations);
            
            return response()->json(['data' => $utilisateur, 'message' => 'User created successfully'], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating user', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Update user with associated roles.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $utilisateur = Utilisateur::find($id);
        
        if (!$utilisateur) {
            return response()->json(['message' => 'User not found'], 404);
        }
        
        // Modify validation rules to make credentials optional on update
        $validationRules = $this->validationRules;
        $validationRules['credentials'] = 'nullable|string|max:255';
        
        $validator = Validator::make($request->all(), array_merge($validationRules, [
            'roles' => 'nullable|array',
            'roles.*' => 'exists:Role,id',
        ]));
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Prepare data for update
            $data = [
                'nom' => $request->nom,
                'section' => $request->section,
                'section_id' => $request->section_id,
            ];
            
            // Only update credentials if provided
            if ($request->has('credentials') && !empty($request->credentials)) {
                $data['credentials'] = Hash::make($request->credentials);
            }
            
            // Update user
            $utilisateur->update($data);
            
            // Update roles if provided
            if ($request->has('roles')) {
                $utilisateur->roles()->sync($request->roles);
            }
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $utilisateur->load($this->relations);
            
            return response()->json(['data' => $utilisateur, 'message' => 'User updated successfully'], 200);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error updating user', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Assign roles to a user.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignRoles(Request $request, $id)
    {
        $utilisateur = Utilisateur::find($id);
        
        if (!$utilisateur) {
            return response()->json(['message' => 'User not found'], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'roles' => 'required|array',
            'roles.*' => 'exists:Role,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        try {
            $utilisateur->roles()->sync($request->roles);
            
            // Load relations
            $utilisateur->load($this->relations);
            
            return response()->json(['data' => $utilisateur, 'message' => 'Roles assigned successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error assigning roles', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get users by section.
     *
     * @param int $sectionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function bySection($sectionId)
    {
        $section = Section::find($sectionId);
        
        if (!$section) {
            return response()->json(['message' => 'Section not found'], 404);
        }
        
        $utilisateurs = Utilisateur::where('section_id', $sectionId)
            ->with(['roles', 'roles.permissions'])
            ->get();
            
        return response()->json(['data' => $utilisateurs], 200);
    }
    
    /**
     * Get user permissions (combined from all roles).
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function permissions($id)
    {
        $utilisateur = Utilisateur::find($id);
        
        if (!$utilisateur) {
            return response()->json(['message' => 'User not found'], 404);
        }
        
        // Get all roles with their permissions
        $utilisateur->load('roles.permissions');
        
        // Collect all unique permissions
        $permissions = collect();
        
        foreach ($utilisateur->roles as $role) {
            $permissions = $permissions->concat($role->permissions);
        }
        
        // Remove duplicates
        $uniquePermissions = $permissions->unique('id')->values();
        
        return response()->json(['data' => $uniquePermissions], 200);
    }
    
    /**
     * Create a test admin user with all permissions.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function createAdmin()
    {
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Check if admin user already exists
            $existingUser = Utilisateur::where('nom', 'Admin')->first();
            
            if ($existingUser) {
                return response()->json([
                    'message' => 'Admin user already exists',
                    'data' => $existingUser
                ], 422);
            }
            
            // Get or create admin role
            $adminRole = Role::where('nom', 'Admin')->first();
            
            if (!$adminRole) {
                // Create admin role with all permissions
                $adminRole = Role::create([
                    'nom' => 'Admin',
                    'cout' => 0,
                ]);
                
                // Attach all permissions
                $allPermissions = DB::table('Permission')->pluck('id')->toArray();
                $adminRole->permissions()->sync($allPermissions);
            }
            
            // Create admin user
            $admin = Utilisateur::create([
                'nom' => 'Admin',
                'section' => 'Administration',
                'credentials' => Hash::make('admin123'), // Default password, should be changed
                'section_id' => null, // Admin doesn't need a section
            ]);
            
            // Assign admin role
            $admin->roles()->sync([$adminRole->id]);
            
            // Commit the transaction
            DB::commit();
            
            // Load relations
            $admin->load($this->relations);
            
            return response()->json([
                'data' => $admin, 
                'message' => 'Admin user created successfully with default password "admin123"'
            ], 201);
        } catch (\Exception $e) {
            // Rollback in case of error
            DB::rollback();
            return response()->json(['message' => 'Error creating admin user', 'error' => $e->getMessage()], 500);
        }
    }
}