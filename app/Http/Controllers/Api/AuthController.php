<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login']]);
    }

    /**
     * Login user and create token
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Find the user
        $user = Utilisateur::where('nom', $request->nom)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->credentials)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.'
            ], 401);
        }

        // Generate API token for the user
        $token = Str::random(80);
        
        // Store token
        $user->api_token = $token;
        $user->save();

        // Load user permissions
        $user->load('roles.permissions');
        
        // Get all permissions
        $permissions = [];
        foreach ($user->roles as $role) {
            foreach ($role->permissions as $permission) {
                $permKey = $permission->module . '-' . $permission->action;
                $permissions[$permKey] = true;
            }
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
            'permissions' => $permissions,
            'message' => 'Login successful'
        ], 200);
    }

    /**
     * Logout user (revoke the token)
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        
        // Revoke token
        $user->api_token = null;
        $user->save();

        return response()->json([
            'message' => 'Successfully logged out'
        ], 200);
    }
    
    /**
     * Get the authenticated user
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function user(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Load relations
        $user->load([
            'roles.permissions', 
            'sectionRelation', 
            'sectionsGerées',
            'interventions',
            'planifications'
        ]);
        
        // Get all permissions
        $permissions = [];
        foreach ($user->roles as $role) {
            foreach ($role->permissions as $permission) {
                $permKey = $permission->module . '-' . $permission->action;
                $permissions[$permKey] = true;
            }
        }
        
        return response()->json([
            'user' => $user,
            'permissions' => $permissions
        ], 200);
    }
    
    /**
     * Check if a user has specific permissions
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function checkPermissions(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'permissions' => 'required|array',
            'permissions.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        // Load relations
        $user->load('roles.permissions');
        
        // Get all user permissions
        $userPermissions = [];
        foreach ($user->roles as $role) {
            foreach ($role->permissions as $permission) {
                $permKey = $permission->module . '-' . $permission->action;
                $userPermissions[$permKey] = true;
            }
        }
        
        // Check requested permissions
        $result = [];
        foreach ($request->permissions as $permission) {
            $result[$permission] = isset($userPermissions[$permission]);
        }
        
        return response()->json([
            'permissions' => $result
        ], 200);
    }
}